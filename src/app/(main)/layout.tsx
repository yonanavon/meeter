import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="border-b bg-white">
        <div className="container mx-auto flex items-center gap-6 px-4 py-3">
          <Link href="/schedule" className="text-lg font-bold">
            Meeter
          </Link>
          <div className="flex gap-4">
            <Link
              href="/schedule"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              מערכת שעות
            </Link>
            <Link
              href="/admin/teachers"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ניהול
            </Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">{children}</main>
    </>
  );
}
