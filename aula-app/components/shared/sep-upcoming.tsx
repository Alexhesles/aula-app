import Link from "next/link";
import { getUpcomingEvents } from "@/lib/data/calendar";
import { Card } from "@/components/ui/card";

export async function SepUpcoming({ limit = 3 }: { limit?: number }) {
  const events = await getUpcomingEvents(limit);
  if (events.length === 0) return null;
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">Próximas fechas SEP</h2>
        <Link href="/calendario" className="text-sm font-semibold text-indigo">Ver todo →</Link>
      </div>
      <Card className="space-y-3">
        {events.map((e) => {
          const d = new Date(e.date + "T12:00:00");
          return (
            <div key={e.id} className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] bg-indigo-soft">
                <span className="tabular font-display text-sm font-extrabold leading-none text-indigo-dark">{d.getDate()}</span>
                <span className="text-[10px] uppercase text-indigo-dark/70">{d.toLocaleDateString("es-MX", { month: "short" })}</span>
              </div>
              <p className="text-sm text-ink">{e.title}</p>
            </div>
          );
        })}
      </Card>
    </section>
  );
}
