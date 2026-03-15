export const dynamic = "force-dynamic";

import {
  getTimeSlots,
  deleteTimeSlot,
  updateTimeSlot,
} from "@/actions/timeslots";
import { TimeSlotForm } from "@/components/admin/TimeSlotForm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function TimeSlotsPage() {
  const timeSlots = await getTimeSlots();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">הגדרת שעות</h1>
        <TimeSlotForm
          trigger={<Button>הוספת שעה</Button>}
          nextOrderIndex={timeSlots.length}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>תיאור</TableHead>
            <TableHead>שעת התחלה</TableHead>
            <TableHead>שעת סיום</TableHead>
            <TableHead>סטטוס</TableHead>
            <TableHead>פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeSlots.map((slot) => (
            <TableRow key={slot.id}>
              <TableCell>{slot.label}</TableCell>
              <TableCell dir="ltr">{slot.startTime}</TableCell>
              <TableCell dir="ltr">{slot.endTime}</TableCell>
              <TableCell>
                <form
                  action={async () => {
                    "use server";
                    await updateTimeSlot(slot.id, {
                      isActive: !slot.isActive,
                    });
                  }}
                >
                  <button type="submit">
                    <Badge variant={slot.isActive ? "default" : "secondary"}>
                      {slot.isActive ? "פעיל" : "לא פעיל"}
                    </Badge>
                  </button>
                </form>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <TimeSlotForm
                    timeSlot={slot}
                    trigger={
                      <Button variant="outline" size="sm">
                        עריכה
                      </Button>
                    }
                  />
                  <form
                    action={async () => {
                      "use server";
                      await deleteTimeSlot(slot.id);
                    }}
                  >
                    <Button variant="destructive" size="sm" type="submit">
                      מחיקה
                    </Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
