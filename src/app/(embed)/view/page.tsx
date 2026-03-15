export const dynamic = "force-dynamic";

import { ClassScheduleView } from "@/components/view/ClassScheduleView";

export default async function ViewPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; date?: string }>;
}) {
  const params = await searchParams;
  const classNumber = params.class || "1";
  const date = params.date || new Date().toISOString().split("T")[0];

  return <ClassScheduleView classNumber={classNumber} date={date} />;
}
