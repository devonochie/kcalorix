import { formatClock } from "@/lib/workout";
import type { SessionSetResponse } from "@/types";
import type { Item } from "../session/types";

/** One thing to do in guided mode: one set of one exercise. */
export type Step = {
    exerciseId: string;
    name: string;
    thumb: string | null;
    videoPath: string | null;
    howTo: string[];                // first few instructions, shown on the "ready" screen
    setNumber: number;
    setCount: number;
    durationSeconds: number | null; // timed step
    reps: number | null;            // reps step
    restSeconds: number;            // rest after this step
};

/** Expands the plan exercises into one step per set, in plan order. Free exercises (no target) are skipped. */
export function buildSteps(items: Item[]): Step[] {
    const steps: Step[] = [];
    for (const it of items) {
        const t = it.target;
        if (!t) continue;
        for (let n = 1; n <= t.targetSets; n++) {
            steps.push({
                exerciseId: it.exerciseId,
                name: it.name,
                thumb: it.detail?.thumbnailPath ?? it.thumb,
                videoPath: it.detail?.videoPath ?? null,
                howTo: (it.detail?.steps ?? []).slice(0, 3),
                setNumber: n,
                setCount: t.targetSets,
                durationSeconds: t.targetDurationSeconds,
                reps: t.targetDurationSeconds == null ? (t.targetRepsMax ?? t.targetRepsMin) : null,
                restSeconds: t.restSeconds,
            });
        }
    }
    return steps;
}

/** Where to continue after a refresh: the first step whose set is not logged yet. */
export function firstUnlogged(steps: Step[], sets: SessionSetResponse[]): number {
    const logged = new Map<string, number>();
    for (const s of sets) logged.set(s.exerciseId, (logged.get(s.exerciseId) ?? 0) + 1);
    const seen = new Map<string, number>();
    for (let i = 0; i < steps.length; i++) {
        const id = steps[i]!.exerciseId;
        const n = (seen.get(id) ?? 0) + 1;
        seen.set(id, n);
        if (n > (logged.get(id) ?? 0)) return i;
    }
    return steps.length;
}

/** "00:30" for a timed step, "× 14" for a reps step. */
export const stepTarget = (s: Step) =>
    s.durationSeconds != null ? formatClock(s.durationSeconds) : `× ${s.reps ?? 0}`;