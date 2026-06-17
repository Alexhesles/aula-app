import { cn } from "@/lib/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, hover, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-card border border-border shadow-card p-5",
        hover && "card-hover cursor-pointer",
        className
      )}
      {...props}
    />
  );
}
