import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-user";
import { signOut } from "@/lib/auth/actions";

export default async function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "supervisor") redirect("/inicio");

  return (
    <div className="flex min-h-dvh bg-ink text-white">
      <aside className="hidden w-64 flex-col border-r border-white/10 p-5 md:flex">
        <span className="font-display text-xl font-extrabold">Aula</span>
        <p className="mt-0.5 text-xs text-white/50">Supervisión de zona</p>
        <nav className="mt-8 flex flex-col gap-1">
          <Link href="/zona" className="rounded-btn bg-white/10 px-3 py-2 text-sm font-medium">Escuelas</Link>
        </nav>
        <form action={signOut} className="mt-auto">
          <button className="text-sm text-white/50 hover:text-white">Cerrar sesión</button>
        </form>
      </aside>
      <div className="flex-1 bg-bg text-ink">
        <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
