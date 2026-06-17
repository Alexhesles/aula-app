import Link from "next/link";
import { getSchoolGroupsZone, getSchoolTeachers, getSupervisorNotes, getSchoolName } from "@/lib/data/supervisor";
import { Card } from "@/components/ui/card";
import { NotesVisitClient } from "./notes-visit-client";

export const metadata = { title: "Escuela" };

export default async function EscuelaZonaPage({ params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await params;
  const [name, groups, teachers, notes] = await Promise.all([
    getSchoolName(schoolId), getSchoolGroupsZone(schoolId), getSchoolTeachers(schoolId), getSupervisorNotes(schoolId),
  ]);

  function ago(ts: string | null) {
    if (!ts) return "Sin actividad";
    const days = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
    if (days <= 0) return "Hoy";
    if (days === 1) return "Ayer";
    return `Hace ${days} días`;
  }

  return (
    <div className="animate-rise">
      <Link href="/zona" className="text-sm text-ink-soft">← Escuelas</Link>
      <h1 className="mb-5 mt-2 font-display text-2xl font-extrabold text-ink">{name}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grupos por grado */}
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-ink">Grupos · currículo y asistencia</h2>
          {groups.length === 0 ? <Card><p className="text-sm text-ink-soft">Sin grupos.</p></Card> : (
            <div className="space-y-2">
              {groups.map((g) => (
                <Card key={g.groupId}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-ink">{g.grade ? `${g.grade}° · ` : ""}{g.name}</p>
                    <span className="text-xs text-muted">{g.students} alumnos · {g.attendanceToday} hoy</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-pill bg-bg"><div className="h-full rounded-pill bg-indigo" style={{ width: `${g.curriculumPct ?? 0}%` }} /></div>
                    <span className="tabular text-xs font-semibold text-ink-soft">{g.curriculumPct === null ? "—" : `${g.curriculumPct}%`}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Actividad docente */}
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-ink">Actividad docente</h2>
          {teachers.length === 0 ? <Card><p className="text-sm text-ink-soft">Sin maestros registrados.</p></Card> : (
            <Card className="divide-y divide-border p-0">
              {teachers.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-ink">{t.name ?? "Maestro"}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={t.attendanceToday > 0 ? "text-green" : "text-muted"}>{t.attendanceToday > 0 ? "Pasó lista hoy" : "Sin lista hoy"}</span>
                    <span className="text-muted">{ago(t.lastActive)}</span>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </section>
      </div>

      <div className="mt-7">
        <NotesVisitClient schoolId={schoolId} initialNotes={notes} />
      </div>
    </div>
  );
}
