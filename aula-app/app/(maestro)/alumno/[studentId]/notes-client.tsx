"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CATS = [
  { value: "academico", label: "Académico" },
  { value: "conducta", label: "Conducta" },
  { value: "general", label: "General" },
];
const CAT_CLS: Record<string, string> = {
  academico: "bg-indigo-soft text-indigo-dark", conducta: "bg-coral-soft text-coral", general: "bg-bg text-ink-soft",
};

export function NotesClient({ studentId, initial }: { studentId: string; initial: any[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initial);
  const [text, setText] = useState("");
  const [cat, setCat] = useState("academico");
  const [share, setShare] = useState(false);
  const [pending, startTransition] = useTransition();

  function add() {
    if (!text.trim()) return;
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("student_notes")
        .insert({ student_id: studentId, author_id: user?.id, text: text.trim(), category: cat, visible_to_guardian: share })
        .select("id, text, category, created_at").single();
      if (data) setNotes((p) => [data, ...p]);
      setText("");
      router.refresh();
    });
  }
  return (
    <div>
      <Card className="mb-4 space-y-3">
        <div className="flex gap-2">
          {CATS.map((c) => (
            <button key={c.value} onClick={() => setCat(c.value)}
              className={`flex-1 rounded-btn py-2 text-sm font-semibold ${cat === c.value ? "bg-indigo text-white" : "bg-bg text-muted"}`}>
              {c.label}
            </button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Anotación sobre el desempeño…"
          className="w-full rounded-btn border border-border bg-surface p-3 text-sm text-ink placeholder:text-muted focus:border-indigo focus:outline-2 focus:outline-indigo" />
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} />
          Visible para la familia
        </label>
        <Button fullWidth disabled={!text.trim() || pending} onClick={add}>{pending ? "Guardando…" : "Agregar anotación"}</Button>
      </Card>
      <div className="space-y-2">
        {notes.length === 0 ? (
          <p className="py-4 text-center text-sm text-ink-soft">Sin anotaciones aún.</p>
        ) : notes.map((n) => {
          const when = new Date(n.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
          return (
            <Card key={n.id} className="py-3">
              <div className="mb-1 flex items-center gap-2">
                <span className={`rounded-pill px-2 py-0.5 text-[11px] font-semibold ${CAT_CLS[n.category] ?? CAT_CLS.general}`}>{n.category}</span>
                <span className="ml-auto text-xs text-muted">{when}</span>
              </div>
              <p className="text-sm text-ink">{n.text}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
