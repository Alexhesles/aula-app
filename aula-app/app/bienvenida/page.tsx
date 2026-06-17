import Link from "next/link";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Bienvenida" };

export default function BienvenidaPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-extrabold text-indigo">Aula</span>
          <p className="mt-1 text-sm text-ink-soft">¿Cómo usarás Aula?</p>
        </div>

        <div className="space-y-3">
          <Link href="/onboarding">
            <Card className="transition-colors hover:border-indigo-mid">
              <p className="font-display text-lg font-bold text-ink">Soy maestro o director 🍎</p>
              <p className="mt-1 text-sm text-ink-soft">
                Configura tu escuela, tus grupos y empieza a pasar lista.
              </p>
            </Card>
          </Link>

          <Link href="/vincular">
            <Card className="transition-colors hover:border-indigo-mid">
              <p className="font-display text-lg font-bold text-ink">Soy familia 👨‍👩‍👧</p>
              <p className="mt-1 text-sm text-ink-soft">
                Conéctate con el grupo de tu hijo usando el código que te dio su maestro.
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}
