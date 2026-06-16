import Link from "next/link";
import { getMyPlans } from "@/lib/data/plans";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Plan SEP" };

export default async function PlanPage() {
  const plans = await getMyPlans();

  return (
    <main className="px-5 pt-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-ink">Plan SEP</h1>
        <Link href="/plan/nuevo"><Button size="sm">+ Nuevo</Button></Link>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          title="Sin planes aún"
          description="Crea un plan por materia y registra tu avance semana a semana."
          action={
            <Link href="/plan/nuevo">
              <span className="inline-flex h-11 items-center rounded-btn bg-indigo px-5 font-display text-sm font-semibold text-white">Crear plan</span>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {plans.map((p) => {
            const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
            return (
              <Link key={p.id} href={`/plan/${p.id}`}>
                <Card className="transition-colors hover:border-indigo-mid">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-bold text-ink">{p.title || "Plan"}</p>
                      <p className="text-sm text-ink-soft">
                        {[p.groupName, p.subjectName].filter(Boolean).join(" · ") || "Sin grupo"}
                      </p>
                    </div>
                    <span className="font-display text-sm font-bold text-indigo">{pct}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-pill bg-bg">
                    <div className="h-full rounded-pill bg-indigo" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">{p.done} de {p.total} temas completados</p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
