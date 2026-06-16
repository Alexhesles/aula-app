import { getCurrentUser } from "@/lib/auth/get-user";
import { signOut } from "@/lib/auth/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";

export const metadata = { title: "Perfil" };

const ROLE_LABEL: Record<string, string> = {
  maestro: "Maestro", director: "Director", padre: "Tutor", supervisor: "Supervisor",
};

export default async function PerfilPage() {
  const user = await getCurrentUser();

  return (
    <main className="px-5 pt-8">
      <h1 className="mb-6 font-display text-2xl font-extrabold text-ink">Perfil</h1>
      <Card>
        <p className="font-display text-lg font-bold text-ink">
          {user?.fullName ?? "Sin nombre"}
        </p>
        <p className="text-sm text-ink-soft">{user?.email}</p>
        <div className="mt-3">
          {user?.role ? (
            <Pill tone="indigo">{ROLE_LABEL[user.role] ?? user.role}</Pill>
          ) : (
            <Pill tone="gold">Pendiente de asignar</Pill>
          )}
        </div>
      </Card>

      <form action={signOut} className="mt-5">
        <Button variant="ghost" fullWidth>Cerrar sesión</Button>
      </form>
    </main>
  );
}
