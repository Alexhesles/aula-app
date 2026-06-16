import { cn } from "@/lib/utils/cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-card bg-indigo-soft text-indigo">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-ink-soft">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
