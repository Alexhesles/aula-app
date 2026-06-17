import { notFound } from "next/navigation";
import Link from "next/link";
import { getChildDetail } from "@/lib/data/family";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { ConsentsClient } from "./consents-client";
import { ProfileClient } from "./profile-client";
import { AppointmentClient } from "./appointment-client";

export const metadata = { title: "Mi hijo" };

const TYPE_META: Record<string, { label: string; tone: any }> = {
  logro: { label: "Logro", tone: "green" }, incidente: { label: "Incidente", tone: "red" }, academico: { label: "Académico", tone: "indigo" },
};

export default async function HijoPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const detail = await getChildDetail(studentId);
  if (!detail) notFound();
  const { student, summary, logs, consentMap, progress, announcements, profile } = detail;

  return (
    <main className="px-5 pt-6">
      <Link href="/familia" className="text-sm text-ink-soft">← Mi familia</Link>
      <header className="mb-5 mt-2">
        <h1 className="font-display text-2xl font-extrabold text-ink">{student.fullName}</h1>
        <p className="text-sm text-ink-soft">{student.groupName ?? "Sin grupo"}</p>
      </header>

      {/* Asistencia */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="text-center"><p className="tabular font-display text-2xl font-extrabold text-green">{summary.presente}</p><p className="text-xs text-ink-soft">Presente</p></Card>
        <Card className="text-center"><p className="tabular font-display text-2xl font-extrabold text-gold">{summary.tardanza}</p><p className="text-xs text-ink-soft">Tardanzas</p></Card>
        <Card className="text-center"><p className="tabular font-display text-2xl font-extrabold text-red">{summary.falta}</p><p className="text-xs text-ink-soft">Faltas</p></Card>
      </div>

      {/* Avance / temas */}
      {progress.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">Avance del grupo</h2>
          <Card className="space-y-3">
            {progress.map((p) => {
              const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
              return (
                <div key={p.subject}>
                  <div className="flex items-center justify-between text-sm"><span className="text-ink">{p.subject}</span><span className="tabular text-ink-soft">{pct}%</span></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-pill bg-bg"><div className="h-full rounded-pill bg-indigo" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </Card>
        </section>
      )}

      {/* Anuncios */}
      {announcements.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">Anuncios</h2>
          <div className="space-y-2">
            {announcements.map((a: any) => (
              <Card key={a.id} className="py-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-pill bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-gold">{a.kind}</span>
                  {a.event_date && <span className="text-xs text-muted">{a.event_date}</span>}
                </div>
                <p className="mt-1 font-display font-bold text-ink">{a.title}</p>
                {a.body && <p className="text-sm text-ink-soft">{a.body}</p>}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Ficha */}
      <section className="mb-6">
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">Ficha del alumno</h2>
        <ProfileClient studentId={studentId} initial={profile} />
      </section>

      {/* Cita */}
      <section className="mb-6">
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">Citas</h2>
        <AppointmentClient studentId={studentId} />
      </section>

      {/* Bitácora */}
      <section className="mb-6">
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">Bitácora reciente</h2>
        {logs.length === 0 ? (
          <Card><p className="text-sm text-ink-soft">Sin entradas todavía.</p></Card>
        ) : (
          <div className="space-y-3">
            {logs.map((l: any) => {
              const meta = TYPE_META[l.type] ?? TYPE_META.academico;
              const when = new Date(l.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
              return (
                <Card key={l.id}>
                  <div className="mb-1.5 flex items-center gap-2"><Pill tone={meta.tone}>{meta.label}</Pill><span className="text-xs text-muted">{when}</span></div>
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
      </section>

      {/* Firmas */}
      <section>
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">Permisos y firmas</h2>
        <ConsentsClient studentId={studentId} initial={consentMap} />
      </section>
      <div className="h-10" />
    </main>
  );
}
