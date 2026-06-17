import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudentProfile } from "@/lib/data/maestro";
import { Card } from "@/components/ui/card";
import { NotesClient } from "./notes-client";

export const metadata = { title: "Alumno" };

export default async function AlumnoPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const data = await getStudentProfile(studentId);
  if (!data) notFound();
  const { student, health, notes, summary } = data;

  return (
    <main className="px-5 pt-6 md:px-8 md:pt-10">
      <Link href="/inicio" className="text-sm text-ink-soft">← Inicio</Link>
      <header className="mb-5 mt-2 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-soft font-display text-xl font-extrabold text-indigo-dark">
          {student.fullName.charAt(0)}
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">{student.fullName}</h1>
          <p className="text-sm text-ink-soft">{student.groupName ?? "Sin grupo"}</p>
        </div>
      </header>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Card className="text-center"><p className="tabular font-display text-2xl font-extrabold text-green">{summary.presente}</p><p className="text-xs text-ink-soft">Presente</p></Card>
        <Card className="text-center"><p className="tabular font-display text-2xl font-extrabold text-gold">{summary.tardanza}</p><p className="text-xs text-ink-soft">Tardanzas</p></Card>
        <Card className="text-center"><p className="tabular font-display text-2xl font-extrabold text-red">{summary.falta}</p><p className="text-xs text-ink-soft">Faltas</p></Card>
      </div>

      {(health || student.birthdate) && (
        <Card className="mb-5">
          <p className="mb-2 font-display font-bold text-ink">Ficha</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {student.birthdate && <p className="text-ink-soft">Nacimiento: <span className="text-ink">{student.birthdate}</span></p>}
            {health?.blood_type && <p className="text-ink-soft">Sangre: <span className="text-ink">{health.blood_type}</span></p>}
            {health?.allergies && <p className="col-span-2 text-ink-soft">Alergias: <span className="text-ink">{health.allergies}</span></p>}
            {health?.conditions && <p className="col-span-2 text-ink-soft">Condiciones: <span className="text-ink">{health.conditions}</span></p>}
            {health?.emergency_phone && <p className="col-span-2 text-ink-soft">Emergencia: <span className="text-ink">{health.emergency_contact} · {health.emergency_phone}</span></p>}
          </div>
        </Card>
      )}

      <h2 className="mb-2 font-display text-lg font-bold text-ink">Anotaciones de desempeño</h2>
      <NotesClient studentId={studentId} initial={notes} />
    </main>
  );
}
