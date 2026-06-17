import Link from "next/link";
import { getMyGroups } from "@/lib/data/groups";
import { getAssignments } from "@/lib/data/maestro";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Tareas" };

export default async function TareasPage() {
  const groups = await getMyGroups();
  const byGroup = await Promise.all(groups.map(async (g) => ({ group: g, items: await getAssignments(g.id) })));

  return (
    <main className="px-5 pt-6 md:px-8 md:pt-10">
      <h1 className="mb-1 font-display text-2xl font-extrabold text-ink">Tareas y trabajos</h1>
      <p className="mb-5 text-sm text-ink-soft">Registra entregas y cumplimiento por grupo.</p>
      {groups.length === 0 ? (
        <EmptyState title="Sin grupos" description="Crea un grupo para registrar tareas." />
      ) : (
        <div className="space-y-6">
          {byGroup.map(({ group, items }) => (
            <section key={group.id}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-display font-bold text-ink">{group.name}</h2>
                <Link href={`/tareas/nueva?group=${group.id}`} className="text-sm font-semibold text-indigo">+ Nueva</Link>
              </div>
              {items.length === 0 ? (
                <Card><p className="text-sm text-ink-soft">Sin tareas registradas.</p></Card>
              ) : (
                <div className="space-y-2">
                  {items.map((a) => (
                    <Link key={a.id} href={`/tareas/${a.id}`}>
                      <Card hover className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-ink">{a.title}</p>
                          <p className="text-xs text-muted">{[a.subject, a.due_date && `Entrega ${a.due_date}`].filter(Boolean).join(" · ")}</p>
                        </div>
                        <span className="tabular text-sm font-semibold text-indigo">{a.delivered}/{a.total}</span>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
