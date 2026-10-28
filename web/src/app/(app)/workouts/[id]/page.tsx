"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play } from "lucide-react";
import { PageHeader } from "@/components/shell/AppShell";
import { Modal } from "@/components/ui/Modal";
import { ExerciseMedia } from "@/components/workout/ExerciseMedia";
import { ExerciseThumb } from "@/components/workout/ExerciseThumb";
import { useActiveSession, useExercise, useStartSession, useWorkout } from "@/hooks/use-workout";
import { isApiError } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { enumLabel, targetText } from "@/lib/workout";
import { WORKOUT_CATEGORIES } from "@/lib/workout-categories";
import { cardCls, pillPrimaryCls } from "@/components/ui/classes";
import {markGuided} from "@/lib/guided";

/** Sheet with the clip (or picture), description, steps and tips of one exercise. */
function ExercisePreview({ slug, onClose }: { slug: string | null; onClose: () => void }) {
    const ex = useExercise(slug);
    const d = ex.data;
    return (
        <Modal open={slug !== null} onClose={onClose} title={d?.name ?? "Exercise"}>
            {ex.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {ex.isError && <p role="alert" className="text-sm text-destructive">{errorMessage(ex.error)}</p>}
            {d && (
                <div>
                    <div className="relative aspect-video overflow-hidden rounded-sm">
                        {d.videoPath ? (
                            <ExerciseMedia
                                videoPath={d.videoPath}
                                thumbnailPath={d.thumbnailPath}
                                title={d.name}
                                className="absolute inset-0 h-full w-full"
                            />
                        ) : (
                            <ExerciseThumb path={d.thumbnailPath} alt={d.name} className="h-full w-full" />
                        )}
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">{d.description}</p>
                    <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
                        {d.steps.map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                    {d.tips.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">Tips</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                                {d.tips.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}

export default function WorkoutDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const detail = useWorkout(id);
    const active = useActiveSession();
    const start = useStartSession();
    const [preview, setPreview] = useState<string | null>(null);

    if (detail.isLoading) {
        return <div className="h-64 animate-pulse rounded-sm border bg-card" />;
    }
    if (detail.isError || !detail.data) {
        return (
            <div className={cardCls}>
                <p className="text-sm text-destructive">{detail.isError ? errorMessage(detail.error) : "Workout not found."}</p>
                <Link href="/workouts" className="mt-3 inline-block text-sm text-primary underline">Back to workouts</Link>
            </div>
        );
    }

    const { workout: w, exercises } = detail.data;
    const category = WORKOUT_CATEGORIES.find((c) => c.key === w.category)?.label ?? "Workout";
    const stats = [
        { v: `${w.estimatedMinutes} min`, l: "Duration" },
        { v: enumLabel(w.level), l: "Level" },
        { v: String(w.exerciseCount), l: "Exercises" },
    ];
    const begin = () =>
        start.mutate(
            { planId: w.id, dayId: w.dayId },
            { onSuccess: (s) => { markGuided(s.id); router.push(`/workouts/session/${s.id}`); } },
        );

    return (
        <div>
            <PageHeader kicker={category} title={w.name} />
            <Link href="/workouts" className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to workouts
            </Link>

            {w.description && <p className="mt-4 max-w-xl text-sm text-muted-foreground">{w.description}</p>}

            <div className="mt-6 grid max-w-xl grid-cols-3 gap-3">
                {stats.map((s) => (
                    <div key={s.l} className={`${cardCls} !p-4`}>
                        <p className="font-display text-xl uppercase">{s.v}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.l}</p>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                {active.data ? (
                    <div className="flex flex-wrap items-center gap-4">
                        <Link href={`/workouts/session/${active.data.id}`} className={pillPrimaryCls}>Resume current workout</Link>
                        <p className="text-sm text-muted-foreground">Finish or cancel it before starting another.</p>
                    </div>
                ) : (
                    <button type="button" disabled={start.isPending} onClick={begin} className={`${pillPrimaryCls} inline-flex items-center gap-2`}>
                        <Play className="h-4 w-4" /> {start.isPending ? "Starting…" : "Start workout"}
                    </button>
                )}
                {start.isError && (
                    <p role="alert" className="mt-3 text-sm text-destructive">
                        {errorMessage(start.error)}{" "}
                        {isApiError(start.error) && start.error.status === 400 && (
                            <Link href="/profile" className="text-primary underline">Open profile</Link>
                        )}
                    </p>
                )}
            </div>

            <h2 className="mt-10 font-display text-2xl uppercase">Exercises ({exercises.length})</h2>
            <ul className="mt-4 divide-y rounded-sm border bg-card">
                {exercises.map((pe) => (
                    <li key={pe.id}>
                        <button
                            type="button"
                            onClick={() => setPreview(pe.exercise.slug)}
                            className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted"
                        >
                            <ExerciseThumb path={pe.exercise.thumbnailPath} alt="" className="h-14 w-14 shrink-0 rounded-sm" />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-bold">{pe.exercise.name}</span>
                                <span className="text-xs text-muted-foreground">{enumLabel(pe.exercise.primaryMuscle)}</span>
                            </span>
                            <span className="shrink-0 text-sm text-muted-foreground">{targetText(pe)}</span>
                        </button>
                    </li>
                ))}
            </ul>

            <ExercisePreview slug={preview} onClose={() => setPreview(null)} />
        </div>
    );
}