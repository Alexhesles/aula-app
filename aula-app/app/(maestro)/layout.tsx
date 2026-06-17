import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-user";
import { signOut } from "@/lib/auth/actions";
import { AppShell, type NavItem } from "@/components/shared/app-shell";
import { getUnreadCount } from "@/lib/data/notifications";
import { isFounder } from "@/lib/auth/dev";

const NAV: NavItem[] = [
  { href: "/inicio", label: "Inicio", icon: "home", mobile: true },
  { href: "/asistencia", label: "Asistencia", icon: "check", mobile: true },
  { href: "/bitacora", label: "Bitácora", icon: "book", mobile: true },
  { href: "/plan", label: "Plan", icon: "clipboard", mobile: true },
  { href: "/curriculo", label: "Currículo", icon: "compass" },
  { href: "/tareas", label: "Tareas", icon: "clipboard" },
  { href: "/anuncios", label: "Anuncios", icon: "book" },
  { href: "/solicitudes", label: "Solicitudes", icon: "user" },
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
  const unread = await getUnreadCount();
  const founder = await isFounder(user.email);

  return (
    <AppShell
      user={{ name, roleLabel: ROLE_LABEL[user.role ?? ""] ?? "Maestro", initial }}
      nav={NAV}
      unread={unread}
      founder={founder}
      signOut={signOut}
    >
      {children}
    </AppShell>
  );
}
