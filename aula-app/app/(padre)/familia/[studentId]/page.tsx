import { notFound } from "next/navigation";
import Link from "next/link";
import { getChildDetail } from "@/lib/data/family";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { ConsentsClient } from "./consents-client";

export const metadata = { title: "Mi hijo" };

const TYPE_META: Record<string, { label: string; tone: any }> = {
  logro: { label: "Logro", tone: "green" },
  incidente: { label: "Incidente", tone: "red" },
  academico: { label: "Académico", tone: "indigo" },
};

export default async function HijoPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const detail = await getChildDetail(studentId);
  if (!detail) notFound();

  const { student, summary, logs, consentMap } = detail;

  return (
    <main className="px-5 pt-6">
      <Link href="/familia" className="text-sm text-ink-soft">← Mi familia</Link>
      <header className="mb-5 mt-2">
        <h1 className="font-display text-2xl font-extrabold text-ink">{student.fullName}</h1>
        <p className="text-sm text-ink-soft">{student.groupName ?? "Sin grupo"}</p>
      </header>

      {/* Asistencia del mes */}
      <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
        Asistencia del mes
      </h2>
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="font-display text-2xl font-extrabold text-green">{summary.presente}</p>
          <p className="text-xs text-ink-soft">Presente</p>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl font-extrabold text-gold">{summary.tardanza}</p>
          <p className="text-xs text-ink-soft">Tardanzas</p>
        </Card>
        <Card className="text-center">
          <p className="font-display text-2xl font-extrabold text-red">{summary.falta}</p>
          <p className="text-xs text-ink-soft">Faltas</p>
        </Card>
      </div>

      {/* Bitácora */}
      <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
        Bitácora reciente
      </h2>
      {logs.length === 0 ? (
        <Card className="mb-6"><p className="text-sm text-ink-soft">Sin entradas todavía.</p></Card>
      ) : (
        <div className="mb-6 space-y-3">
          {logs.map((l: any) => {
            const meta = TYPE_META[l.type] ?? TYPE_META.academico;
            const when = new Date(l.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
            return (
              <Card key={l.id}>
                <div className="mb-1.5 flex items-center gap-2">
                  <Pill tone={meta.tone}>{meta.label}</Pill>
                  <span className="text-xs text-muted">{when}</span>
                </div>
                <p className="text-sm text-ink">{l.text}</p>
                {l.media.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {l.media.map((url: string, i: number) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt="" className="h-28 w-28 rounded-btn object-cover" />
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Firmas / consentimientos */}
      <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
        Permisos y firmas
      </h2>
      <ConsentsClient studentId={studentId} initial={consentMap} />
      <div className="h-10" />
    </main>
  );
}
