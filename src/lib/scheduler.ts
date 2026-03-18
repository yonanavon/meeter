import { prisma } from "./prisma";
import { whatsapp } from "./whatsapp";

let intervalId: ReturnType<typeof setInterval> | null = null;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

async function tick() {
  try {
    if (whatsapp.getStatus() !== "connected") return;

    const rules = await prisma.reminderRule.findMany({
      where: { enabled: true },
      include: { sticker: true },
    });
    if (rules.length === 0) return;

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // Get today's assignments that have a WhatsApp group
    const assignments = await prisma.assignment.findMany({
      where: {
        date: todayStr,
        class: { whatsappJid: { not: null } },
      },
      include: { class: true, timeSlot: true },
    });

    if (assignments.length === 0) return;

    for (const rule of rules) {
      for (const assignment of assignments) {
        if (!assignment.class.whatsappJid) continue;

        const slotMinutes = timeToMinutes(assignment.timeSlot.startTime);
        const triggerAt = slotMinutes - rule.minutesBefore;

        // Send if we're past the trigger time but not past the lesson start
        if (nowMinutes < triggerAt || nowMinutes >= slotMinutes) continue;

        // Check if already sent
        const existing = await prisma.reminderLog.findUnique({
          where: {
            assignmentId_ruleId: {
              assignmentId: assignment.id,
              ruleId: rule.id,
            },
          },
        });
        if (existing) continue;

        try {
          const buffer = Buffer.from(rule.sticker.base64, "base64");
          await whatsapp.sendSticker(assignment.class.whatsappJid, buffer);

          await prisma.reminderLog.create({
            data: {
              assignmentId: assignment.id,
              ruleId: rule.id,
              groupJid: assignment.class.whatsappJid,
            },
          });
          console.log(
            `[Scheduler] Sent reminder for assignment ${assignment.id}, rule "${rule.label}"`
          );
        } catch (err) {
          console.error(
            `[Scheduler] Failed to send sticker for assignment ${assignment.id}:`,
            err
          );
        }
      }
    }
  } catch (err) {
    console.error("[Scheduler] Error:", err);
  }
}

export function startScheduler() {
  if (intervalId) return;
  console.log("[Scheduler] Started (60s interval)");
  intervalId = setInterval(tick, 60_000);
  // Run first tick after a short delay
  setTimeout(tick, 5_000);
}
