export const dynamic = "force-dynamic";

import { getClasses, deleteClass } from "@/actions/classes";
import { ClassForm } from "@/components/admin/ClassForm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ClassesPage() {
  const classes = await getClasses();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ניהול כיתות</h1>
        <ClassForm trigger={<Button>הוספת כיתה</Button>} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>מספר</TableHead>
            <TableHead>שם</TableHead>
            <TableHead>פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((cls) => (
            <TableRow key={cls.id}>
              <TableCell>{cls.number}</TableCell>
              <TableCell>{cls.name}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <ClassForm
                    classData={cls}
                    trigger={<Button variant="outline" size="sm">עריכה</Button>}
                  />
                  <form
                    action={async () => {
                      "use server";
                      await deleteClass(cls.id);
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
