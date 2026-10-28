"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { PageHeader } from "@/components/shell/AppShell";
import { CategoryDialog } from "@/components/workout/CategoryDialog";
import { CategoryTile } from "@/components/workout/CategoryTile";
import { WorkoutRow } from "@/components/workout/WorkoutRow";
import { WorkoutTabs } from "@/components/workout/WorkoutTabs";
import { useActiveSession, useStartSession, useWorkouts } from "@/hooks/use-workout";
import { isApiError } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { markGuided } from "@/lib/guided";
import { sessionTitle } from "@/lib/workout";
import { WORKOUT_CATEGORIES } from "@/lib/workout-categories";
import { cardCls, pillPrimaryCls } from "@/components/ui/classes";
import { Difficulty, WorkoutCategory } from "@/types";
import type { WorkoutSummaryResponse } from "@/types";

const LEVEL_ORDER = [Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED];

function summary(list: WorkoutSummaryResponse[]): string | null {
    if (list.length === 0) return null;
    const mins = list.map((w) => w.estimatedMinutes);
    const lo = Math.min(...mins);
    const hi = Math.max(...mins);
    return `${list.length} workouts · ${lo === hi ? lo : `${lo}–${hi}`} min`;
}

export default function WorkoutsPage() {
    const router = useRouter();
    const active = useActiveSession();
    const all = useWorkouts();
    const start = useStartSession();

    // null = dialog closed
    const [category, setCategory] = useState<WorkoutCategory | null>(null);
    const closeDialog = useCallback(() => setCategory(null), []);

    const byCategory = useMemo(() => {
        const map = new Map<WorkoutCategory, WorkoutSummaryResponse[]>();
        for (const w of all.data ?? []) map.set(w.category, [...(map.get(w.category) ?? []), w]);
        for (const list of map.values()) list.sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));
        return map;
    }, [all.data]);

    const meta = WORKOUT_CATEGORIES.find((c) => c.key === category) ?? null;
    const rows = category ? byCategory.get(category) ?? [] : [];
    const busy = !!active.data || start.isPending;

    const begin = (w: WorkoutSummaryResponse) =>
        start.mutate(
            { planId: w.id, dayId: w.dayId },
            {
                onSuccess: (s) => {
                    markGuided(s.id);
                    router.push(`/workouts/session/${s.id}`);
                },
            },
        );

    return (
        <div>
            <PageHeader kicker="Train" title="Workouts" />
            <WorkoutTabs active="workouts" />

            {active.data && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-sm border border-primary/40 bg-primary/10 p-5">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Workout in progress</p>
                        <p className="font-display text-xl uppercase">{sessionTitle(active.data)}</p>
                    </div>
                    <Link href={`/workouts/session/${active.data.id}`} className={pillPrimaryCls}>Resume</Link>
                </div>
            )}

            <p className="mt-8 text-xs uppercase tracking-[0.3em] text-muted-foreground">Choose your focus</p>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                {WORKOUT_CATEGORIES.map((c, i) => (
                    <CategoryTile
                        key={c.key}
                        label={c.label}
                        detail={summary(byCategory.get(c.key) ?? [])}
                        icon={c.icon}
                        image={c.image}
                        selected={category === c.key}
                        wide={i === 0}
                        onSelect={() => {
                            start.reset();
                            setCategory(c.key);
                        }}
                    />
                ))}
            </div>

            <AnimatePresence>
                {meta && (
                    <CategoryDialog
                        key={meta.key}
                        label={meta.label}
                        blurb={meta.blurb}
                        detail={summary(rows)}
                        icon={meta.icon}
                        image={meta.image}
                        onClose={closeDialog}
                    >
                        {all.isLoading && (
                            <div className="space-y-3">
                                {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-sm border bg-card" />)}
                            </div>
                        )}
                        {all.isError && (
                            <div className={cardCls}>
                                <p className="text-sm text-destructive">{errorMessage(all.error)}</p>
                                <button type="button" onClick={() => void all.refetch()} className="mt-3 text-sm text-primary underline">Try again</button>
                            </div>
                        )}
                        {all.data && rows.length === 0 && (
                            <div className={cardCls}>
                                <p className="text-sm text-muted-foreground">
                                    No workouts here match your equipment or level yet. You can change them in your profile.
                                </p>
                                <Link href="/profile" className="mt-3 inline-block text-sm text-primary underline">Open profile</Link>
                            </div>
                        )}
                        <ul className="space-y-3">
                            {rows.map((w, i) => (
                                <WorkoutRow key={w.id} workout={w} index={i} delay={0.2} disabled={busy} onStart={() => begin(w)} />
                            ))}
                        </ul>

                        {start.isError && (
                            <p role="alert" className="mt-4 text-sm text-destructive">
                                {errorMessage(start.error)}{" "}
                                {isApiError(start.error) && start.error.status === 400 && (
                                    <Link href="/profile" className="text-primary underline">Open profile</Link>
                                )}
                            </p>
                        )}
                    </CategoryDialog>
                )}
            </AnimatePresence>
        </div>
    );
}