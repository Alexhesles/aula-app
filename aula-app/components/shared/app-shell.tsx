"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { NotificationBell } from "@/components/shared/notification-bell";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  mobile?: boolean; // aparece en la barra inferior (móvil)
}

function Icon({ name, className }: { name: string; className?: string }) {
  const c = {
    className,
    width: 22,
    height: 22,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "home":
      return (<svg viewBox="0 0 24 24" {...c}><path d="M3 9.5L12 3l9 6.5" /><path d="M5 10v10h14V10" /></svg>);
    case "check":
      return (<svg viewBox="0 0 24 24" {...c}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>);
    case "book":
      return (<svg viewBox="0 0 24 24" {...c}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>);
    case "clipboard":
      return (<svg viewBox="0 0 24 24" {...c}><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M9 13l2 2 4-4" /></svg>);
    case "compass":
      return (<svg viewBox="0 0 24 24" {...c}><circle cx="12" cy="12" r="9" /><path d="M16 8l-2 6-6 2 2-6 6-2z" /></svg>);
    case "user":
      return (<svg viewBox="0 0 24 24" {...c}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg>);
    default:
      return null;
  }
}

interface AppShellProps {
  user: { name: string; roleLabel: string; initial: string };
  nav: NavItem[];
  unread: number;
  signOut: () => void;
  children: React.ReactNode;
}

export function AppShell({ user, nav, unread, signOut, children }: AppShellProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const mobileNav = nav.filter((n) => n.mobile);

  return (
    <div className="min-h-dvh bg-bg md:flex">
      {/* ===== Sidebar (desktop) ===== */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
        <div className="flex items-center justify-between px-2">
          <Link href="/inicio" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-gradient font-display text-base font-extrabold text-white">A</span>
            <span className="font-display text-lg font-extrabold text-ink">Aula</span>
          </Link>
          <NotificationBell count={unread} />
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {nav.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-indigo-soft text-indigo-dark" : "text-ink-soft hover:bg-indigo-tint hover:text-ink"
                )}
              >
                <Icon name={n.icon} className={active ? "text-indigo" : "text-muted"} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border pt-4">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-soft font-display text-sm font-bold text-indigo-dark">
              {user.initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
              <p className="text-xs text-muted">{user.roleLabel}</p>
            </div>
          </div>
          <form action={signOut} className="mt-2">
            <button className="w-full rounded-btn px-3 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-red-soft hover:text-red">
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ===== Contenido ===== */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header móvil con gradiente */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-gradient px-5 py-3 md:hidden">
          <Link href="/inicio" className="font-display text-lg font-extrabold text-white">Aula</Link>
          <div className="flex items-center gap-1">
            <NotificationBell count={unread} dark />
            <Link href="/perfil" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-display text-sm font-bold text-white">
              {user.initial}
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 pb-24 md:pb-12">{children}</main>
      </div>

      {/* ===== Tab bar (móvil) ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {mobileNav.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-indigo" : "text-muted"
                )}
              >
                <Icon name={n.icon} />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
