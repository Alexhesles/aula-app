import Link from "next/link";
import { getLogEntries } from "@/lib/data/logbook";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Bitácora" };

const TYPE_META: Record<string, { label: string; tone: any }> = {
  logro: { label: "Logro", tone: "green" },
  incidente: { label: "Incidente", tone: "red" },
  academico: { label: "Académico", tone: "indigo" },
};

export default async function BitacoraPage() {
  const entries = await getLogEntries();

  return (
    <main className="px-5 pt-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-ink">Bitácora</h1>
        <Link href="/bitacora/nueva">
          <Button size="sm">+ Nueva</Button>
        </Link>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="Aún no hay entradas"
          description="Registra logros e incidentes de tus alumnos, con foto si quieres."
          action={
            <Link href="/bitacora/nueva">
              <span className="inline-flex h-11 items-center rounded-btn bg-indigo px-5 font-display text-sm font-semibold text-white">
                Crear entrada
              </span>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => {
            const meta = TYPE_META[e.type] ?? TYPE_META.academico;
            const when = new Date(e.created_at).toLocaleDateString("es-MX", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
            });
            return (
              <Card key={e.id}>
                <div className="mb-2 flex items-center gap-2">
                  <Pill tone={meta.tone}>{meta.label}</Pill>
                  {e.studentName && <span className="text-sm font-medium text-ink">{e.studentName}</span>}
                  {e.groupName && <span className="text-xs text-muted">· {e.groupName}</span>}
                </div>
                <p className="text-sm text-ink">{e.text}</p>
                {e.media.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {e.media.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt="" className="h-28 w-28 rounded-btn object-cover" />
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-muted">{when}</p>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
