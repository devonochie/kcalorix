"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PlanBuilder } from "@/components/workout/PlanBuilder";
import { usePlan } from "@/hooks/use-workout";
import { errorMessage } from "@/lib/errors";

export default function EditPlanPage() {
  const { id } = useParams<{ id: string }>();
  const plan = usePlan(id);

  if (plan.isLoading) {
    return <div className="h-64 animate-pulse rounded-sm border bg-card" />;
  }
  if (plan.isError || !plan.data) {
    return (
        <div className="rounded-sm border bg-card p-6">
          <p className="text-sm text-destructive">{plan.isError ? errorMessage(plan.error) : "Plan not found."}</p>
          <Link href="/workouts/my-plans" className="mt-3 inline-block text-sm text-primary underline">Back to plans</Link>
        </div>
    );
  }
  // key = plan id, so the form starts from this plan's data
  return <PlanBuilder key={plan.data.id} plan={plan.data} />;
}