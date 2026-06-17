"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Student {
  id: string;
  full_name: string;
  access_code: string | null;
}

const GRADES = ["1", "2", "3", "4", "5", "6"];

export function ManageClient({
  groupId,
  students,
  grade,
}: {
  groupId: string;
  students: Student[];
  grade: string | null;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [names, setNames] = useState("");
  const [showCodes, setShowCodes] = useState(false);
  const [currentGrade, setCurrentGrade] = useState(grade ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const parsed = names.split("\n").map((n) => n.trim()).filter(Boolean);

  function setGrade(g: string) {
    setCurrentGrade(g);
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("groups").update({ grade: g }).eq("id", groupId);
      router.refresh();
    });
  }

  function addStudents() {
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.rpc("add_students", { p_group_id: groupId, p_names: parsed });
      if (error) { setError("No se pudieron agregar. Intenta de nuevo."); return; }
      setNames("");
      setAdding(false);
      router.refresh();
    });
  }

  function removeStudent(id: string) {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("students").delete().eq("id", id);
      router.refresh();
    });
  }

  return (
    <div>
      {/* Grado del grupo */}
      <Card className="mb-4">
        <p className="mb-2 text-sm font-medium text-ink-soft">Grado del grupo</p>
        <div className="flex gap-2">
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              className={`h-10 flex-1 rounded-btn text-sm font-semibold transition-colors ${
                currentGrade === g ? "bg-indigo text-white" : "bg-bg text-muted"
              }`}
            >
              {g}°
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Necesario para el avance curricular SEP.</p>
      </Card>

      {/* Agregar alumnos */}
      {adding ? (
        <Card className="mb-4">
          <h2 className="font-display font-bold text-ink">Agregar alumnos</h2>
          <p className="mt-1 text-sm text-ink-soft">Escribe o pega un nombre por línea.</p>
          <textarea
            value={names}
            onChange={(e) => setNames(e.target.value)}
            rows={8}
            autoFocus
            placeholder={"Ana García López\nDiego Hernández Ruiz\nFernanda Martínez Cruz"}
            className="mt-3 w-full rounded-btn border border-border bg-surface p-3 text-sm text-ink placeholder:text-muted focus:border-indigo focus:outline-2 focus:outline-indigo"
          />
          {error && <p className="mt-2 text-sm text-red">{error}</p>}
          <div className="mt-3 flex items-center gap-2">
            <Button variant="ghost" onClick={() => { setAdding(false); setNames(""); }}>Cancelar</Button>
            <Button fullWidth disabled={parsed.length === 0 || pending} onClick={addStudents}>
              {pending ? "Agregando…" : `Agregar ${parsed.length || ""}`.trim()}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="mb-4 flex gap-2">
          <Button fullWidth onClick={() => setAdding(true)}>+ Agregar alumnos</Button>
          {students.length > 0 && (
            <Button variant="ghost" onClick={() => setShowCodes((v) => !v)}>
              {showCodes ? "Ocultar códigos" : "Códigos padres"}
            </Button>
          )}
        </div>
      )}

      {showCodes && (
        <Card className="mb-4 bg-indigo-soft/40">
          <p className="text-xs text-ink-soft">
            Comparte el código de cada alumno con su familia para que se conecten desde la app.
          </p>
        </Card>
      )}

      {/* Lista de alumnos */}
      {students.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-soft">
          Aún no hay alumnos. Agrega tu lista para empezar a pasar lista.
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
          {students.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-6 text-sm text-muted">{i + 1}</span>
              <span className="flex-1 truncate text-ink">{s.full_name}</span>
              {showCodes ? (
                <span className="rounded-pill bg-bg px-2 py-0.5 font-mono text-xs font-semibold tracking-wider text-indigo-dark">
                  {s.access_code ?? "—"}
                </span>
              ) : (
                <button
                  onClick={() => removeStudent(s.id)}
                  disabled={pending}
                  className="text-sm text-red hover:underline disabled:opacity-50"
                >
                  Quitar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
