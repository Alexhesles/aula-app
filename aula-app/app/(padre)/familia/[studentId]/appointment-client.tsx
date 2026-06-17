"use client";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AppointmentClient({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("maestro");
  const [subject, setSubject] = useState("");
  const [when, setWhen] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function send() {
    if (!subject.trim()) return;
    startTransition(async () => {
      const supabase = createClient();
      await supabase.rpc("request_appointment", {
        p_target_role: role, p_subject: subject.trim(), p_student_id: studentId,
        p_proposed_at: when ? new Date(when).toISOString() : null,
      });
      setSent(true); setOpen(false); setSubject(""); setWhen("");
    });
  }

  if (sent) return <Card><p className="text-sm font-semibold text-green">Solicitud enviada ✓</p></Card>;
  if (!open) return <Button variant="outline" fullWidth onClick={() => setOpen(true)}>Agendar cita</Button>;

  return (
    <Card className="space-y-3">
      <p className="font-display font-bold text-ink">Agendar cita</p>
      <div className="flex gap-2">
        {[["maestro", "Maestro"], ["director", "Dirección"]].map(([v, l]) => (
          <button key={v} onClick={() => setRole(v)} className={`flex-1 rounded-btn py-2 text-sm font-semibold ${role === v ? "bg-indigo text-white" : "bg-bg text-muted"}`}>{l}</button>
        ))}
      </div>
      <textarea value={subject} onChange={(e) => setSubject(e.target.value)} rows={2} placeholder="Tema de la cita…"
        className="w-full rounded-btn border border-border bg-surface p-3 text-sm text-ink placeholder:text-muted focus:border-indigo focus:outline-2 focus:outline-indigo" />
      <label className="block"><span className="mb-1 block text-xs text-ink-soft">Fecha propuesta (opcional)</span>
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="h-11 w-full rounded-btn border border-border bg-surface px-3 text-ink" /></label>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button fullWidth disabled={!subject.trim() || pending} onClick={send}>{pending ? "Enviando…" : "Solicitar"}</Button>
      </div>
    </Card>
  );
}
