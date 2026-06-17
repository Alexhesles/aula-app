import { notFound } from "next/navigation";
import { getPlan, getCurriculumOptions } from "@/lib/data/plans";
import { PlanClient } from "./plan-client";

export const metadata = { title: "Plan" };

export default async function PlanDetailPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  const result = await getPlan(planId);
  if (!result) notFound();
  const grade = (result.plan as any).groups?.grade ?? null;
  const options = await getCurriculumOptions(grade);

  return (
    <PlanClient
      planId={planId}
      title={result.plan.title}
      groupName={result.plan.groups?.name ?? null}
      initialItems={result.items}
      options={options}
    />
  );
}
