import Link from "next/link";
import { getCurriculumGroups } from "@/lib/data/curriculum";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Avance curricular" };

export default async function CurriculoPage() {
  const groups = await getCurriculumGroups();

  return (
    <main className="px-5 pt-8">
      <h1 className="font-display text-2xl font-extrabold text-ink">Avance curricular</h1>
      <p className="mb-5 mt-1 text-sm text-ink-soft">
        Marca los contenidos SEP que ya abordaste, por materia.
      </p>

      {groups.length === 0 ? (
        <EmptyState title="Sin grupos" description="Crea un grupo para llevar tu avance curricular." />
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Link key={g.id} href={`/curriculo/${g.id}`}>
              <Card className="flex items-center justify-between transition-colors hover:border-indigo-mid">
                <div>
                  <p className="font-display font-bold text-ink">{g.name}</p>
                  <p className="text-sm text-ink-soft">
                    {g.grade ? `${g.grade}° grado` : "Asigna el grado en Administrar grupo"}
                  </p>
                </div>
                <span className="text-indigo">→</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
