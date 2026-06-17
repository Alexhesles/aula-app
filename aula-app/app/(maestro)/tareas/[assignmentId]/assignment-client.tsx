"use client";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";

const CYCLE: Record<string, string> = { pendiente: "entregado", entregado: "no_entregado", no_entregado: "parcial", parcial: "pendiente" };
const META: Record<string, { label: string; cls: string }> = {
  pendiente: { label: "Pendiente", cls: "bg-bg text-muted" },
  entregado: { label: "Entregado", cls: "bg-green-soft text-green" },
  no_entregado: { label: "No entregó", cls: "bg-red-soft text-red" },
  parcial: { label: "Parcial", cls: "bg-gold-soft text-gold" },
};

export function AssignmentClient({ assignmentId, students }: { assignmentId: string; students: any[] }) {
  const [rows, setRows] = useState(students);
  const [, startTransition] = useTransition();
  function toggle(id: string, current: string) {
    const next = CYCLE[current] ?? "entregado";
    setRows((p) => p.map((r) => (r.id === id ? { ...r, status: next } : r)));
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("assignment_status").upsert(
        { assignment_id: assignmentId, student_id: id, status: next },
        { onConflict: "assignment_id,student_id" }
      );
    });
  }
  const done = rows.filter((r) => r.status === "entregado").length;
  return (
    <>
      <p className="mb-3 text-sm text-ink-soft">{done} de {rows.length} entregaron · toca para cambiar el estado</p>
      <Card className="divide-y divide-border p-0">
        {rows.map((r) => {
          const m = META[r.status] ?? META.pendiente;
          return (
            <button key={r.id} onClick={() => toggle(r.id, r.status)} className="flex w-full items-center justify-between px-4 py-3 text-left">
              <span className="text-ink">{r.name}</span>
              <span className={`rounded-pill px-3 py-1 text-xs font-semibold ${m.cls}`}>{m.label}</span>
            </button>
          );
        })}
      </Card>
    </>
  );
}
