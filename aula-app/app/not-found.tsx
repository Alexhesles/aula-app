import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6 text-center">
      <span className="font-display text-5xl font-extrabold text-indigo">404</span>
      <h1 className="mt-3 font-display text-xl font-bold text-ink">
        No encontramos esta página
      </h1>
      <p className="mt-2 max-w-xs text-sm text-ink-soft">
        Puede que el enlace haya cambiado o ya no exista.
      </p>
      <Link href="/" className="mt-6">
        <Button>Volver al inicio</Button>
      </Link>
    </main>
  );
}
