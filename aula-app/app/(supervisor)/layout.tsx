import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getUnreadCount } from "@/lib/data/notifications";
import { isFounder } from "@/lib/auth/dev";
import { NotificationBell } from "@/components/shared/notification-bell";
import { signOut } from "@/lib/auth/actions";

const NAV = [
  { href: "/zona", label: "Escuelas" },
  { href: "/calendario", label: "Calendario" },
];

export default async function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "supervisor") redirect("/inicio");
  const unread = await getUnreadCount();
  const founder = await isFounder(user.email);

  return (
    <div className="min-h-dvh bg-ink text-white md:flex">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-white/10 p-5 md:flex">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-xl font-extrabold">Aula</span>
            <p className="mt-0.5 text-xs text-white/50">Supervisión de zona</p>
          </div>
          <NotificationBell count={unread} dark />
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-btn px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-4">
          <p className="px-1 text-sm font-semibold text-white/90">{user.fullName ?? "Supervisor"}</p>
          {founder && <Link href="/cambiar" className="mt-1 block text-sm text-indigo-mid hover:text-white">🧪 Cambiar perfil</Link>}
          <form action={signOut}><button className="mt-1 text-sm text-white/50 hover:text-white">Cerrar sesión</button></form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-ink px-5 py-3 md:hidden">
          <Link href="/zona" className="font-display text-lg font-extrabold text-white">Aula</Link>
          <div className="flex items-center gap-2">
            <NotificationBell count={unread} dark />
            <form action={signOut}><button className="text-sm text-white/60">Salir</button></form>
          </div>
        </header>
        <div className="flex-1 bg-bg text-ink">
          <div className="mx-auto max-w-5xl px-5 py-6 md:px-8 md:py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
