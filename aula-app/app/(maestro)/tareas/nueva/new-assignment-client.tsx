"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewAssignmentClient({ groups, preselect }: { groups: any[]; preselect: string }) {
  const router = useRouter();
  const [groupId, setGroupId] = useState(preselect);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [due, setDue] = useState("");
  const [pending, startTransition] = useTransition();

  function create() {
    if (!title.trim() || !groupId) return;
    startTransition(async () => {
      const supabase = createClient();
      const { data: g } = await supabase.from("groups").select("school_id").eq("id", groupId).single();
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("assignments")
        .insert({ school_id: g?.school_id, group_id: groupId, title: title.trim(), subject: subject || null, due_date: due || null, created_by: user?.id })
        .select("id").single();
      if (!error && data) { router.push(`/tareas/${data.id}`); router.refresh(); }
    });
  }
  return (
    <main className="px-5 pt-6 md:px-8 md:pt-10">
      <h1 className="mb-5 font-display text-2xl font-extrabold text-ink">Nueva tarea</h1>
      <Card className="space-y-3">
        {groups.length > 0 && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Grupo</span>
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="h-11 w-full rounded-btn border border-border bg-surface px-3 text-ink">
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>
        )}
        <Input label="Título" placeholder="Ej. Ejercicios de fracciones" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        <Input label="Materia (opcional)" placeholder="Matemáticas" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">Fecha de entrega (opcional)</span>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="h-11 w-full rounded-btn border border-border bg-surface px-3 text-ink" />
        </label>
        <Button fullWidth disabled={!title.trim() || pending} onClick={create}>{pending ? "Creando…" : "Crear tarea"}</Button>
      </Card>
    </main>
  );
}
