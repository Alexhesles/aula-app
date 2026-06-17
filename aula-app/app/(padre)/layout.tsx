import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getUnreadCount } from "@/lib/data/notifications";
import { isFounder } from "@/lib/auth/dev";
import { NotificationBell } from "@/components/shared/notification-bell";
import { signOut } from "@/lib/auth/actions";

export default async function PadreLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "padre") redirect("/inicio");
  const unread = await getUnreadCount();
  const founder = await isFounder(user.email);

  return (
    <div className="min-h-dvh bg-bg">
      <header className="flex items-center justify-between border-b border-border bg-surface px-5 py-3">
        <Link href="/familia" className="font-display text-lg font-extrabold text-indigo">Aula</Link>
        <div className="flex items-center gap-1">
          <NotificationBell count={unread} />
          {founder && <Link href="/cambiar" className="text-sm text-indigo">🧪</Link>}
          <form action={signOut}>
            <button className="text-sm text-ink-soft">Salir</button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-lg">{children}</div>
    </div>
  );
}
