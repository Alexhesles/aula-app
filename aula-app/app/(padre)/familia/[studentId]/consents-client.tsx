"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";

const CONSENTS: { type: string; label: string; desc: string }[] = [
  { type: "datos", label: "Datos personales", desc: "Uso de datos de mi hijo para fines escolares." },
  { type: "fotos", label: "Fotografías", desc: "Tomar y guardar fotos en la bitácora del grupo." },
  { type: "salud", label: "Información de salud", desc: "Registrar datos de salud relevantes." },
  { type: "comunicacion", label: "Comunicación", desc: "Recibir avisos y mensajes de la escuela." },
];

export function ConsentsClient({
  studentId,
  initial,
}: {
  studentId: string;
  initial: Record<string, boolean>;
}) {
  const [state, setState] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle(type: string) {
    const next = !state[type];
    setState((p) => ({ ...p, [type]: next }));
    startTransition(async () => {
      const supabase = createClient();
      await supabase.rpc("set_consent", { p_student_id: studentId, p_type: type, p_granted: next });
    });
  }

  return (
    <div className="space-y-2">
      {CONSENTS.map((c) => {
        const on = !!state[c.type];
        return (
          <Card key={c.type} className="flex items-center gap-3 py-3">
            <div className="flex-1">
              <p className="font-medium text-ink">{c.label}</p>
              <p className="text-xs text-ink-soft">{c.desc}</p>
            </div>
            <button
              onClick={() => toggle(c.type)}
              disabled={pending}
              aria-pressed={on}
              className={`relative h-7 w-12 shrink-0 rounded-pill transition-colors ${on ? "bg-green" : "bg-border"}`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-6" : "left-1"}`}
              />
            </button>
          </Card>
        );
      })}
      <p className="px-1 pt-1 text-xs text-muted">
        Tu firma se guarda con fecha y hora. Puedes cambiarla cuando quieras.
      </p>
    </div>
  );
}
