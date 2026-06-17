import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getPendingRequests } from "@/lib/data/maestro";
import { EmptyState } from "@/components/ui/empty-state";
import { RequestsClient } from "./requests-client";

export const metadata = { title: "Solicitudes" };

export default async function SolicitudesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const requests = await getPendingRequests();
  return (
    <main className="mx-auto max-w-2xl px-5 pt-6 md:pt-10">
      <Link href="/inicio" className="text-sm text-ink-soft">← Inicio</Link>
      <h1 className="mb-1 mt-2 font-display text-2xl font-extrabold text-ink">Solicitudes de familias</h1>
      <p className="mb-5 text-sm text-ink-soft">Aprueba a los tutores para que vean la información de su hijo.</p>
      {requests.length === 0 ? (
        <EmptyState title="Sin solicitudes" description="Aquí aparecerán las familias que se vinculen con un código." />
      ) : (
        <RequestsClient initial={requests} />
      )}
    </main>
  );
}
