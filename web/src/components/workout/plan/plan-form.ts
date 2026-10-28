import { formatClock, parseClock, parseNum } from "@/lib/workout";
import { TrackingType } from "@/types";
import type { ExerciseDetailResponse, PlanRequest, PlanResponse } from "@/types";

export const MAX_DAYS = 14;
export const MAX_EXERCISES = 30;

export type Mode = "reps" | "time";
export type ExRow = {
    key: string; exerciseId: string; name: string; mode: Mode;
    sets: string; repsMin: string; repsMax: string; seconds: string; rest: string; notes: string;
};
export type DayRow = { key: string; name: string; exercises: ExRow[] };

let counter = 0;
export const uid = () => `k${++counter}`;

export const newDay = (name: string): DayRow => ({ key: uid(), name, exercises: [] });

const modeOf = (t: TrackingType): Mode =>
    t === TrackingType.DURATION || t === TrackingType.DISTANCE_DURATION ? "time" : "reps";

export function newRow(ex: ExerciseDetailResponse): ExRow {
    return {
        key: uid(), exerciseId: ex.id, name: ex.name, mode: modeOf(ex.trackingType),
        sets: "3", repsMin: "8", repsMax: "12", seconds: "00:45", rest: "60", notes: "",
    };
}

export function fromPlan(plan: PlanResponse | undefined): DayRow[] {
    if (!plan) return [newDay("Day 1")];
    return [...plan.days]
        .sort((a, b) => a.dayOrder - b.dayOrder)
        .map((d) => ({
            key: uid(),
            name: d.name,
            exercises: [...d.exercises]
                .sort((a, b) => a.position - b.position)
                .map((pe) => ({
                    key: uid(),
                    exerciseId: pe.exercise.id,
                    name: pe.exercise.name,
                    // The plan only stores reps or time, which is all the form needs.
                    mode: pe.targetDurationSeconds != null ? ("time" as const) : ("reps" as const),
                    sets: String(pe.targetSets),
                    repsMin: pe.targetRepsMin != null ? String(pe.targetRepsMin) : "8",
                    repsMax: pe.targetRepsMax != null ? String(pe.targetRepsMax) : "12",
                    seconds: pe.targetDurationSeconds != null ? formatClock(pe.targetDurationSeconds) : "00:45",
                    rest: String(pe.restSeconds),
                    notes: pe.notes ?? "",
                })),
        }));
}

const inRange = (n: number | null, min: number, max: number) =>
    n !== null && Number.isInteger(n) && n >= min && n <= max;

/** Returns an error message, or null when the plan can be sent. */
export function validate(name: string, days: DayRow[]): string | null {
    if (!name.trim()) return "Give the plan a name.";
    if (days.length === 0) return "Add at least one day.";
    for (const [di, d] of days.entries()) {
        const where = d.name.trim() || `Day ${di + 1}`;
        if (!d.name.trim()) return `Day ${di + 1} needs a name.`;
        if (d.exercises.length === 0) return `${where} needs at least one exercise.`;
        for (const e of d.exercises) {
            const label = `${where} · ${e.name}`;
            if (!inRange(parseNum(e.sets), 1, 10)) return `${label}: sets must be 1 to 10.`;
            if (e.mode === "reps") {
                const lo = parseNum(e.repsMin);
                const hi = parseNum(e.repsMax);
                if (!inRange(lo, 1, 100) || !inRange(hi, 1, 100)) return `${label}: reps must be 1 to 100.`;
                if (lo! > hi!) return `${label}: min reps cannot be higher than max reps.`;
            } else {
                const s = parseClock(e.seconds);
                if (s === null || s < 5 || s > 7200) return `${label}: time must be between 0:05 and 2:00:00.`;
            }
            if (e.rest.trim() !== "" && !inRange(parseNum(e.rest), 0, 600)) return `${label}: rest must be 0 to 600 seconds.`;
        }
    }
    return null;
}

export function toRequest(name: string, description: string, days: DayRow[]): PlanRequest {
    return {
        name: name.trim(),
        description: description.trim() || null,
        days: days.map((d) => ({
            name: d.name.trim(),
            exercises: d.exercises.map((e) => ({
                exerciseId: e.exerciseId,
                targetSets: Number(parseNum(e.sets)),
                ...(e.mode === "reps"
                    ? { targetRepsMin: Number(parseNum(e.repsMin)), targetRepsMax: Number(parseNum(e.repsMax)) }
                    : { targetDurationSeconds: parseClock(e.seconds)! }),
                restSeconds: e.rest.trim() === "" ? null : Number(parseNum(e.rest)),
                notes: e.notes.trim() || null,
            })),
        })),
    };
}