import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-user";
import { signOut } from "@/lib/auth/actions";

export default async function PadreLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "padre") redirect("/inicio");

  return (
    <div className="min-h-dvh bg-bg">
      <header className="flex items-center justify-between border-b border-border bg-surface px-5 py-3">
        <Link href="/familia" className="font-display text-lg font-extrabold text-indigo">Aula</Link>
        <form action={signOut}>
          <button className="text-sm text-ink-soft">Salir</button>
        </form>
      </header>
      <div className="mx-auto max-w-lg">{children}</div>
    </div>
  );
}
