"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TYPES = [
  { value: "logro", label: "Logro", cls: "bg-green text-white" },
  { value: "incidente", label: "Incidente", cls: "bg-red text-white" },
  { value: "academico", label: "Aviso", cls: "bg-indigo text-white" },
];

export function RegisterClient({ schoolId, groupId }: { schoolId: string | null; groupId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("incidente");
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  function save() {
    if (!text.trim()) return;
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("log_entries").insert({
        school_id: schoolId, author_id: user?.id, group_id: groupId,
        type, text: text.trim(), visible_to_director: true, media_urls: [],
      });
      setText(""); setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return <Button variant="outline" onClick={() => setOpen(true)}>+ Registrar en bitácora</Button>;
  }
  return (
    <Card className="space-y-3">
      <div className="flex gap-2">
        {TYPES.map((t) => (
          <button key={t.value} onClick={() => setType(t.value)}
            className={`flex-1 rounded-btn py-2 text-sm font-semibold ${type === t.value ? t.cls : "bg-bg text-muted"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} autoFocus
        placeholder="Anotación para el grupo…"
        className="w-full rounded-btn border border-border bg-surface p-3 text-sm text-ink placeholder:text-muted focus:border-indigo focus:outline-2 focus:outline-indigo" />
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button fullWidth disabled={!text.trim() || pending} onClick={save}>{pending ? "Guardando…" : "Guardar"}</Button>
      </div>
    </Card>
  );
}
