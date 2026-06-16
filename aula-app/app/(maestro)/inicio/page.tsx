import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getMyGroups } from "@/lib/data/groups";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Inicio" };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default async function InicioPage() {
  const user = await getCurrentUser();

  // Usuario nuevo sin rol → al onboarding para que configure su salón.
  if (!user?.role) redirect("/onboarding");

  const groups = await getMyGroups();
  const firstName = user.fullName?.split(" ")[0] ?? "";

  return (
    <main className="px-5 pt-8">
      <header className="mb-6">
        <p className="text-sm text-ink-soft">{greeting()},</p>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          {firstName || "bienvenida"} 👋
        </h1>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
            Tus grupos
          </h2>
          <Pill tone="indigo">{groups.length}</Pill>
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
          <div className="space-y-3">
            {groups.map((g) => (
              <Card key={g.id} className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-ink">{g.name}</p>
                  <p className="text-sm text-ink-soft">
                    {g.room ? `Salón ${g.room}` : "Grupo"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {g.isTitular && <Pill tone="green">Titular</Pill>}
                </div>
                <div className="ml-3 flex flex-col items-end gap-1">
                  <Link href={`/asistencia/${g.id}`} className="text-sm font-medium text-indigo">
                    Pasar lista →
                  </Link>
                  <Link href={`/grupo/${g.id}`} className="text-xs text-ink-soft hover:underline">
                    Administrar
                  </Link>
                </div>
              </Card>
            ))}

            <Link href="/nuevo-grupo">
              <Card className="flex items-center justify-center border-dashed text-sm font-medium text-indigo hover:border-indigo-mid">
                + Nuevo grupo
              </Card>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
