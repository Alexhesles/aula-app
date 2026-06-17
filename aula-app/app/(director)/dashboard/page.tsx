import Link from "next/link";
import { getSchoolStats, getSchoolGroupsRich, getIncidents } from "@/lib/data/director";
import { getUpcomingEvents } from "@/lib/data/calendar";
import { getCurrentUser } from "@/lib/auth/get-user";
import { Card } from "@/components/ui/card";
import { IncidentsClient } from "./incidents-client";

export const metadata = { title: "Resumen" };

export default async function DashboardPage() {
  const [user, stats, groups, incidents, upcoming] = await Promise.all([
    getCurrentUser(),
    getSchoolStats(),
    getSchoolGroupsRich(),
    getIncidents(12),
    getUpcomingEvents(4),
  ]);

  const withPct = groups.filter((g) => g.curriculumPct !== null);
  const avgCurriculum = withPct.length
    ? Math.round(withPct.reduce((a, g) => a + (g.curriculumPct ?? 0), 0) / withPct.length)
    : null;
  const tookToday = groups.filter((g) => g.attendanceToday > 0).length;

  const kpis = [
    { label: "Grupos", value: stats.groups },
    { label: "Alumnos", value: stats.students },
    { label: "Listas hoy", value: `${tookToday}/${groups.length}` },
    { label: "Currículo", value: avgCurriculum === null ? "—" : `${avgCurriculum}%` },
  ];

  return (
    <div className="animate-rise">
      {/* Héroe con KPIs */}
      <section className="glow-hero relative overflow-hidden rounded-card bg-ink-gradient p-6 md:p-8">
        <p className="text-sm font-medium text-white/60">Resumen de tu escuela hoy</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-white md:text-3xl">
          Hola, {user?.fullName?.split(" ")[0] ?? "director"}
        </h1>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
          {kpis.map((k, i) => (
            <div key={k.label} className={i > 0 ? "border-l border-white/15 pl-8" : ""}>
              <p className="tabular font-display text-2xl font-extrabold text-white md:text-3xl">{k.value}</p>
              <p className="mt-0.5 text-xs text-white/60">{k.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-7 grid gap-7 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-7">
          {/* Grupos */}
          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Grupos</h2>
            {groups.length === 0 ? (
              <Card><p className="text-sm text-ink-soft">Aún no hay grupos registrados.</p></Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {groups.map((g) => (
                  <Link key={g.id} href={`/escuela/${g.id}`}>
                    <Card hover className="h-full">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display font-bold text-ink">{g.name}</p>
                          <p className="text-sm text-ink-soft">
                            {g.grade ? `${g.grade}° · ` : ""}{g.studentCount} alumnos
                          </p>
                        </div>
                        {g.attendanceToday > 0 ? (
                          <span className="rounded-pill bg-green-soft px-2 py-0.5 text-xs font-semibold text-green">Lista ✓</span>
                        ) : (
                          <span className="rounded-pill bg-gold-soft px-2 py-0.5 text-xs font-semibold text-gold">Pendiente</span>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted">
                          <span>Avance currículo</span>
                          <span className="tabular font-semibold text-ink-soft">{g.curriculumPct === null ? "—" : `${g.curriculumPct}%`}</span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-pill bg-bg">
                          <div className="h-full rounded-pill bg-indigo" style={{ width: `${g.curriculumPct ?? 0}%` }} />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Incidencias */}
          <section id="bitacora">
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Incidencias por revisar</h2>
            <IncidentsClient initial={incidents} />
          </section>
        </div>

        {/* Columna lateral */}
        <div className="space-y-7">
          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Próximas fechas SEP</h2>
            <Card className="space-y-3">
              {upcoming.length === 0 ? (
                <p className="text-sm text-ink-soft">Sin fechas próximas.</p>
              ) : (
                upcoming.map((e) => {
                  const d = new Date(e.date + "T12:00:00");
                  return (
                    <div key={e.id} className="flex gap-3">
                      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] bg-indigo-soft">
                        <span className="font-display text-sm font-extrabold text-indigo-dark leading-none">{d.getDate()}</span>
                        <span className="text-[10px] uppercase text-indigo-dark/70">{d.toLocaleDateString("es-MX", { month: "short" })}</span>
                      </div>
                      <p className="text-sm text-ink">{e.title}</p>
                    </div>
                  );
                })
              )}
              <Link href="/calendario" className="block pt-1 text-sm font-medium text-indigo">Ver calendario completo →</Link>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
