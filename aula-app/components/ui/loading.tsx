import { cn } from "@/lib/utils/cn";

/** Bloque skeleton para estados de carga. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-btn bg-border/60", className)}
    />
  );
}

/** Spinner circular. */
export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-indigo-soft border-t-indigo",
        className
      )}
      role="status"
      aria-label="Cargando"
    />
  );
}
