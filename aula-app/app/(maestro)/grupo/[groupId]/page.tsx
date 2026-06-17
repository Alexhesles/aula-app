import Link from "next/link";
import { notFound } from "next/navigation";
import { getGroup } from "@/lib/data/groups";
import { getGroupStudents } from "@/lib/data/students";
import { ManageClient } from "./manage-client";

export const metadata = { title: "Administrar grupo" };

export default async function GrupoPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const group = await getGroup(groupId);
  if (!group) notFound();

  const students = await getGroupStudents(groupId);

  return (
    <main className="px-5 pt-8">
      <header className="mb-5">
        <h1 className="font-display text-2xl font-extrabold text-ink">{group.name}</h1>
        <p className="text-sm text-ink-soft">
          {students.length} {students.length === 1 ? "alumno" : "alumnos"}
        </p>
      </header>

      <ManageClient groupId={groupId} students={students} grade={group.grade} />

      <Link
        href={`/asistencia/${groupId}`}
        className="mt-5 block text-center text-sm font-medium text-indigo"
      >
        Ir a pasar lista →
      </Link>
    </main>
  );
}
