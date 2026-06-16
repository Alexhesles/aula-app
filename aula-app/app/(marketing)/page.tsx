import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-6">
      {/* Nav */}
      <header className="flex items-center justify-between py-6">
        <span className="font-display text-xl font-extrabold text-indigo">
          Aula
        </span>
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Entrar
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <Pill tone="indigo">Beta privada · Escuelas en México</Pill>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
          El sistema operativo de tu escuela
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-soft">
          Asistencia, bitácora y plan SEP en un solo lugar. La app que los
          maestros abren todos los días, el control que el director siempre
          quiso.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/login">
            <Button size="lg">Comenzar</Button>
          </Link>
          <Link href="/para-escuelas">
            <Button variant="ghost" size="lg">
              Soy directora
            </Button>
          </Link>
        </div>

        {/* Tres pilares */}
        <div className="mt-16 grid w-full gap-4 sm:grid-cols-3">
          {[
            { t: "Asistencia", d: "Pase de lista en segundos, hasta sin señal." },
            { t: "Bitácora", d: "Logros e incidentes con foto, al instante." },
            { t: "Plan SEP", d: "Avance curricular siempre a la mano." },
          ].map((f) => (
            <div
              key={f.t}
              className="rounded-card border border-border bg-surface p-5 text-left shadow-card"
            >
              <h3 className="font-display font-bold text-ink">{f.t}</h3>
              <p className="mt-1 text-sm text-ink-soft">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-6 text-sm text-muted">
        <span>© {new Date().getFullYear()} Aula</span>
        <nav className="flex gap-4">
          <Link href="/privacidad" className="hover:text-ink-soft">
            Privacidad
          </Link>
          <Link href="/terminos" className="hover:text-ink-soft">
            Términos
          </Link>
        </nav>
      </footer>
    </main>
  );
}
