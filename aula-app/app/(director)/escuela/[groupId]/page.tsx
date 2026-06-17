import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getGroupDetailForDirector } from "@/lib/data/director";
import { getAttendanceHistory } from "@/lib/data/attendance";
import { Card } from "@/components/ui/card";
import { RegisterClient } from "./register-client";

export const metadata = { title: "Grupo" };

export default async function EscuelaGrupoPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const [user, detail, history] = await Promise.all([
    getCurrentUser(),
    getGroupDetailForDirector(groupId),
    getAttendanceHistory(groupId, 10),
  ]);
  if (!detail) notFound();
  const { group, students, curriculumPct, subjects } = detail;

  return (
    <div className="animate-rise">
      <Link href="/dashboard" className="text-sm text-ink-soft">← Resumen</Link>
      <header className="mb-5 mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">{group.name}</h1>
          <p className="text-sm text-ink-soft">
            {group.grade ? `${group.grade}° grado · ` : ""}{students.length} alumnos
            {group.room ? ` · Salón ${group.room}` : ""}
          </p>
        </div>
        <RegisterClient schoolId={user?.schoolId ?? null} groupId={groupId} />
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Currículo por materia */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Avance curricular</h2>
            <span className="tabular font-display font-bold text-indigo">{curriculumPct === null ? "—" : `${curriculumPct}%`}</span>
          </div>
          {subjects.length === 0 ? (
            <Card><p className="text-sm text-ink-soft">Asigna el grado del grupo para ver el avance SEP.</p></Card>
          ) : (
            <Card className="space-y-3">
              {subjects.map((s) => {
                const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
                return (
                  <div key={s.subject}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink">{s.subject}</span>
                      <span className="tabular text-ink-soft">{s.done}/{s.total}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-pill bg-bg">
                      <div className="h-full rounded-pill bg-indigo" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </section>

        {/* Historial de asistencia */}
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-ink">Asistencia reciente</h2>
          {history.length === 0 ? (
            <Card><p className="text-sm text-ink-soft">Aún no se ha registrado asistencia.</p></Card>
          ) : (
            <Card className="divide-y divide-border p-0">
              {history.map((d) => {
                const date = new Date(d.date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
                return (
                  <div key={d.date} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm capitalize text-ink">{date}</span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-green">{d.presente} P</span>
                      <span className="text-gold">{d.tardanza} T</span>
                      <span className="text-red">{d.falta} F</span>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </section>
      </div>

      {/* Alumnos */}
      <section className="mt-6">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Alumnos</h2>
        {students.length === 0 ? (
          <Card><p className="text-sm text-ink-soft">Sin alumnos registrados.</p></Card>
        ) : (
          <Card className="grid gap-x-6 gap-y-1 p-5 sm:grid-cols-2">
            {students.map((s, i) => (
              <div key={s.id} className="flex gap-3 py-1 text-sm">
                <span className="w-5 text-muted">{i + 1}</span>
                <span className="text-ink">{s.full_name}</span>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
