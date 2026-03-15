import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6 flex gap-4 border-b pb-3">
        <Link
          href="/admin/teachers"
          className="text-sm font-medium hover:text-primary"
        >
          מורים
        </Link>
        <Link
          href="/admin/classes"
          className="text-sm font-medium hover:text-primary"
        >
          כיתות
        </Link>
        <Link
          href="/admin/timeslots"
          className="text-sm font-medium hover:text-primary"
        >
          שעות
        </Link>
      </div>
      {children}
    </div>
  );
}
