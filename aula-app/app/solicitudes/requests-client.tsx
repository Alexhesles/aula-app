"use client";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";

export function RequestsClient({ initial }: { initial: any[] }) {
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();
  function resolve(linkId: string, approve: boolean) {
    setItems((p) => p.filter((i) => i.linkId !== linkId));
    startTransition(async () => {
      const supabase = createClient();
      await supabase.rpc("review_guardian", { p_link_id: linkId, p_approve: approve });
    });
  }
  return (
    <div className="space-y-2">
      {items.map((r) => (
        <Card key={r.linkId} className="flex items-center gap-3">
          <div className="flex-1">
            <p className="font-display font-bold text-ink">{r.guardianName}</p>
            <p className="text-sm text-ink-soft">Solicita acceso a <strong>{r.studentName}</strong>{r.groupName ? ` · ${r.groupName}` : ""}</p>
          </div>
          <button onClick={() => resolve(r.linkId, false)} disabled={pending} className="rounded-btn px-3 py-1.5 text-sm font-semibold text-red">Rechazar</button>
          <button onClick={() => resolve(r.linkId, true)} disabled={pending} className="rounded-btn bg-indigo px-3 py-1.5 text-sm font-semibold text-white">Aprobar</button>
        </Card>
      ))}
    </div>
  );
}
