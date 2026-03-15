export const dynamic = "force-dynamic";

import { getTeachers, deleteTeacher } from "@/actions/teachers";
import { TeacherForm } from "@/components/admin/TeacherForm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ניהול מורים</h1>
        <TeacherForm trigger={<Button>הוספת מורה</Button>} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>שם</TableHead>
            <TableHead>קישור למפגש</TableHead>
            <TableHead>פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>{teacher.name}</TableCell>
              <TableCell dir="ltr" className="text-right">
                {teacher.meetingLink || "—"}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <TeacherForm
                    teacher={teacher}
                    trigger={<Button variant="outline" size="sm">עריכה</Button>}
                  />
                  <form
                    action={async () => {
                      "use server";
                      await deleteTeacher(teacher.id);
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
