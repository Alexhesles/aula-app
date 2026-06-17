import { getMyGroups } from "@/lib/data/groups";
import { NewAssignmentClient } from "./new-assignment-client";

export const metadata = { title: "Nueva tarea" };

export default async function NuevaTareaPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const { group } = await searchParams;
  const groups = await getMyGroups();
  return <NewAssignmentClient groups={groups} preselect={group ?? groups[0]?.id ?? ""} />;
}
