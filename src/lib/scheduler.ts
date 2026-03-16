import { prisma } from "./prisma";
import { whatsapp } from "./whatsapp";

let intervalId: ReturnType<typeof setInterval> | null = null;

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

    for (const rule of rules) {
      // Calculate target start time = now + minutesBefore
      const targetDate = new Date(now.getTime() + rule.minutesBefore * 60_000);
      const targetHH = String(targetDate.getHours()).padStart(2, "0");
      const targetMM = String(targetDate.getMinutes()).padStart(2, "0");
      const targetTime = `${targetHH}:${targetMM}`;

      const assignments = await prisma.assignment.findMany({
        where: {
          date: todayStr,
          timeSlot: { startTime: targetTime },
          class: { whatsappJid: { not: null } },
        },
        include: { class: true, timeSlot: true },
      });

      for (const assignment of assignments) {
        if (!assignment.class.whatsappJid) continue;

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
