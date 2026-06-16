"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/loading";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : undefined;

  async function signInWithGoogle() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) setError("No se pudo conectar con Google. Intenta de nuevo.");
  }

  async function signInWithEmail() {
    if (!email) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (error) {
      setError("No pudimos enviar el enlace. Revisa el correo e intenta otra vez.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Card className="text-center">
        <h1 className="font-display text-xl font-bold text-ink">
          Revisa tu correo
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Te enviamos un enlace para entrar a{" "}
          <span className="font-medium text-ink">{email}</span>.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="font-display text-xl font-bold text-ink">Entrar a Aula</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Usa tu cuenta de Google o tu correo escolar.
      </p>

      <div className="mt-6 space-y-3">
        <Button variant="ghost" fullWidth onClick={signInWithGoogle}>
          Continuar con Google
        </Button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">o</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Input
          type="email"
          inputMode="email"
          placeholder="maestra@escuela.mx"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button fullWidth onClick={signInWithEmail} disabled={loading || !email}>
          {loading ? <Spinner className="border-white/40 border-t-white" /> : "Enviar enlace"}
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-red">{error}</p>}

      <p className="mt-6 text-center text-xs text-muted">
        Al continuar aceptas nuestros{" "}
        <a href="/terminos" className="underline">Términos</a> y el{" "}
        <a href="/privacidad" className="underline">Aviso de privacidad</a>.
      </p>
    </Card>
  );
}
