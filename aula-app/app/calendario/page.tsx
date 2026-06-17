import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getCalendar } from "@/lib/data/calendar";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Calendario SEP" };

const KIND_META: Record<string, { label: string; cls: string }> = {
  inicio: { label: "Inicio", cls: "bg-green-soft text-green" },
  fin: { label: "Fin", cls: "bg-indigo-soft text-indigo-dark" },
  suspension: { label: "Suspensión", cls: "bg-red-soft text-red" },
  cte: { label: "Consejo Técnico", cls: "bg-gold-soft text-gold" },
  vacaciones: { label: "Vacaciones", cls: "bg-sky-soft text-sky" },
  receso: { label: "Receso", cls: "bg-sky-soft text-sky" },
  evaluacion: { label: "Evaluación", cls: "bg-coral-soft text-coral" },
  calificaciones: { label: "Calificaciones", cls: "bg-coral-soft text-coral" },
  taller: { label: "Taller", cls: "bg-indigo-soft text-indigo-dark" },
  preinscripcion: { label: "Preinscripción", cls: "bg-gold-soft text-gold" },
  conmemoracion: { label: "Conmemoración", cls: "bg-bg text-ink-soft" },
};

const MONTHS = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

export default async function CalendarioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const events = await getCalendar();
  const todayStr = new Date().toLocaleDateString("en-CA");

  // Agrupar por mes
  const byMonth = new Map<string, typeof events>();
  for (const e of events) {
    const d = new Date(e.date + "T12:00:00");
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(e);
  }

  const back =
    user.role === "director" ? "/dashboard" :
    user.role === "supervisor" ? "/zona" :
    user.role === "padre" ? "/familia" : "/inicio";

  return (
    <main className="mx-auto max-w-2xl px-5 pt-6 md:pt-10">
      <Link href={back} className="text-sm text-ink-soft">← Volver</Link>
      <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">Calendario SEP</h1>
      <p className="mb-6 text-sm text-ink-soft">Ciclo escolar 2025–2026</p>

      <div className="space-y-7">
        {Array.from(byMonth.entries()).map(([key, list]) => {
          const [year, month] = key.split("-").map(Number);
          return (
            <section key={key}>
              <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
                {MONTHS[month]} {year}
              </h2>
              <div className="space-y-2">
                {list.map((e) => {
                  const meta = KIND_META[e.kind] ?? KIND_META.conmemoracion;
                  const d = new Date(e.date + "T12:00:00");
                  const isPast = e.date < todayStr && (!e.end_date || e.end_date < todayStr);
                  const range = e.end_date
                    ? `${d.getDate()}–${new Date(e.end_date + "T12:00:00").getDate()}`
                    : `${d.getDate()}`;
                  return (
                    <Card key={e.id} className={`flex items-center gap-3 py-3 ${isPast ? "opacity-50" : ""}`}>
                      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] bg-bg">
                        <span className="tabular font-display text-sm font-extrabold text-ink leading-none">{range}</span>
                      </div>
                      <p className="flex-1 text-sm text-ink">{e.title}</p>
                      <span className={`shrink-0 rounded-pill px-2 py-0.5 text-[11px] font-semibold ${meta.cls}`}>{meta.label}</span>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
