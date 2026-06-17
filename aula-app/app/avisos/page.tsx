import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getNotifications } from "@/lib/data/notifications";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Avisos" };

const TYPE_META: Record<string, { label: string; cls: string }> = {
  alerta: { label: "Alerta", cls: "bg-red-soft text-red" },
  cita: { label: "Cita", cls: "bg-indigo-soft text-indigo-dark" },
  anuncio: { label: "Anuncio", cls: "bg-gold-soft text-gold" },
  solicitud: { label: "Solicitud", cls: "bg-sky-soft text-sky" },
  sistema: { label: "Aviso", cls: "bg-bg text-ink-soft" },
};

export default async function AvisosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = await getNotifications();

  const supabase = await createClient();
  await supabase.rpc("mark_notifications_read");

  const back =
    user.role === "director" ? "/dashboard" :
    user.role === "supervisor" ? "/zona" :
    user.role === "padre" ? "/familia" : "/inicio";

  return (
    <main className="mx-auto max-w-2xl px-5 pt-6 md:pt-10">
      <Link href={back} className="text-sm text-ink-soft">← Volver</Link>
      <h1 className="mb-5 mt-2 font-display text-2xl font-extrabold text-ink">Avisos</h1>

      {items.length === 0 ? (
        <EmptyState title="Sin avisos" description="Aquí verás alertas, citas y anuncios." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.sistema;
            const when = new Date(n.created_at).toLocaleDateString("es-MX", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
            });
            const inner = (
              <Card className={`${!n.read ? "border-indigo-mid/40 bg-indigo-tint" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className={`rounded-pill px-2 py-0.5 text-[11px] font-semibold ${meta.cls}`}>{meta.label}</span>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-coral" />}
                  <span className="ml-auto text-xs text-muted">{when}</span>
                </div>
                <p className="mt-1.5 font-display font-bold text-ink">{n.title}</p>
                {n.body && <p className="text-sm text-ink-soft">{n.body}</p>}
              </Card>
            );
            return n.link ? <Link key={n.id} href={n.link}>{inner}</Link> : <div key={n.id}>{inner}</div>;
          })}
        </div>
      )}
    </main>
  );
}
