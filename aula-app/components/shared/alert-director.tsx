"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function AlertDirector({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function send() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.rpc("alert_director", { p_group_id: groupId, p_message: msg.trim() });
      setSent(true);
      setOpen(false);
      setMsg("");
    });
  }

  if (sent) {
    return <span className="inline-flex h-9 items-center rounded-btn bg-green-soft px-3 text-sm font-semibold text-green">Director avisado ✓</span>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-coral/40 bg-coral-soft px-3 text-sm font-semibold text-coral transition-colors hover:border-coral"
      >
        🔔 Avisar al director
      </button>
    );
  }

  return (
    <div className="w-full rounded-card border border-border bg-surface p-3">
      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        rows={2}
        autoFocus
        placeholder="¿Qué necesitas? (ej. requiero apoyo en el salón)"
        className="w-full rounded-btn border border-border bg-surface p-2 text-sm text-ink placeholder:text-muted focus:border-indigo focus:outline-2 focus:outline-indigo"
      />
      <div className="mt-2 flex gap-2">
        <button onClick={() => setOpen(false)} className="rounded-btn px-3 py-1.5 text-sm text-ink-soft">Cancelar</button>
        <button
          onClick={send}
          disabled={pending}
          className="flex-1 rounded-btn bg-coral py-1.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Enviando…" : "Enviar alerta"}
        </button>
      </div>
    </div>
  );
}
