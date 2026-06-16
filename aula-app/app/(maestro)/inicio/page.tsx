import Link from "next/link";
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
  const groups = user?.role ? await getMyGroups() : [];

  const firstName = user?.fullName?.split(" ")[0] ?? "";

  return (
    <main className="px-5 pt-8">
      <header className="mb-6">
        <p className="text-sm text-ink-soft">{greeting()},</p>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          {firstName || "bienvenida"} 👋
        </h1>
      </header>

      {/* Cuenta sin rol asignado */}
      {!user?.role && (
        <Card className="border-gold/40 bg-gold-soft">
          <h2 className="font-display font-bold text-ink">Cuenta pendiente</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Tu cuenta se creó correctamente, pero aún no tiene un rol asignado.
            El administrador de tu escuela debe activarla.
          </p>
        </Card>
      )}

      {/* Maestro con grupos */}
      {user?.role && (
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
              description="Cuando te asignen a un grupo, aparecerá aquí para pasar lista."
            />
          ) : (
            <div className="space-y-3">
              {groups.map((g) => (
                <Link key={g.id} href={`/asistencia/${g.id}`}>
                  <Card className="flex items-center justify-between transition-colors hover:border-indigo-mid">
                    <div>
                      <p className="font-display font-bold text-ink">{g.name}</p>
                      <p className="text-sm text-ink-soft">
                        {g.room ? `Salón ${g.room}` : "Grupo"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {g.isTitular && <Pill tone="green">Titular</Pill>}
                      <span className="text-muted">›</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
