import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-user";
import { signOut } from "@/lib/auth/actions";
import { AppShell, type NavItem } from "@/components/shared/app-shell";

const NAV: NavItem[] = [
  { href: "/inicio", label: "Inicio", icon: "home", mobile: true },
  { href: "/asistencia", label: "Asistencia", icon: "check", mobile: true },
  { href: "/bitacora", label: "Bitácora", icon: "book", mobile: true },
  { href: "/plan", label: "Plan", icon: "clipboard", mobile: true },
  { href: "/curriculo", label: "Currículo", icon: "compass" }, // solo sidebar (desktop)
  { href: "/perfil", label: "Perfil", icon: "user", mobile: true },
];

const ROLE_LABEL: Record<string, string> = {
  maestro: "Maestro", director: "Director", padre: "Tutor", supervisor: "Supervisor",
};

export default async function MaestroLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = user.fullName ?? "Maestro";
  const initial = (name.trim()[0] ?? "A").toUpperCase();

  return (
    <AppShell
      user={{ name, roleLabel: ROLE_LABEL[user.role ?? ""] ?? "Maestro", initial }}
      nav={NAV}
      signOut={signOut}
    >
      {children}
    </AppShell>
  );
}
