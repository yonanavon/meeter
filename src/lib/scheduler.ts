import { prisma } from "./prisma";
import { whatsapp } from "./whatsapp";

let intervalId: ReturnType<typeof setInterval> | null = null;

const TIMEZONE = "Asia/Jerusalem";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getNowInIsrael() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((p) => [p.type, p.value])
  );
  return {
    todayStr: `${parts.year}-${parts.month}-${parts.day}`,
    nowMinutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

async function tick() {
  try {
    const waStatus = whatsapp.getStatus();
    if (waStatus !== "connected") {
      console.log(`[Scheduler] Skipping tick — WA status: ${waStatus}`);
      return;
    }

    const rules = await prisma.reminderRule.findMany({
      where: { enabled: true },
      include: { sticker: true },
    });
    if (rules.length === 0) {
      console.log("[Scheduler] No enabled rules");
      return;
    }

    const { todayStr, nowMinutes } = getNowInIsrael();

    // Get today's assignments that have a WhatsApp group
    const assignments = await prisma.assignment.findMany({
      where: {
        date: todayStr,
        class: { whatsappJid: { not: null } },
      },
      include: { class: true, timeSlot: true },
    });

    if (assignments.length === 0) {
      console.log(`[Scheduler] No assignments for ${todayStr} with WA group`);
      return;
    }

    console.log(
      `[Scheduler] Tick: ${todayStr} ${Math.floor(nowMinutes / 60)}:${String(nowMinutes % 60).padStart(2, "0")} — ${rules.length} rules, ${assignments.length} assignments`
    );

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
