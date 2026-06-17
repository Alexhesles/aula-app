"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VincularPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function link() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("link_child", { p_code: code.trim() });
    setLoading(false);
    if (error) {
      setError("Código no válido. Revísalo con el maestro de tu hijo.");
      return;
    }
    router.push("/familia");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="font-display text-2xl font-extrabold text-indigo">Aula</span>
          <p className="mt-1 text-sm text-ink-soft">Conéctate con tu hijo</p>
        </div>
        <Card>
          <h1 className="font-display text-xl font-bold text-ink">Código del grupo</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Es un código de 6 caracteres que te comparte el maestro.
          </p>
          <div className="mt-4">
            <Input
              placeholder="Ej. A1B2C3"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoFocus
              maxLength={6}
            />
          </div>
          {error && <p className="mt-3 text-sm text-red">{error}</p>}
          <Button fullWidth className="mt-5" disabled={code.trim().length < 4 || loading} onClick={link}>
            {loading ? "Conectando…" : "Conectar"}
          </Button>
        </Card>
      </div>
    </main>
  );
}
