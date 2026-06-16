"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NuevoGrupoPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_group", {
      p_name: name,
      p_room: room || null,
    });
    setLoading(false);
    if (error) {
      setError("No se pudo crear el grupo.");
      return;
    }
    router.push(`/grupo/${data}`);
    router.refresh();
  }

  return (
    <main className="px-5 pt-8">
      <h1 className="mb-5 font-display text-2xl font-extrabold text-ink">Nuevo grupo</h1>
      <Card>
        <div className="space-y-3">
          <Input label="Nombre del grupo" placeholder="Ej. 4°B" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <Input label="Salón (opcional)" placeholder="Ej. 8" value={room} onChange={(e) => setRoom(e.target.value)} />
        </div>
        {error && <p className="mt-3 text-sm text-red">{error}</p>}
        <Button fullWidth className="mt-5" disabled={!name.trim() || loading} onClick={create}>
          {loading ? "Creando…" : "Crear grupo"}
        </Button>
      </Card>
    </main>
  );
}
