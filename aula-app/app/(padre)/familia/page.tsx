import Link from "next/link";
import { getMyChildren } from "@/lib/data/family";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Mi familia" };

export default async function FamiliaPage() {
  const children = await getMyChildren();

  return (
    <main className="px-5 pt-8">
      <h1 className="mb-5 font-display text-2xl font-extrabold text-ink">Mi familia</h1>

      {children.length === 0 ? (
        <EmptyState
          title="Aún no conectas a ningún hijo"
          description="Pide al maestro el código del grupo para conectarte."
          action={
            <Link href="/vincular">
              <span className="inline-flex h-11 items-center rounded-btn bg-indigo px-5 font-display text-sm font-semibold text-white">
                Conectar con un código
              </span>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {children.map((c) => (
            <Link key={c.id} href={`/familia/${c.id}`}>
              <Card className="flex items-center gap-4 transition-colors hover:border-indigo-mid">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-soft font-display text-lg font-bold text-indigo-dark">
                  {c.fullName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-ink">{c.fullName}</p>
                  <p className="text-sm text-ink-soft">{c.groupName ?? "Sin grupo"}</p>
                </div>
                <span className="text-indigo">→</span>
              </Card>
            </Link>
          ))}
          <Link href="/vincular">
            <Card className="flex items-center justify-center border-dashed text-sm font-medium text-indigo hover:border-indigo-mid">
              + Conectar otro hijo
            </Card>
          </Link>
        </div>
      )}
    </main>
  );
}
