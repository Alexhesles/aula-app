import { getMyContext } from "@/lib/data/me";
import { NewPlanClient } from "./new-plan-client";

export const metadata = { title: "Nuevo plan" };

export default async function NuevoPlanPage() {
  const { groups } = await getMyContext();
  return <NewPlanClient groups={groups} />;
}
