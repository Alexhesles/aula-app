import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getMyGroups } from "@/lib/data/groups";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { AnnouncementsClient } from "./announcements-client";

export const metadata = { title: "Anuncios" };

export default async function AnunciosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!(user.role === "maestro" || user.role === "director")) redirect("/inicio");

  const groups = await getMyGroups();
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("announcements").select("id, title, body, event_date, kind, group_id, created_at")
    .order("created_at", { ascending: false }).limit(30);

  const back = user.role === "director" ? "/dashboard" : "/inicio";

  return (
    <main className="mx-auto max-w-2xl px-5 pt-6 md:pt-10">
      <Link href={back} className="text-sm text-ink-soft">← Volver</Link>
      <h1 className="mb-1 mt-2 font-display text-2xl font-extrabold text-ink">Anuncios</h1>
      <p className="mb-5 text-sm text-ink-soft">Avisos para las familias: eventos, materiales, suspensiones.</p>
      <AnnouncementsClient groups={groups} schoolId={user.schoolId} initial={(items as any[]) ?? []} />
    </main>
  );
}
