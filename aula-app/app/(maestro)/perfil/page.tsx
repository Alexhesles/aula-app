import { getCurrentUser } from "@/lib/auth/get-user";
import { signOut } from "@/lib/auth/actions";
import { isFounder, switchRole } from "@/lib/auth/dev";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";

export const metadata = { title: "Perfil" };

const ROLE_LABEL: Record<string, string> = {
  maestro: "Maestro", director: "Director", padre: "Tutor", supervisor: "Supervisor",
};

const ROLES: { value: string; label: string; emoji: string }[] = [
  { value: "maestro", label: "Maestro", emoji: "🍎" },
  { value: "director", label: "Director", emoji: "🏫" },
  { value: "padre", label: "Familia", emoji: "👨‍👩‍👧" },
  { value: "supervisor", label: "Supervisor", emoji: "🗺️" },
];

export default async function PerfilPage() {
  const user = await getCurrentUser();
  const founder = await isFounder(user?.email);
  const initial = (user?.fullName?.trim()[0] ?? "A").toUpperCase();

  return (
    <main className="px-5 pt-6 md:px-8 md:pt-10">
      <h1 className="mb-5 font-display text-2xl font-extrabold text-ink">Perfil</h1>

      <Card className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient font-display text-xl font-extrabold text-white">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold text-ink">{user?.fullName ?? "Sin nombre"}</p>
          <p className="truncate text-sm text-ink-soft">{user?.email}</p>
          <div className="mt-2">
            {user?.role ? (
              <Pill tone="indigo">{ROLE_LABEL[user.role] ?? user.role}</Pill>
            ) : (
              <Pill tone="gold">Pendiente de asignar</Pill>
            )}
          </div>
        </div>
      </Card>

      {/* Modo fundador: cambiar de perfil para probar */}
      {founder && (
        <Card className="mt-5 border-indigo-mid/40 bg-indigo-tint">
          <p className="font-display font-bold text-ink">Modo fundador 🧪</p>
          <p className="mt-1 text-sm text-ink-soft">
            Cambia tu perfil para probar cada vista. Solo tú ves esto.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {ROLES.map((r) => {
              const active = user?.role === r.value;
              return (
                <form key={r.value} action={switchRole.bind(null, r.value)}>
                  <button
                    className={`flex w-full items-center gap-2 rounded-btn border px-3 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? "border-indigo bg-indigo text-white"
                        : "border-border bg-surface text-ink hover:border-indigo-mid"
                    }`}
                  >
                    <span>{r.emoji}</span>
                    {r.label}
                    {active && <span className="ml-auto text-xs">actual</span>}
                  </button>
                </form>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">
            Para "Familia" necesitas un alumno vinculado con su código.
          </p>
        </Card>
      )}

      <form action={signOut} className="mt-5">
        <Button variant="outline" fullWidth>Cerrar sesión</Button>
      </form>
    </main>
  );
}
