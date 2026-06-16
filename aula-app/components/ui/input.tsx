import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-soft">
          {label}
        </span>
      )}
      <input
        id={id}
        className={cn(
          "w-full h-11 px-3 rounded-btn border border-border bg-surface text-ink",
          "placeholder:text-muted focus:outline-2 focus:outline-indigo focus:border-indigo",
          className
        )}
        {...props}
      />
    </label>
  );
}
