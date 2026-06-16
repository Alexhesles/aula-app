import { notFound } from "next/navigation";
import { getPlan } from "@/lib/data/plans";
import { PlanClient } from "./plan-client";

export const metadata = { title: "Plan" };

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const result = await getPlan(planId);
  if (!result) notFound();

  return (
    <PlanClient
      planId={planId}
      title={result.plan.title}
      groupName={result.plan.groups?.name ?? null}
      initialItems={result.items}
    />
  );
}
