"use client";

import { useEffect, useState } from "react";
import { GuidedShell, DoneView, ReadyView, RestView, WorkView } from "./GuidedScreens";
import { buildSteps, firstUnlogged, type Step } from "./build-steps";
import { useSessionItems } from "../session/use-session-items";
import { useNow } from "@/hooks/use-now";
import { useFinishSession, useLogSet, useRecords } from "@/hooks/use-workout";
import { clearGuided } from "@/lib/guided";
import { errorMessage } from "@/lib/errors";
import { findNewRecords, stashNewRecords } from "@/lib/records";
import { TrackingType } from "@/types";
import type { SessionResponse } from "@/types";

const READY_SECONDS = 10;
const EXTRA_REST_SECONDS = 20;

type Phase = "ready" | "work" | "rest" | "done";

const buzz = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(200);
};

/** Loads the plan, then hands the steps to the runner. Falls back to the normal screen when guided mode can't log the exercises. */
export function GuidedSession({ session, onExit }: { session: SessionResponse; onExit: () => void }) {
    const { items, plan } = useSessionItems(session);
    const planned = items.filter((i) => i.target);
    const loading = plan.isLoading || planned.some((i) => !i.detail);
    // weight and distance need typing in, which the automatic flow can't do
    const unsupported = planned.some(
        (i) => i.tracking === TrackingType.REPS_WEIGHT || i.tracking === TrackingType.DISTANCE_DURATION,
    );

    useEffect(() => {
        if (!loading && (unsupported || planned.length === 0)) onExit();
    }, [loading, unsupported, planned.length, onExit]);

    if (loading || unsupported || planned.length === 0) {
        return <div className="h-64 animate-pulse rounded-sm border bg-card" />;
    }
    return <GuidedRunner session={session} steps={buildSteps(items)} onExit={onExit} />;
}

function GuidedRunner({ session, steps, onExit }: { session: SessionResponse; steps: Step[]; onExit: () => void }) {
    const logSet = useLogSet(session.id);
    const finish = useFinishSession(session.id);
    const records = useRecords();
    const now = useNow(250);

    const [index, setIndex] = useState(() => firstUnlogged(steps, session.sets));
    const [phase, setPhase] = useState<Phase>(() => (firstUnlogged(steps, session.sets) >= steps.length ? "done" : "ready"));
    const [endsAt, setEndsAt] = useState(() => Date.now() + READY_SECONDS * 1000);
    const [pausedMs, setPausedMs] = useState<number | null>(null);
    // Sets that failed to save (network drop, say). Kept so the person can retry before finishing.
    const [failed, setFailed] = useState<Step[]>([]);

    const step = steps[Math.min(index, steps.length - 1)]!;
    const nextIndex = index + 1;
    const next = steps[nextIndex] ?? null;

    const leftMs = pausedMs ?? Math.max(0, endsAt - now);
    const left = Math.ceil(leftMs / 1000);
    const hasTimer = phase === "ready" || phase === "rest" || (phase === "work" && step.durationSeconds != null);
    const expired = hasTimer && pausedMs === null && left === 0;

    function startWork(i: number) {
        const s = steps[i]!;
        setIndex(i);
        setPhase("work");
        setPausedMs(null);
        if (s.durationSeconds != null) setEndsAt(Date.now() + s.durationSeconds * 1000);
    }

    /** Saves one set. On failure the step is remembered instead of being lost. */
    async function save(s: Step) {
        try {
            await logSet.mutateAsync(
                s.durationSeconds != null
                    ? { exerciseId: s.exerciseId, durationSeconds: s.durationSeconds }
                    : { exerciseId: s.exerciseId, reps: s.reps ?? 1 },
            );
        } catch {
            setFailed((f) => [...f, s]);
        }
    }

    async function retryFailed() {
        const pending = failed;
        setFailed([]);
        for (const s of pending) await save(s);
    }

    function afterStep(logged: boolean) {
        if (logged) void save(step);
        buzz();
        setPausedMs(null);
        if (!next) {
            setPhase("done");
            return;
        }
        if (step.restSeconds === 0) {
            // No rest: go straight on. (A 0-second rest would otherwise never "expire" and get stuck.)
            startWork(nextIndex);
            return;
        }
        setPhase("rest");
        setEndsAt(Date.now() + step.restSeconds * 1000);
    }

    // a countdown reached zero: ready -> work, timed work -> rest, rest -> next work
    useEffect(() => {
        if (!expired) return;
        if (phase === "ready") startWork(index);
        else if (phase === "work") afterStep(true);
        else if (phase === "rest" && next) startWork(nextIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expired]);

    function togglePause() {
        if (pausedMs === null) setPausedMs(Math.max(0, endsAt - Date.now()));
        else {
            setEndsAt(Date.now() + pausedMs);
            setPausedMs(null);
        }
    }

    function addRest() {
        if (pausedMs === null) setEndsAt((t) => t + EXTRA_REST_SECONDS * 1000);
        else setPausedMs(pausedMs + EXTRA_REST_SECONDS * 1000);
    }

    function finishWorkout() {
        // Check for new personal records now, while the old bests are still loaded.
        stashNewRecords(session.id, findNewRecords(session.sets, records.data));
        finish.mutate({ notes: null }, { onSuccess: () => clearGuided(session.id) });
    }

    return (
        <GuidedShell total={steps.length} index={Math.min(index, steps.length)} onExit={onExit}>
            {failed.length > 0 && phase !== "done" && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                    {failed.length === 1 ? "A set" : `${failed.length} sets`} could not be saved. You can retry on the last screen.
                </p>
            )}
            {phase === "ready" && (
                <ReadyView
                    step={step} index={index} total={steps.length} left={left} paused={pausedMs !== null}
                    onStart={() => startWork(index)} onTogglePause={togglePause}
                />
            )}
            {phase === "work" && (
                <WorkView
                    step={step} index={index} total={steps.length} left={left} paused={pausedMs !== null}
                    onDone={() => afterStep(true)} onSkip={() => afterStep(false)} onTogglePause={togglePause}
                />
            )}
            {phase === "rest" && next && (
                <RestView
                    next={next} nextIndex={nextIndex} total={steps.length} left={left} paused={pausedMs !== null}
                    onAdd={addRest} onSkip={() => startWork(nextIndex)} onTogglePause={togglePause}
                />
            )}
            {phase === "done" && (
                <DoneView
                    setsLogged={session.sets.length}
                    failedCount={failed.length}
                    busy={finish.isPending || logSet.isPending}
                    error={finish.isError ? errorMessage(finish.error) : null}
                    onFinish={finishWorkout}
                    onRetry={() => void retryFailed()}
                    onExit={onExit}
                />
            )}
        </GuidedShell>
    );
}