"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function NotesVisitClient({ schoolId, initialNotes }: { schoolId: string; initialNotes: any[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [text, setText] = useState("");
  const [visitSubject, setVisitSubject] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitSent, setVisitSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function addNote() {
    if (!text.trim()) return;
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("supervisor_notes")
        .insert({ supervisor_id: user?.id, school_id: schoolId, target_type: "escuela", text: text.trim() })
        .select("id, target_type, text, created_at").single();
      if (data) setNotes((p) => [data, ...p]);
      setText(""); router.refresh();
    });
  }

  function scheduleVisit() {
    if (!visitSubject.trim()) return;
    startTransition(async () => {
      const supabase = createClient();
      // notifica al director de la escuela
      await supabase.rpc("request_appointment", {
        p_target_role: "director", p_subject: `Visita de supervisión: ${visitSubject.trim()}`,
        p_student_id: null, p_proposed_at: visitDate ? new Date(visitDate).toISOString() : null,
      });
      setVisitSent(true); setVisitSubject(""); setVisitDate("");
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Agendar visita</h2>
        {visitSent ? (
          <Card><p className="text-sm font-semibold text-green">Visita agendada · el director fue notificado ✓</p></Card>
        ) : (
          <Card className="space-y-3">
            <textarea value={visitSubject} onChange={(e) => setVisitSubject(e.target.value)} rows={2} placeholder="Motivo de la visita…"
              className="w-full rounded-btn border border-border bg-surface p-3 text-sm text-ink placeholder:text-muted focus:border-indigo focus:outline-2 focus:outline-indigo" />
            <input type="datetime-local" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="h-11 w-full rounded-btn border border-border bg-surface px-3 text-ink" />
            <Button fullWidth disabled={!visitSubject.trim() || pending} onClick={scheduleVisit}>Agendar y notificar</Button>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Anotaciones de seguimiento</h2>
        <Card className="mb-3 space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Observación de la visita…"
            className="w-full rounded-btn border border-border bg-surface p-3 text-sm text-ink placeholder:text-muted focus:border-indigo focus:outline-2 focus:outline-indigo" />
          <Button fullWidth disabled={!text.trim() || pending} onClick={addNote}>Guardar nota</Button>
        </Card>
        <div className="space-y-2">
          {notes.map((n) => {
            const when = new Date(n.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
            return <Card key={n.id} className="py-3"><p className="text-sm text-ink">{n.text}</p><p className="mt-1 text-xs text-muted">{when}</p></Card>;
          })}
        </div>
      </section>
    </div>
  );
}
