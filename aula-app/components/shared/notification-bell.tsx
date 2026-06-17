import Link from "next/link";

export function NotificationBell({ count, dark }: { count: number; dark?: boolean }) {
  return (
    <Link
      href="/avisos"
      aria-label={`Avisos${count ? `, ${count} sin leer` : ""}`}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
        stroke={dark ? "rgba(255,255,255,0.85)" : "var(--color-ink-soft)"}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
