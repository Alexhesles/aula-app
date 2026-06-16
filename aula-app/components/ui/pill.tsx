import { cn } from "@/lib/utils/cn";

type Tone = "indigo" | "green" | "red" | "gold" | "coral" | "sky" | "muted";

const tones: Record<Tone, string> = {
  indigo: "bg-indigo-soft text-indigo-dark",
  green: "bg-green-soft text-green",
  red: "bg-red-soft text-red",
  gold: "bg-gold-soft text-gold",
  coral: "bg-coral-soft text-coral",
  sky: "bg-sky-soft text-sky",
  muted: "bg-bg text-ink-soft",
};

export function Pill({
  tone = "muted",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
