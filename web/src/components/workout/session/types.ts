import type { TrackingType } from "@/types";
import type { ExerciseDetailResponse, PlanExerciseResponse } from "@/types";

/** One exercise in the running workout. */
export type Item = {
    exerciseId: string;
    name: string;
    thumb: string | null;
    group: string | null;
    difficulty: string | null;
    tracking: TrackingType | null; // null while the exercise is still loading
    detail: ExerciseDetailResponse | null;
    target: PlanExerciseResponse | null;
};