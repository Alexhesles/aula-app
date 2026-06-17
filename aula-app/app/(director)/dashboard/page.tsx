import { getSchoolStats, getSchoolGroups, getRecentLogs } from "@/lib/data/director";
import { getCurrentUser } from "@/lib/auth/get-user";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";

export const metadata = { title: "Resumen" };

const TYPE_META: Record<string, { label: string; tone: any }> = {
  logro: { label: "Logro", tone: "green" },
  incidente: { label: "Incidente", tone: "red" },
  academico: { label: "Académico", tone: "indigo" },
};

export default async function DashboardPage() {
  const [user, stats, groups, logs] = await Promise.all([
    getCurrentUser(),
    getSchoolStats(),
    getSchoolGroups(),
    getRecentLogs(8),
  ]);

  const kpis = [
    { label: "Grupos", value: stats.groups },
    { label: "Alumnos", value: stats.students },
    { label: "Asistencias hoy", value: stats.attendanceTakenToday },
  ];

  return (
    <main className="animate-rise">
      {/* Héroe con KPIs */}
      <section className="glow-hero relative overflow-hidden rounded-card bg-ink-gradient p-6 md:p-8">
        <p className="text-sm font-medium text-white/60">Resumen de tu escuela hoy</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-white md:text-3xl">
          Hola, {user?.fullName?.split(" ")[0] ?? "director"}
        </h1>
        <div className="mt-6 flex gap-8">
          {kpis.map((k, i) => (
            <div key={k.label} className={i > 0 ? "border-l border-white/15 pl-8" : ""}>
              <p className="tabular font-display text-3xl font-extrabold text-white">{k.value}</p>
              <p className="mt-0.5 text-xs text-white/60">{k.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grupos */}
      <section id="grupos" className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Grupos</h2>
        {groups.length === 0 ? (
          <Card><p className="text-sm text-ink-soft">Aún no hay grupos registrados.</p></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {groups.map((g) => (
              <Card key={g.id} className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-ink">{g.name}</p>
                  <p className="text-sm text-ink-soft">{g.room ? `Salón ${g.room}` : "Grupo"}</p>
                </div>
                <span className="font-display text-sm font-bold text-ink">{g.studentCount} alumnos</span>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Bitácora reciente */}
      <section id="bitacora" className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Bitácora reciente</h2>
        {logs.length === 0 ? (
          <Card><p className="text-sm text-ink-soft">Sin entradas todavía.</p></Card>
        ) : (
          <div className="space-y-2">
            {logs.map((l) => {
              const meta = TYPE_META[l.type] ?? TYPE_META.academico;
              return (
                <Card key={l.id} className="flex items-start gap-3 py-3">
                  <Pill tone={meta.tone}>{meta.label}</Pill>
                  <div className="flex-1">
                    <p className="text-sm text-ink">{l.text}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {[l.studentName, l.groupName].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
