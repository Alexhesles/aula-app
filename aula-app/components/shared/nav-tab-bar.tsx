"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { href: "/inicio", label: "Inicio", icon: "home" },
  { href: "/asistencia", label: "Asistencia", icon: "check" },
  { href: "/perfil", label: "Perfil", icon: "user" },
];

function Icon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "var(--color-indigo)" : "var(--color-muted)";
  const common = { width: 22, height: 22, fill: "none", stroke, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "home")
    return (<svg viewBox="0 0 24 24" {...common}><path d="M3 9.5L12 3l9 6.5" /><path d="M5 10v10h14V10" /></svg>);
  if (name === "check")
    return (<svg viewBox="0 0 24 24" {...common}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>);
  return (<svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg>);
}

export function NavTabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium",
                active ? "text-indigo" : "text-muted"
              )}
            >
              <Icon name={t.icon} active={active} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
