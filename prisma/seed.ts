import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Teachers
  await prisma.teacher.createMany({
    data: [
      { name: "שרה כהן", meetingLink: "https://meet.google.com/abc-defg-hij" },
      { name: "דוד לוי", meetingLink: "https://zoom.us/j/123456789" },
      { name: "רחל ישראלי", meetingLink: "https://meet.google.com/klm-nopq-rst" },
      { name: "משה אברהם", meetingLink: "https://zoom.us/j/987654321" },
      { name: "מרים חיים", meetingLink: "https://meet.google.com/uvw-xyza-bcd" },
    ],
  });

  // Classes
  await prisma.class.createMany({
    data: [
      { name: 'כיתה א׳', number: 1 },
      { name: 'כיתה ב׳', number: 2 },
      { name: 'כיתה ג׳', number: 3 },
      { name: 'כיתה ד׳', number: 4 },
      { name: 'כיתה ה׳', number: 5 },
    ],
  });

  // Time Slots
  await prisma.timeSlot.createMany({
    data: [
      { label: "שיעור 1", startTime: "08:00", endTime: "08:45", orderIndex: 0 },
      { label: "שיעור 2", startTime: "08:50", endTime: "09:35", orderIndex: 1 },
      { label: "שיעור 3", startTime: "09:50", endTime: "10:35", orderIndex: 2 },
      { label: "שיעור 4", startTime: "10:40", endTime: "11:25", orderIndex: 3 },
      { label: "שיעור 5", startTime: "11:30", endTime: "12:15", orderIndex: 4 },
      { label: "שיעור 6", startTime: "12:30", endTime: "13:15", orderIndex: 5 },
    ],
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
