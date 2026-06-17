import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "ghost" | "danger" | "gold" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-indigo text-white shadow-[0_2px_8px_rgba(45,59,174,0.25)] hover:bg-indigo-dark active:translate-y-px",
  ghost: "bg-transparent text-ink hover:bg-indigo-soft",
  outline: "bg-surface text-ink border border-border hover:border-indigo-mid hover:text-indigo",
  danger: "bg-red text-white hover:opacity-90 active:translate-y-px",
  gold: "bg-gold text-ink hover:opacity-90 active:translate-y-px",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-btn font-display font-semibold",
        "transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
}
