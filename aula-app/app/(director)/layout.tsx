import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-user";
import { signOut } from "@/lib/auth/actions";

export default async function DirectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "director") redirect("/inicio");

  return (
    <div className="flex min-h-dvh bg-ink text-white">
      {/* Sidebar (escritorio) */}
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-ink p-5 md:flex">
        <span className="font-display text-xl font-extrabold text-white">Aula</span>
        <p className="mt-0.5 text-xs text-white/50">Panel del director</p>
        <nav className="mt-8 flex flex-col gap-1">
          <Link href="/dashboard" className="rounded-btn bg-white/10 px-3 py-2 text-sm font-medium">
            Resumen
          </Link>
          <Link href="/dashboard#grupos" className="rounded-btn px-3 py-2 text-sm text-white/70 hover:bg-white/5">
            Grupos
          </Link>
          <Link href="/dashboard#bitacora" className="rounded-btn px-3 py-2 text-sm text-white/70 hover:bg-white/5">
            Bitácora
          </Link>
        </nav>
        <form action={signOut} className="mt-auto">
          <button className="text-sm text-white/50 hover:text-white">Cerrar sesión</button>
        </form>
      </aside>

      {/* Contenido */}
      <div className="flex-1 bg-bg text-ink">
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
