export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function LogsPage() {
  const logs = await prisma.reminderLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 100,
    include: {
      rule: { include: { sticker: true } },
      assignment: { include: { class: true, teacher: true, timeSlot: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">לוג תזכורות</h1>
      {logs.length === 0 ? (
        <p className="text-muted-foreground">אין תזכורות שנשלחו עדיין.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>נשלח ב</TableHead>
              <TableHead>כיתה</TableHead>
              <TableHead>קבוצה</TableHead>
              <TableHead>מורה</TableHead>
              <TableHead>שעה</TableHead>
              <TableHead>כלל</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {new Date(log.sentAt).toLocaleString("he-IL")}
                </TableCell>
                <TableCell>{log.assignment.class.name}</TableCell>
                <TableCell className="text-xs" dir="ltr">
                  {log.groupJid.replace("@g.us", "")}
                </TableCell>
                <TableCell>{log.assignment.teacher.name}</TableCell>
                <TableCell>
                  {log.assignment.timeSlot.startTime}–{log.assignment.timeSlot.endTime}
                </TableCell>
                <TableCell>
                  {log.rule.label} ({log.rule.minutesBefore} דק׳ לפני)
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
