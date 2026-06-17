"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const KINDS = [["aviso", "Aviso"], ["evento", "Evento"], ["material", "Material"], ["suspension", "Suspensión"]];

export function AnnouncementsClient({ groups, schoolId, initial }: { groups: any[]; schoolId: string | null; initial: any[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("aviso");
  const [date, setDate] = useState("");
  const [groupId, setGroupId] = useState("");
  const [pending, startTransition] = useTransition();

  function create() {
    if (!title.trim()) return;
    startTransition(async () => {
      const supabase = createClient();
      const { data } = await supabase.from("announcements")
        .insert({ school_id: schoolId, group_id: groupId || null, title: title.trim(), body: body || null, kind, event_date: date || null })
        .select("id, title, body, event_date, kind, group_id, created_at").single();
      if (data) setItems((p) => [data, ...p]);
      setTitle(""); setBody(""); setDate(""); setOpen(false);
      router.refresh();
    });
  }

  return (
    <div>
      {open ? (
        <Card className="mb-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {KINDS.map(([v, l]) => (
              <button key={v} onClick={() => setKind(v)} className={`rounded-pill px-3 py-1 text-sm font-semibold ${kind === v ? "bg-indigo text-white" : "bg-bg text-muted"}`}>{l}</button>
            ))}
          </div>
          <Input label="Título" placeholder="Festival del Día del Padre" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Detalles…"
            className="w-full rounded-btn border border-border bg-surface p-3 text-sm text-ink placeholder:text-muted focus:border-indigo focus:outline-2 focus:outline-indigo" />
          <div className="flex gap-2">
            <label className="flex-1"><span className="mb-1 block text-xs text-ink-soft">Fecha (opcional)</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 w-full rounded-btn border border-border bg-surface px-3 text-ink" /></label>
            {groups.length > 0 && (
              <label className="flex-1"><span className="mb-1 block text-xs text-ink-soft">Para</span>
                <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="h-11 w-full rounded-btn border border-border bg-surface px-3 text-sm text-ink">
                  <option value="">Toda la escuela</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select></label>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button fullWidth disabled={!title.trim() || pending} onClick={create}>{pending ? "Publicando…" : "Publicar"}</Button>
          </div>
        </Card>
      ) : (
        <Button fullWidth className="mb-4" onClick={() => setOpen(true)}>+ Nuevo anuncio</Button>
      )}

      <div className="space-y-2">
        {items.length === 0 ? <p className="py-4 text-center text-sm text-ink-soft">Sin anuncios.</p> :
          items.map((a) => (
            <Card key={a.id} className="py-3">
              <div className="flex items-center gap-2">
                <span className="rounded-pill bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-gold">{a.kind}</span>
                {a.event_date && <span className="text-xs text-muted">{a.event_date}</span>}
                <span className="ml-auto text-xs text-muted">{a.group_id ? "Grupo" : "Escuela"}</span>
              </div>
              <p className="mt-1 font-display font-bold text-ink">{a.title}</p>
              {a.body && <p className="text-sm text-ink-soft">{a.body}</p>}
            </Card>
          ))}
      </div>
    </div>
  );
}
