"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { PlanItem } from "@/lib/data/plans";

const STATUS_CYCLE: Record<PlanItem["status"], PlanItem["status"]> = {
  pendiente: "en_curso",
  en_curso: "completado",
  completado: "pendiente",
};

const STATUS_META: Record<PlanItem["status"], { label: string; cls: string }> = {
  pendiente: { label: "Pendiente", cls: "bg-bg text-muted" },
  en_curso: { label: "En curso", cls: "bg-gold-soft text-gold" },
  completado: { label: "Completado", cls: "bg-green-soft text-green" },
};

export function PlanClient({
  planId,
  title,
  groupName,
  initialItems,
}: {
  planId: string;
  title: string | null;
  groupName: string | null;
  initialItems: PlanItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [content, setContent] = useState("");
  const [week, setWeek] = useState("");
  const [pending, startTransition] = useTransition();

  function addItem() {
    if (!content.trim()) return;
    startTransition(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("plan_items")
        .insert({
          lesson_plan_id: planId,
          content: content.trim(),
          week: week ? parseInt(week) : null,
          position: items.length,
        })
        .select("id, week, content, expected_learning, status, position")
        .single();
      if (!error && data) {
        setItems((prev) => [...prev, data as PlanItem]);
        setContent("");
        setWeek("");
      }
    });
  }

  function toggleStatus(item: PlanItem) {
    const next = STATUS_CYCLE[item.status];
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: next } : i)));
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("plan_items").update({ status: next }).eq("id", item.id);
      router.refresh();
    });
  }

  const done = items.filter((i) => i.status === "completado").length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <main className="px-5 pt-8">
      <header className="mb-4">
        <h1 className="font-display text-2xl font-extrabold text-ink">{title || "Plan"}</h1>
        {groupName && <p className="text-sm text-ink-soft">{groupName}</p>}
        <div className="mt-3 h-2 overflow-hidden rounded-pill bg-bg">
          <div className="h-full rounded-pill bg-indigo" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-muted">{done} de {items.length} completados ({pct}%)</p>
      </header>

      {/* Lista de temas */}
      <div className="space-y-2">
        {items.map((item) => {
          const meta = STATUS_META[item.status];
          return (
            <Card key={item.id} className="flex items-center gap-3 p-4">
              <div className="flex-1">
                {item.week != null && <span className="text-xs text-muted">Semana {item.week}</span>}
                <p className="text-sm text-ink">{item.content}</p>
              </div>
              <button
                onClick={() => toggleStatus(item)}
                className={cn("rounded-pill px-3 py-1 text-xs font-semibold transition-colors", meta.cls)}
              >
                {meta.label}
              </button>
            </Card>
          );
        })}
        {items.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-soft">Agrega los temas de tu plan abajo.</p>
        )}
      </div>

      {/* Agregar tema */}
      <Card className="mt-4 space-y-3">
        <p className="font-display text-sm font-bold text-ink">Agregar tema</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Sem."
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            className="h-11 w-20 rounded-btn border border-border bg-surface px-3 text-ink"
          />
          <input
            placeholder="Contenido o aprendizaje esperado"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-11 flex-1 rounded-btn border border-border bg-surface px-3 text-ink placeholder:text-muted focus:border-indigo focus:outline-2 focus:outline-indigo"
          />
        </div>
        <Button fullWidth disabled={!content.trim() || pending} onClick={addItem}>
          Agregar tema
        </Button>
      </Card>
    </main>
  );
}
