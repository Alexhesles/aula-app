import Link from "next/link";
import { notFound } from "next/navigation";
import { getGroup } from "@/lib/data/groups";
import { getAttendanceHistory } from "@/lib/data/attendance";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Historial de asistencia" };

export default async function HistorialPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const group = await getGroup(groupId);
  if (!group) notFound();
  const history = await getAttendanceHistory(groupId, 40);

  return (
    <main className="px-5 pt-6 md:px-8 md:pt-10">
      <Link href={`/asistencia/${groupId}`} className="text-sm text-ink-soft">← Pase de lista</Link>
      <h1 className="mt-2 font-display text-2xl font-extrabold text-ink">Historial · {group.name}</h1>
      <p className="mb-5 text-sm text-ink-soft">Registros de asistencia por día</p>

      {history.length === 0 ? (
        <EmptyState title="Sin historial" description="Cuando pases lista, aquí aparecerá el registro de cada día." />
      ) : (
        <Card className="divide-y divide-border p-0">
          {history.map((d) => {
            const date = new Date(d.date + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
            const rate = d.total ? Math.round((d.presente / d.total) * 100) : 0;
            return (
              <div key={d.date} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm capitalize text-ink">{date}</p>
                  <p className="text-xs text-muted">{rate}% asistencia</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="text-green">{d.presente} P</span>
                  <span className="text-gold">{d.tardanza} T</span>
                  <span className="text-red">{d.falta} F</span>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </main>
  );
}
