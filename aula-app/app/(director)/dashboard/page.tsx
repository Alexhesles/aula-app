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
    <main>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Hola, {user?.fullName?.split(" ")[0] ?? "director"}
        </h1>
        <p className="text-sm text-ink-soft">Resumen de tu escuela hoy</p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <p className="font-display text-3xl font-extrabold text-indigo">{k.value}</p>
            <p className="mt-1 text-sm text-ink-soft">{k.label}</p>
          </Card>
        ))}
      </div>

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
