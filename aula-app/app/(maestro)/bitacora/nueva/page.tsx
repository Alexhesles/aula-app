import { getMyContext } from "@/lib/data/me";
import { getGroupStudents } from "@/lib/data/students";
import { NewEntryClient } from "./new-entry-client";

export const metadata = { title: "Nueva entrada" };

export default async function NuevaEntradaPage() {
  const { schoolId, groups } = await getMyContext();

  // Cargar alumnos del primer grupo para el selector (se recargan al cambiar de grupo en cliente vía todos).
  const studentsByGroup: Record<string, { id: string; full_name: string }[]> = {};
  for (const g of groups) {
    studentsByGroup[g.id] = await getGroupStudents(g.id);
  }

  return (
    <NewEntryClient
      schoolId={schoolId}
      groups={groups}
      studentsByGroup={studentsByGroup}
    />
  );
}
