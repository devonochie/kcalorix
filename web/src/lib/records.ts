import type { ExerciseRecordResponse, SessionSetResponse } from "@/types";

/**
 * Names of the exercises where this workout beat an existing personal record.
 * Call it BEFORE finishing, while the records list still has the old bests.
 * A first-ever attempt at an exercise does not count (there is nothing to beat yet).
 */
export function findNewRecords(sets: SessionSetResponse[], records: ExerciseRecordResponse[] | undefined): string[] {
    if (!records) return [];
    const names = new Set<string>();
    for (const s of sets) {
        const r = records.find((x) => x.exerciseId === s.exerciseId);
        if (!r) continue;
        let beat = false;
        if (s.reps != null && s.weightKg != null) beat = r.bestWeightKg != null && s.weightKg > r.bestWeightKg;
        else if (s.reps != null) beat = r.maxReps != null && s.reps > r.maxReps;
        if (s.durationSeconds != null && r.longestDurationSeconds != null && s.durationSeconds > r.longestDurationSeconds) beat = true;
        if (s.distanceMeters != null && r.longestDistanceMeters != null && s.distanceMeters > r.longestDistanceMeters) beat = true;
        if (beat) names.add(s.exerciseName);
    }
    return [...names];
}

/* The summary page opens right after finishing, so the result is handed over through sessionStorage. */
const key = (sessionId: string) => `Kcalorix:new-records:${sessionId}`;

export function stashNewRecords(sessionId: string, names: string[]) {
    try {
        if (names.length > 0) sessionStorage.setItem(key(sessionId), JSON.stringify(names));
        else sessionStorage.removeItem(key(sessionId));
    } catch {
        /* storage can be blocked, the celebration is optional */
    }
}

export function peekNewRecords(sessionId: string): string[] {
    try {
        const raw = sessionStorage.getItem(key(sessionId));
        return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
        return [];
    }
}

export function clearNewRecords(sessionId: string) {
    try {
        sessionStorage.removeItem(key(sessionId));
    } catch {
        /* ignore */
    }
}