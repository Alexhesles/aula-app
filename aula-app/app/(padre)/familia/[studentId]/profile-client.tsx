"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProfileClient({ studentId, initial }: { studentId: string; initial: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    birthdate: initial?.birthdate ?? "", blood_type: initial?.blood_type ?? "",
    allergies: initial?.allergies ?? "", conditions: initial?.conditions ?? "",
    emergency_contact: initial?.emergency_contact ?? "", emergency_phone: initial?.emergency_phone ?? "",
  });
  const [pending, startTransition] = useTransition();
  const set = (k: string) => (e: any) => setF((p) => ({ ...p, [k]: e.target.value }));

  function save() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.rpc("update_child_profile", {
        p_student_id: studentId, p_birthdate: f.birthdate || null,
        p_blood: f.blood_type || null, p_allergies: f.allergies || null, p_conditions: f.conditions || null,
        p_emergency_contact: f.emergency_contact || null, p_emergency_phone: f.emergency_phone || null,
        p_guardian_name: null, p_guardian_phone: null, p_relationship: null,
      });
      setOpen(false); router.refresh();
    });
  }

  const filled = f.birthdate || f.blood_type || f.allergies || f.emergency_phone;

  if (!open) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <p className="font-display font-bold text-ink">Ficha del alumno</p>
          <button onClick={() => setOpen(true)} className="text-sm font-semibold text-indigo">{filled ? "Editar" : "Completar"}</button>
        </div>
        {filled ? (
          <div className="mt-2 grid grid-cols-2 gap-1 text-sm text-ink-soft">
            {f.birthdate && <p>Nacimiento: <span className="text-ink">{f.birthdate}</span></p>}
            {f.blood_type && <p>Sangre: <span className="text-ink">{f.blood_type}</span></p>}
            {f.allergies && <p className="col-span-2">Alergias: <span className="text-ink">{f.allergies}</span></p>}
            {f.emergency_phone && <p className="col-span-2">Emergencia: <span className="text-ink">{f.emergency_contact} · {f.emergency_phone}</span></p>}
          </div>
        ) : (
          <p className="mt-1 text-sm text-ink-soft">Ayuda a la escuela completando los datos de tu hijo.</p>
        )}
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <p className="font-display font-bold text-ink">Ficha del alumno</p>
      <label className="block"><span className="mb-1 block text-xs text-ink-soft">Fecha de nacimiento</span>
        <input type="date" value={f.birthdate} onChange={set("birthdate")} className="h-11 w-full rounded-btn border border-border bg-surface px-3 text-ink" /></label>
      <Input label="Tipo de sangre" placeholder="O+" value={f.blood_type} onChange={set("blood_type")} />
      <Input label="Alergias" placeholder="Penicilina, nueces…" value={f.allergies} onChange={set("allergies")} />
      <Input label="Condiciones médicas" placeholder="Asma…" value={f.conditions} onChange={set("conditions")} />
      <Input label="Contacto de emergencia" placeholder="Nombre" value={f.emergency_contact} onChange={set("emergency_contact")} />
      <Input label="Teléfono de emergencia" placeholder="55 1234 5678" value={f.emergency_phone} onChange={set("emergency_phone")} />
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button fullWidth disabled={pending} onClick={save}>{pending ? "Guardando…" : "Guardar ficha"}</Button>
      </div>
    </Card>
  );
}
