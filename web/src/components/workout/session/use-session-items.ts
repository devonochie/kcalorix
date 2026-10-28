"use client";

import { useState } from "react";
import { useExerciseDetails, usePlan } from "@/hooks/use-workout";
import { enumLabel, inferTrackingType } from "@/lib/workout";
import type { ExerciseDetailResponse, SessionResponse } from "@/types";
import type { Item } from "./types";

/**
 * Builds the exercise list of a running workout:
 * plan day exercises + exercises added during the session + exercises that already have sets.
 */
export function useSessionItems(session: SessionResponse) {
    const [extras, setExtras] = useState<Item[]>([]);

    const plan = usePlan(session.planId);
    const day = plan.data?.days.find((d) => d.name === session.dayName) ?? null;
    const planExercises = day ? [...day.exercises].sort((a, b) => a.position - b.position) : [];
    const details = useExerciseDetails(planExercises.map((p) => p.exercise.slug));

    const items: Item[] = [];
    const seen = new Set<string>();
    const firstSet = (exerciseId: string) => session.sets.find((s) => s.exerciseId === exerciseId);

    for (const pe of planExercises) {
        const detail = details.get(pe.exercise.slug) ?? null;
        const logged = firstSet(pe.exercise.id);
        seen.add(pe.exercise.id);
        items.push({
            exerciseId: pe.exercise.id,
            name: pe.exercise.name,
            thumb: pe.exercise.thumbnailPath,
            group: enumLabel(pe.exercise.primaryMuscle),
            difficulty: enumLabel(pe.exercise.difficulty),
            tracking: detail?.trackingType ?? (logged ? inferTrackingType(logged) : null),
            detail,
            target: pe,
        });
    }
    for (const x of extras) {
        if (seen.has(x.exerciseId)) continue;
        seen.add(x.exerciseId);
        items.push(x);
    }
    for (const s of session.sets) {
        if (seen.has(s.exerciseId)) continue;
        seen.add(s.exerciseId);
        items.push({
            exerciseId: s.exerciseId, name: s.exerciseName, thumb: null, group: null, difficulty: null,
            tracking: inferTrackingType(s), detail: null, target: null,
        });
    }

    function addExtra(ex: ExerciseDetailResponse) {
        const item: Item = {
            exerciseId: ex.id, name: ex.name, thumb: ex.thumbnailPath, group: enumLabel(ex.primaryMuscle),
            difficulty: enumLabel(ex.difficulty), tracking: ex.trackingType, detail: ex, target: null,
        };
        setExtras((all) => (all.some((x) => x.exerciseId === ex.id) ? all : [...all, item]));
    }

    return { items, plan, addExtra };
}