"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GuidedSession } from "@/components/workout/guided/GuidedSession";
import { SessionLive } from "@/components/workout/SessionLive";
import { SessionSummary } from "@/components/workout/SessionSummary";
import { WarmupGate } from "@/components/workout/WarmupGate";
import { useSession } from "@/hooks/use-workout";
import { errorMessage } from "@/lib/errors";
import { clearGuided, isGuided } from "@/lib/guided";
import { SessionStatus } from "@/types";

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const q = useSession(id);
  const [manual, setManual] = useState(false);
  const exitGuided = useCallback(() => {
    clearGuided(id);
    setManual(true);
  }, [id]);

  if (q.isLoading) {
    return <div className="h-64 animate-pulse rounded-sm border bg-card" />;
  }
  if (q.isError || !q.data) {
    return (
        <div className="rounded-sm border bg-card p-6">
          <p className="text-sm text-destructive">{q.isError ? errorMessage(q.error) : "Workout not found."}</p>
          <Link href="/workouts" className="mt-3 inline-block text-sm text-primary underline">Back to workouts</Link>
        </div>
    );
  }

  // Finished or cancelled -> summary. Warm-up not done -> warm-up. Started from a ready-made workout -> guided. Anything else -> normal screen.
  if (q.data.status !== SessionStatus.IN_PROGRESS) return <SessionSummary session={q.data} />;
  if (!q.data.warmupCompletedAt) return <WarmupGate session={q.data} />;
  if (isGuided(id) && !manual) return <GuidedSession session={q.data} onExit={exitGuided} />;
  return <SessionLive session={q.data} />;
}