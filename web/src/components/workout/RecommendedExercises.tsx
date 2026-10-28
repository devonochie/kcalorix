"use client";

import { Sparkles } from "lucide-react";
import { ExerciseCard } from "./ExerciseCard";
import { useRecommendedExercises } from "@/hooks/use-workout";

/** "Recommended for you": exercises ranked for the user's goal, level and equipment. */
export function RecommendedExercises() {
    const { data, isLoading, isError } = useRecommendedExercises();

    if (isError) return null; // the library below still works
    if (isLoading) {
        return (
            <div className="mt-6 flex gap-4 overflow-hidden">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[4/3] w-56 shrink-0 animate-pulse rounded-sm border bg-card" />
                ))}
            </div>
        );
    }
    if (!data || data.items.length === 0) return null;

    return (
        <section className="mt-6">
            <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-display text-2xl uppercase">Recommended for you</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{data.headline}</p>
            <div className="-mx-5 mt-4 flex gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0">
                {data.items.map(({ exercise, reason }) => (
                    <div key={exercise.id} className="w-56 shrink-0">
                        <ExerciseCard exercise={exercise} />
                        <p className="mt-2 text-xs text-muted-foreground">{reason}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}