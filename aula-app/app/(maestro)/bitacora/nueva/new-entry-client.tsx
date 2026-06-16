"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type EntryType = "logro" | "incidente" | "academico";

const TYPES: { value: EntryType; label: string; tone: string }[] = [
  { value: "logro", label: "Logro", tone: "bg-green text-white" },
  { value: "incidente", label: "Incidente", tone: "bg-red text-white" },
  { value: "academico", label: "Académico", tone: "bg-indigo text-white" },
];

export function NewEntryClient({
  schoolId,
  groups,
  studentsByGroup,
}: {
  schoolId: string | null;
  groups: { id: string; name: string }[];
  studentsByGroup: Record<string, { id: string; full_name: string }[]>;
}) {
  const router = useRouter();
  const [type, setType] = useState<EntryType>("logro");
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [studentId, setStudentId] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const students = studentsByGroup[groupId] ?? [];

  function submit() {
    if (!text.trim()) return;
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      let mediaPaths: string[] = [];

      if (file && schoolId) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${schoolId}/${groupId || "general"}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("bitacora")
          .upload(path, file, { upsert: false });
        if (upErr) {
          setError("No se pudo subir la foto. Guarda sin foto o intenta de nuevo.");
          return;
        }
        mediaPaths = [path];
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: insErr } = await supabase.from("log_entries").insert({
        school_id: schoolId,
        author_id: user?.id,
        student_id: studentId || null,
        group_id: groupId || null,
        type,
        text: text.trim(),
        media_urls: mediaPaths,
      });

      if (insErr) {
        setError("No se pudo guardar la entrada.");
        return;
      }
      router.push("/bitacora");
      router.refresh();
    });
  }

  return (
    <main className="px-5 pt-8">
      <h1 className="mb-5 font-display text-2xl font-extrabold text-ink">Nueva entrada</h1>

      <Card className="space-y-4">
        {/* Tipo */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">Tipo</span>
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`flex-1 rounded-btn py-2 text-sm font-semibold transition-all ${
                  type === t.value ? t.tone : "bg-bg text-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grupo */}
        {groups.length > 0 && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Grupo</span>
            <select
              value={groupId}
              onChange={(e) => { setGroupId(e.target.value); setStudentId(""); }}
              className="h-11 w-full rounded-btn border border-border bg-surface px-3 text-ink"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </label>
        )}

        {/* Alumno (opcional) */}
        {students.length > 0 && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">
              Alumno <span className="text-muted">(opcional)</span>
            </span>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="h-11 w-full rounded-btn border border-border bg-surface px-3 text-ink"
            >
              <option value="">Todo el grupo</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </label>
        )}

        {/* Texto */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">Descripción</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="¿Qué pasó?"
            className="w-full rounded-btn border border-border bg-surface p-3 text-sm text-ink placeholder:text-muted focus:border-indigo focus:outline-2 focus:outline-indigo"
          />
        </label>

        {/* Foto */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">
            Foto <span className="text-muted">(opcional)</span>
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-btn file:border-0 file:bg-indigo-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-dark"
          />
        </label>

        {error && <p className="text-sm text-red">{error}</p>}

        <Button fullWidth disabled={!text.trim() || pending} onClick={submit}>
          {pending ? "Guardando…" : "Guardar entrada"}
        </Button>
      </Card>
    </main>
  );
}
