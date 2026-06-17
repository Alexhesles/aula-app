"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import type { SubjectBlock } from "@/lib/data/curriculum";

export function CurriculoClient({
  groupId,
  grade,
  subjects,
}: {
  groupId: string;
  grade: string;
  subjects: SubjectBlock[];
}) {
  const [active, setActive] = useState(subjects[0]?.subject ?? "");
  const [data, setData] = useState(subjects);
  const [, startTransition] = useTransition();

  function toggle(subject: string, contentId: string, current: boolean) {
    const next = !current;
    setData((prev) =>
      prev.map((s) =>
        s.subject !== subject
          ? s
          : {
              ...s,
              done: s.done + (next ? 1 : -1),
              contents: s.contents.map((c) => (c.id === contentId ? { ...c, covered: next } : c)),
            }
      )
    );
    startTransition(async () => {
      const supabase = createClient();
      if (next) {
        await supabase
          .from("content_coverage")
          .upsert(
            { group_id: groupId, content_id: contentId, covered: true, covered_at: new Date().toLocaleDateString("en-CA") },
            { onConflict: "group_id,content_id" }
          );
      } else {
        await supabase.from("content_coverage").delete().match({ group_id: groupId, content_id: contentId });
      }
    });
  }

  const activeBlock = data.find((s) => s.subject === active);

  return (
    <div>
      {/* Tabs de materias */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {data.map((s) => {
          const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
          return (
            <button
              key={s.subject}
              onClick={() => setActive(s.subject)}
              className={`shrink-0 rounded-pill px-3 py-1.5 text-sm font-medium transition-colors ${
                active === s.subject ? "bg-indigo text-white" : "bg-surface text-ink-soft border border-border"
              }`}
            >
              {s.subject} <span className="opacity-70">{pct}%</span>
            </button>
          );
        })}
      </div>

      {activeBlock && (
        <>
          <div className="mb-3">
            <div className="h-2 overflow-hidden rounded-pill bg-bg">
              <div
                className="h-full rounded-pill bg-indigo"
                style={{ width: `${activeBlock.total ? (activeBlock.done / activeBlock.total) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              {activeBlock.done} de {activeBlock.total} contenidos abordados
            </p>
          </div>

          <div className="space-y-2">
            {activeBlock.contents.map((c) => (
              <Card
                key={c.id}
                onClick={() => toggle(active, c.id, c.covered)}
                className={`flex cursor-pointer items-start gap-3 py-3 transition-colors ${
                  c.covered ? "border-green/40 bg-green-soft/40" : ""
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                    c.covered ? "border-green bg-green text-white" : "border-border"
                  }`}
                >
                  {c.covered && (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12l5 5L20 6" />
                    </svg>
                  )}
                </span>
                <span className={`text-sm ${c.covered ? "text-ink" : "text-ink-soft"}`}>
                  {c.campo ? <span className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wide text-indigo/70">{c.campo}</span> : null}
                  {c.content}
                  {c.detail ? <span className="mt-1 block text-xs text-muted">{c.detail}</span> : null}
                </span>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
