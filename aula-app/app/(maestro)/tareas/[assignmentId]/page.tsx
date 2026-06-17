import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssignmentDetail } from "@/lib/data/maestro";
import { AssignmentClient } from "./assignment-client";

export const metadata = { title: "Tarea" };

export default async function TareaPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;
  const detail = await getAssignmentDetail(assignmentId);
  if (!detail) notFound();
  return (
    <main className="px-5 pt-6 md:px-8 md:pt-10">
      <Link href="/tareas" className="text-sm text-ink-soft">← Tareas</Link>
      <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">{detail.assignment.title}</h1>
      <p className="mb-5 text-sm text-ink-soft">{[detail.assignment.subject, detail.assignment.due_date && `Entrega ${detail.assignment.due_date}`].filter(Boolean).join(" · ")}</p>
      <AssignmentClient assignmentId={assignmentId} students={detail.students} />
    </main>
  );
}
