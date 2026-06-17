"use client";
import Link from "next/link";
import { AlertDirector } from "@/components/shared/alert-director";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { saveAttendance } from "./actions";
import type { AttendanceStatus } from "@/lib/data/attendance";

interface Student {
  id: string;
  full_name: string;
}

const OPTIONS: { value: AttendanceStatus; label: string; tone: string }[] = [
  { value: "presente", label: "P", tone: "bg-green text-white" },
  { value: "tardanza", label: "T", tone: "bg-gold text-ink" },
  { value: "falta", label: "F", tone: "bg-red text-white" },
];

export function AttendanceClient({
  groupId,
  groupName,
  date,
  students,
  initial,
}: {
  groupId: string;
  groupName: string;
  date: string;
  students: Student[];
  initial: Record<string, AttendanceStatus>;
}) {
  // Por defecto todos presentes; el maestro solo marca las excepciones.
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>(() => {
    const base: Record<string, AttendanceStatus> = {};
    for (const s of students) base[s.id] = initial[s.id] ?? "presente";
    return base;
  });
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const counts = {
    presente: Object.values(marks).filter((m) => m === "presente").length,
    tardanza: Object.values(marks).filter((m) => m === "tardanza").length,
    falta: Object.values(marks).filter((m) => m === "falta").length,
  };

  function set(id: string, status: AttendanceStatus) {
    setMarks((m) => ({ ...m, [id]: status }));
    setSaved(false);
  }

  function onSave() {
    setError(null);
    startTransition(async () => {
      const entries = students.map((s) => ({ studentId: s.id, status: marks[s.id] }));
      const res = await saveAttendance(groupId, date, entries);
      if (res.ok) setSaved(true);
      else setError(res.error ?? "No se pudo guardar.");
    });
  }

  const prettyDate = new Date(date + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="pb-28">
      <header className="px-5 pt-8">
        <h1 className="font-display text-2xl font-extrabold text-ink">{groupName}</h1>
        <p className="text-sm capitalize text-ink-soft">{prettyDate}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link href={`/asistencia/${groupId}/historial`} className="inline-flex h-9 items-center rounded-btn border border-border px-3 text-sm font-medium text-ink-soft transition-colors hover:border-indigo-mid hover:text-indigo">Ver historial</Link>
          <AlertDirector groupId={groupId} />
        </div>

        <div className="mt-4 flex gap-2">
          <span className="rounded-pill bg-green-soft px-3 py-1 text-sm font-semibold text-green">
            {counts.presente} presentes
          </span>
          <span className="rounded-pill bg-gold-soft px-3 py-1 text-sm font-semibold text-gold">
            {counts.tardanza} tarde
          </span>
          <span className="rounded-pill bg-red-soft px-3 py-1 text-sm font-semibold text-red">
            {counts.falta} faltas
          </span>
        </div>
      </header>

      <ul className="mt-5 divide-y divide-border border-y border-border bg-surface">
        {students.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <span className="flex-1 truncate text-ink">{s.full_name}</span>
            <div className="flex gap-1.5">
              {OPTIONS.map((o) => {
                const active = marks[s.id] === o.value;
                return (
                  <button
                    key={o.value}
                    onClick={() => set(s.id, o.value)}
                    aria-label={o.value}
                    className={cn(
                      "h-9 w-9 rounded-btn font-display text-sm font-bold transition-all",
                      active
                        ? o.tone
                        : "bg-bg text-muted hover:bg-border/50"
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      {/* Barra de guardado fija */}
      <div className="fixed bottom-16 inset-x-0 z-30 border-t border-border bg-surface/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          {error ? (
            <span className="flex-1 text-sm text-red">{error}</span>
          ) : saved ? (
            <span className="flex-1 text-sm font-medium text-green">
              ✓ Asistencia guardada
            </span>
          ) : (
            <span className="flex-1 text-sm text-ink-soft">
              {students.length} alumnos
            </span>
          )}
          <Button onClick={onSave} disabled={pending}>
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
