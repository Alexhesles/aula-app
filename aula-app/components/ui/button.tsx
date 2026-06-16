import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "ghost" | "danger" | "gold";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-indigo text-white hover:bg-indigo-dark active:bg-indigo-dark",
  ghost: "bg-transparent text-ink hover:bg-indigo-soft",
  danger: "bg-red text-white hover:opacity-90",
  gold: "bg-gold text-ink hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
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
        "transition-colors disabled:opacity-50 disabled:pointer-events-none",
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
