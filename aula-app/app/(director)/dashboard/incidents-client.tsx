"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";

interface Incident {
  id: string;
  text: string;
  created_at: string;
  reviewed: boolean;
  studentName: string | null;
  groupName: string | null;
}

export function IncidentsClient({ initial }: { initial: Incident[] }) {
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();

  function review(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, reviewed: true } : i)));
    startTransition(async () => {
      const supabase = createClient();
      await supabase.rpc("review_log", { p_log_id: id });
    });
  }

  if (items.length === 0) {
    return <Card><p className="text-sm text-ink-soft">Sin incidencias recientes. 🎉</p></Card>;
  }

  return (
    <div className="space-y-2">
      {items.map((i) => {
        const when = new Date(i.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
        return (
          <Card key={i.id} className="flex items-start gap-3">
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${i.reviewed ? "bg-border" : "bg-red"}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink">{i.text}</p>
              <p className="mt-0.5 text-xs text-muted">
                {[i.studentName, i.groupName].filter(Boolean).join(" · ")} · {when}
              </p>
            </div>
            {i.reviewed ? (
              <span className="shrink-0 rounded-pill bg-green-soft px-2 py-0.5 text-xs font-semibold text-green">Revisada</span>
            ) : (
              <button
                onClick={() => review(i.id)}
                disabled={pending}
                className="shrink-0 rounded-pill border border-border px-3 py-1 text-xs font-semibold text-indigo transition-colors hover:border-indigo-mid"
              >
                Marcar revisada
              </button>
            )}
          </Card>
        );
      })}
    </div>
  );
}
