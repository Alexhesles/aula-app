import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getHomeGroups } from "@/lib/data/groups";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Inicio" };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

const GRADE_TONES = ["bg-indigo", "bg-coral", "bg-green", "bg-sky", "bg-gold"];

export default async function InicioPage() {
  const user = await getCurrentUser();

  // Enrutamiento por rol.
  if (!user?.role) redirect("/bienvenida");
  if (user.role === "director") redirect("/dashboard");
  if (user.role === "padre") redirect("/familia");
  if (user.role === "supervisor") redirect("/zona");

  const groups = await getHomeGroups();
  const firstName = user.fullName?.split(" ")[0] ?? "";

  const totalStudents = groups.reduce((a, g) => a + g.studentCount, 0);
  const pending = groups.filter((g) => !g.attendanceTodayDone).length;
  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="animate-rise px-5 pt-6 md:px-8 md:pt-10">
      {/* Héroe */}
      <section className="glow-hero relative overflow-hidden rounded-card bg-brand-gradient p-6 md:p-8">
        <p className="text-sm font-medium text-white/70 capitalize">{today}</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-white md:text-3xl">
          {greeting()}{firstName ? `, ${firstName}` : ""} 👋
        </h1>
        <div className="mt-5 flex gap-6">
          <div>
            <p className="tabular font-display text-2xl font-extrabold text-white">{groups.length}</p>
            <p className="text-xs text-white/70">{groups.length === 1 ? "Grupo" : "Grupos"}</p>
          </div>
          <div className="border-l border-white/20 pl-6">
            <p className="tabular font-display text-2xl font-extrabold text-white">{totalStudents}</p>
            <p className="text-xs text-white/70">Alumnos</p>
          </div>
          <div className="border-l border-white/20 pl-6">
            <p className="tabular font-display text-2xl font-extrabold text-white">{pending}</p>
            <p className="text-xs text-white/70">Listas pendientes</p>
          </div>
        </div>
      </section>

      {/* Grupos */}
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Tus grupos</h2>
          <Link href="/nuevo-grupo" className="text-sm font-semibold text-indigo">+ Nuevo grupo</Link>
        </div>

        {groups.length === 0 ? (
          <EmptyState
            title="Aún no tienes grupos"
            description="Crea tu primer grupo para empezar a pasar lista."
            action={
              <Link href="/nuevo-grupo">
                <span className="inline-flex h-11 items-center rounded-btn bg-indigo px-5 font-display text-sm font-semibold text-white">
                  Crear grupo
                </span>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {groups.map((g, i) => (
              <Card key={g.id} className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] font-display text-base font-extrabold text-white ${GRADE_TONES[i % GRADE_TONES.length]}`}>
                    {g.grade ? `${g.grade}°` : g.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-bold text-ink">{g.name}</p>
                    <p className="text-sm text-ink-soft">
                      {g.studentCount} {g.studentCount === 1 ? "alumno" : "alumnos"}
                      {g.room ? ` · Salón ${g.room}` : ""}
                    </p>
                  </div>
                  {g.attendanceTodayDone ? (
                    <span className="shrink-0 rounded-pill bg-green-soft px-2.5 py-1 text-xs font-semibold text-green">
                      Lista ✓
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-pill bg-gold-soft px-2.5 py-1 text-xs font-semibold text-gold">
                      Pendiente
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/asistencia/${g.id}`}
                    className="flex h-10 flex-1 items-center justify-center rounded-btn bg-indigo font-display text-sm font-semibold text-white transition-colors hover:bg-indigo-dark"
                  >
                    Pasar lista
                  </Link>
                  <Link
                    href={`/grupo/${g.id}`}
                    className="flex h-10 items-center justify-center rounded-btn border border-border px-3 text-sm font-medium text-ink-soft transition-colors hover:border-indigo-mid hover:text-indigo"
                  >
                    Administrar
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Accesos rápidos */}
      <section className="mt-7">
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Atajos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: "/bitacora/nueva", label: "Nueva entrada", sub: "Bitácora", tone: "bg-coral-soft text-coral" },
            { href: "/plan", label: "Plan SEP", sub: "Avance", tone: "bg-indigo-soft text-indigo-dark" },
            { href: "/curriculo", label: "Currículo", sub: "Contenidos", tone: "bg-green-soft text-green" },
            { href: "/calendario", label: "Calendario", sub: "SEP", tone: "bg-sky-soft text-sky" },
          ].map((q) => (
            <Link key={q.href} href={q.href}>
              <Card hover className="h-full p-4">
                <span className={`mb-2 inline-flex rounded-pill px-2 py-0.5 text-[11px] font-semibold ${q.tone}`}>
                  {q.sub}
                </span>
                <p className="font-display text-sm font-bold text-ink">{q.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
