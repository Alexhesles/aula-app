import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurriculum } from "@/lib/data/curriculum";
import { Card } from "@/components/ui/card";
import { CurriculoClient } from "./curriculo-client";

export const metadata = { title: "Avance curricular" };

export default async function CurriculoGrupoPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const result = await getCurriculum(groupId);
  if (!result) notFound();

  const { group, subjects, needsGrade } = result;

  return (
    <main className="px-5 pt-8">
      <Link href="/curriculo" className="text-sm text-ink-soft">← Grupos</Link>
      <header className="mb-5 mt-2">
        <h1 className="font-display text-2xl font-extrabold text-ink">{group.name}</h1>
        <p className="text-sm text-ink-soft">{group.grade ? `${group.grade}° grado` : "Sin grado"}</p>
      </header>

      {needsGrade ? (
        <Card>
          <p className="font-medium text-ink">Falta asignar el grado</p>
          <p className="mt-1 text-sm text-ink-soft">
            Para ver los contenidos SEP, asigna el grado del grupo (5° o 6°) en la pantalla de administración.
          </p>
          <Link href={`/grupo/${groupId}`} className="mt-3 inline-block text-sm font-medium text-indigo">
            Ir a administrar grupo →
          </Link>
        </Card>
      ) : subjects.length === 0 ? (
        <Card>
          <p className="font-medium text-ink">Sin contenidos para {group.grade}°</p>
          <p className="mt-1 text-sm text-ink-soft">
            Aún no hay contenidos cargados para este grado. Pégalos desde la pantalla de administración del grupo.
          </p>
        </Card>
      ) : (
        <CurriculoClient groupId={groupId} grade={group.grade!} subjects={subjects} />
      )}
    </main>
  );
}
