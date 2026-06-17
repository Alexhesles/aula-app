import { getZoneOverview } from "@/lib/data/supervisor";
import { getCurrentUser } from "@/lib/auth/get-user";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Zona escolar" };

export default async function ZonaPage() {
  const [user, schools] = await Promise.all([getCurrentUser(), getZoneOverview()]);

  const totals = schools.reduce(
    (acc, s) => ({
      students: acc.students + s.students,
      groups: acc.groups + s.groups,
      incidents: acc.incidents + s.incidentsWeek,
    }),
    { students: 0, groups: 0, incidents: 0 }
  );

  return (
    <main className="animate-rise">
      <section className="glow-hero relative overflow-hidden rounded-card bg-ink-gradient p-6 md:p-8">
        <p className="text-sm font-medium text-white/60">Resumen de tu zona escolar</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-white md:text-3xl">
          Hola, {user?.fullName?.split(" ")[0] ?? "supervisor"}
        </h1>
        <div className="mt-6 flex gap-8">
          <div>
            <p className="tabular font-display text-3xl font-extrabold text-white">{schools.length}</p>
            <p className="mt-0.5 text-xs text-white/60">Escuelas</p>
          </div>
          <div className="border-l border-white/15 pl-8">
            <p className="tabular font-display text-3xl font-extrabold text-white">{totals.students}</p>
            <p className="mt-0.5 text-xs text-white/60">Alumnos</p>
          </div>
          <div className="border-l border-white/15 pl-8">
            <p className="tabular font-display text-3xl font-extrabold text-white">{totals.incidents}</p>
            <p className="mt-0.5 text-xs text-white/60">Incidentes (7 días)</p>
          </div>
        </div>
      </section>

      <h2 className="mb-3 mt-8 font-display text-lg font-bold text-ink">Escuelas</h2>
      {schools.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">
            Aún no tienes escuelas asignadas. Un administrador debe vincular tus escuelas a tu cuenta de supervisor.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {schools.map((s) => (
            <Card key={s.schoolId}>
              <div className="flex items-center justify-between">
                <p className="font-display font-bold text-ink">{s.schoolName}</p>
                {s.incidentsWeek > 0 && (
                  <span className="rounded-pill bg-red-soft px-2 py-0.5 text-xs font-semibold text-red">
                    {s.incidentsWeek} incidentes
                  </span>
                )}
              </div>
              <div className="mt-2 flex gap-5 text-sm text-ink-soft">
                <span>{s.groups} grupos</span>
                <span>{s.students} alumnos</span>
                <span>{s.attendanceToday} asistencias hoy</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
