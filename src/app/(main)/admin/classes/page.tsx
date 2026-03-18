export const dynamic = "force-dynamic";

import { getClasses } from "@/actions/classes";
import { ClassForm } from "@/components/admin/ClassForm";
import { ClassesTable } from "@/components/admin/ClassesTable";
import { Button } from "@/components/ui/button";

export default async function ClassesPage() {
  const classes = await getClasses();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ניהול כיתות</h1>
        <ClassForm trigger={<Button>הוספת כיתה</Button>} />
      </div>
      <ClassesTable classes={classes} />
    </div>
  );
}
