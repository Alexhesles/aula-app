"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewPlanClient({ groups }: { groups: { id: string; name: string }[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function create() {
    if (!title.trim() || !groupId) return;
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { data: group } = await supabase.from("groups").select("school_id").eq("id", groupId).single();
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("lesson_plans")
        .insert({ school_id: group?.school_id, group_id: groupId, title: title.trim(), created_by: user?.id })
        .select("id")
        .single();
      if (error || !data) { setError("No se pudo crear el plan."); return; }
      router.push(`/plan/${data.id}`);
      router.refresh();
    });
  }

  return (
    <main className="px-5 pt-8">
      <h1 className="mb-5 font-display text-2xl font-extrabold text-ink">Nuevo plan</h1>
      <Card className="space-y-4">
        <Input label="Título del plan" placeholder="Ej. Matemáticas — Bloque 1" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        {groups.length > 0 && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Grupo</span>
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="h-11 w-full rounded-btn border border-border bg-surface px-3 text-ink">
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>
        )}
        {error && <p className="text-sm text-red">{error}</p>}
        <Button fullWidth disabled={!title.trim() || !groupId || pending} onClick={create}>
          {pending ? "Creando…" : "Crear plan"}
        </Button>
      </Card>
    </main>
  );
}
