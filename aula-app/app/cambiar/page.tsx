import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-user";
import { isFounder, switchRole } from "@/lib/auth/dev";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Cambiar perfil" };

const ROLES = [
  { value: "maestro", label: "Maestro", emoji: "🍎", href: "/inicio" },
  { value: "director", label: "Director", emoji: "🏫", href: "/dashboard" },
  { value: "padre", label: "Familia", emoji: "👨‍👩‍👧", href: "/familia" },
  { value: "supervisor", label: "Supervisor", emoji: "🗺️", href: "/zona" },
];

export default async function CambiarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!(await isFounder(user.email))) redirect("/inicio");

  return (
    <main className="mx-auto max-w-md px-5 pt-10">
      <h1 className="font-display text-2xl font-extrabold text-ink">Modo fundador 🧪</h1>
      <p className="mb-5 mt-1 text-sm text-ink-soft">Cambia tu perfil para probar cada vista.</p>
      <div className="grid grid-cols-2 gap-3">
        {ROLES.map((r) => {
          const active = user.role === r.value;
          return (
            <form key={r.value} action={switchRole.bind(null, r.value)}>
              <button className={`flex w-full items-center gap-2 rounded-card border px-4 py-3 text-sm font-semibold transition-colors ${active ? "border-indigo bg-indigo text-white" : "border-border bg-surface text-ink hover:border-indigo-mid"}`}>
                <span className="text-lg">{r.emoji}</span>
                {r.label}
                {active && <span className="ml-auto text-xs opacity-80">actual</span>}
              </button>
            </form>
          );
        })}
      </div>
      <Link href="/inicio" className="mt-6 block text-center text-sm text-ink-soft">← Volver</Link>
    </main>
  );
}
