import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-surface rounded-card border border-border shadow-card p-5",
        className
      )}
      {...props}
    />
  );
}
