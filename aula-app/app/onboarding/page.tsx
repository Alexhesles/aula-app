"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [group, setGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("onboard_teacher", {
      p_full_name: name,
      p_school_name: school,
      p_group_name: group,
    });
    setLoading(false);
    if (error) {
      setError("No se pudo completar la configuración. Intenta de nuevo.");
      return;
    }
    // data = group_id → manda directo a agregar alumnos
    router.push(`/grupo/${data}`);
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="font-display text-2xl font-extrabold text-indigo">Aula</span>
          <p className="mt-1 text-sm text-ink-soft">Configuremos tu salón en 3 pasos</p>
        </div>

        {/* Progreso */}
        <div className="mb-5 flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-pill ${s <= step ? "bg-indigo" : "bg-border"}`}
            />
          ))}
        </div>

        <Card>
          {step === 1 && (
            <>
              <h1 className="font-display text-xl font-bold text-ink">¿Cómo te llamas?</h1>
              <p className="mt-1 text-sm text-ink-soft">Así te verán en la app.</p>
              <div className="mt-4">
                <Input
                  placeholder="Ej. Laura Méndez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <Button
                fullWidth
                className="mt-5"
                disabled={!name.trim()}
                onClick={() => setStep(2)}
              >
                Continuar
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-display text-xl font-bold text-ink">Tu escuela</h1>
              <p className="mt-1 text-sm text-ink-soft">El nombre de tu colegio.</p>
              <div className="mt-4">
                <Input
                  placeholder="Ej. Colegio Benito Juárez"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="mt-5 flex gap-2">
                <Button variant="ghost" onClick={() => setStep(1)}>Atrás</Button>
                <Button fullWidth disabled={!school.trim()} onClick={() => setStep(3)}>
                  Continuar
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="font-display text-xl font-bold text-ink">Tu primer grupo</h1>
              <p className="mt-1 text-sm text-ink-soft">Puedes agregar más después.</p>
              <div className="mt-4">
                <Input
                  placeholder="Ej. 3°A"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  autoFocus
                />
              </div>
              {error && <p className="mt-3 text-sm text-red">{error}</p>}
              <div className="mt-5 flex gap-2">
                <Button variant="ghost" onClick={() => setStep(2)}>Atrás</Button>
                <Button fullWidth disabled={!group.trim() || loading} onClick={finish}>
                  {loading ? "Creando…" : "Crear mi salón"}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
