import { notFound } from "next/navigation";
import { getGroup } from "@/lib/data/groups";
import { getGroupStudents } from "@/lib/data/students";
import { getAttendanceForDate } from "@/lib/data/attendance";
import { EmptyState } from "@/components/ui/empty-state";
import { AttendanceClient } from "./attendance-client";

export const metadata = { title: "Pase de lista" };

export default async function PaseDeListaPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const group = await getGroup(groupId);
  if (!group) notFound();

  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local
  const [students, initial] = await Promise.all([
    getGroupStudents(groupId),
    getAttendanceForDate(groupId, today),
  ]);

  if (students.length === 0) {
    return (
      <main className="px-5 pt-8">
        <h1 className="mb-4 font-display text-2xl font-extrabold text-ink">
          {group.name}
        </h1>
        <EmptyState
          title="Este grupo no tiene alumnos"
          description="Cuando se agreguen alumnos al grupo, podrás pasar lista."
        />
      </main>
    );
  }

  return (
    <AttendanceClient
      groupId={groupId}
      groupName={group.name}
      date={today}
      students={students}
      initial={initial}
    />
  );
}
