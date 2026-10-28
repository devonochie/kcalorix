"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shell/AppShell";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { RecommendedExercises } from "@/components/workout/RecommendedExercises";
import { WorkoutTabs } from "@/components/workout/WorkoutTabs";
import { useExerciseList, useExerciseMeta } from "@/hooks/use-workout";
import { useDebounced } from "@/hooks/use-debounced";
import { errorMessage } from "@/lib/errors";
import { enumLabel } from "@/lib/workout";
import { fieldCls } from "@/components/ui/classes";
import type { Difficulty, Equipment, ExerciseCategory, MuscleGroup } from "@/types";

const pill = (on: boolean) =>
    `shrink-0 rounded-full border px-5 py-2.5 text-xs uppercase tracking-widest ${on ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`;

export default function ExercisesPage() {
    const [text, setText] = useState("");
    const [muscle, setMuscle] = useState("");
    const [category, setCategory] = useState("");
    const [equipment, setEquipment] = useState("");
    const [difficulty, setDifficulty] = useState("");

    const q = useDebounced(text.trim(), 400);
    const meta = useExerciseMeta();
    const list = useExerciseList({
        q: q || undefined,
        muscle: (muscle || undefined) as MuscleGroup | undefined,
        category: (category || undefined) as ExerciseCategory | undefined,
        equipment: (equipment || undefined) as Equipment | undefined,
        difficulty: (difficulty || undefined) as Difficulty | undefined,
    });

    const items = list.data?.pages.flatMap((p) => p.content) ?? [];
    const total = list.data?.pages[0]?.totalElements ?? 0;
    const anyFilter = !!(q || muscle || category || equipment || difficulty);

    const select = (label: string, value: string, set: (v: string) => void, options: string[] | undefined) => (
        <select aria-label={label} value={value} onChange={(e) => set(e.target.value)} className={`${fieldCls} !w-auto min-w-[10rem]`}>
            <option value="">{label}</option>
            {(options ?? []).map((o) => (
                <option key={o} value={o}>{enumLabel(o)}</option>
            ))}
        </select>
    );

    return (
        <div>
            <PageHeader kicker="Workout library" title="Exercises">
                <Link
                    href="/workouts/plans/new"
                    className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground"
                >
                    <Plus className="h-4 w-4" /> Create plan
                </Link>
            </PageHeader>

            <WorkoutTabs active="exercises" />

            {!anyFilter && <RecommendedExercises />}

            <label className="mt-6 flex max-w-xl items-center gap-3 rounded-full border bg-card px-5 py-3.5">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Search exercises"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
            </label>

            <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
                <button type="button" onClick={() => setMuscle("")} className={pill(muscle === "")}>All</button>
                {(meta.data?.muscles ?? []).map((m) => (
                    <button key={m} type="button" onClick={() => setMuscle(m)} className={pill(muscle === m)}>{enumLabel(m)}</button>
                ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
                {select("Any category", category, setCategory, meta.data?.categories)}
                {select("Any equipment", equipment, setEquipment, meta.data?.equipment)}
                {select("Any difficulty", difficulty, setDifficulty, meta.data?.difficulties)}
                {anyFilter && (
                    <button
                        type="button"
                        onClick={() => { setText(""); setMuscle(""); setCategory(""); setEquipment(""); setDifficulty(""); }}
                        className="text-xs uppercase tracking-widest text-primary underline"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {list.isError && (
                <div className="mt-6 rounded-sm border bg-card p-6">
                    <p className="text-sm text-destructive">{errorMessage(list.error)}</p>
                    <button type="button" onClick={() => void list.refetch()} className="mt-3 text-sm text-primary underline">Try again</button>
                </div>
            )}

            {list.isLoading && (
                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className="aspect-[4/3] animate-pulse rounded-sm border bg-card" />
                    ))}
                </div>
            )}

            {!list.isLoading && !list.isError && (
                <>
                    <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">{total} exercises</p>
                    <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((e) => <ExerciseCard key={e.id} exercise={e} />)}
                    </div>
                    {items.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No exercises match.</p>}
                    {list.hasNextPage && (
                        <div className="mt-8 flex justify-center">
                            <button
                                type="button"
                                onClick={() => void list.fetchNextPage()}
                                disabled={list.isFetchingNextPage}
                                className="rounded-full border bg-card px-8 py-3 text-xs uppercase tracking-widest disabled:opacity-60"
                            >
                                {list.isFetchingNextPage ? "Loading…" : "Load more"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}