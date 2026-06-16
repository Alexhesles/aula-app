import Link from "next/link";
import { getMyGroups } from "@/lib/data/groups";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Asistencia" };

export default async function AsistenciaPage() {
  const groups = await getMyGroups();

  return (
    <main className="px-5 pt-8">
      <h1 className="mb-6 font-display text-2xl font-extrabold text-ink">
        Asistencia
      </h1>

      {groups.length === 0 ? (
        <EmptyState
          title="Sin grupos asignados"
          description="Cuando te asignen un grupo podrás pasar lista aquí."
        />
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Link key={g.id} href={`/asistencia/${g.id}`}>
              <Card className="flex items-center justify-between transition-colors hover:border-indigo-mid">
                <div>
                  <p className="font-display font-bold text-ink">{g.name}</p>
                  <p className="text-sm text-ink-soft">Pasar lista de hoy</p>
                </div>
                <span className="text-muted">›</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
