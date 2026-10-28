"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/shell/AppShell";
import { EntryEditModal } from "@/components/food/EntryEditModal";
import { MEAL_LABEL, MEAL_ORDER, fmt, gramsText } from "@/components/food/meal-meta";
import { useDiary, useRestoreMeal, useTodayIso } from "@/hooks/use-food";
import { dayLabel, shiftIso, weekdayName } from "@/lib/dates";
import { errorMessage } from "@/lib/errors";
import { toast } from "@/lib/toast";
import type { MealEntryResponse } from "@/types";

const ease = [0.2, 0.8, 0.2, 1] as const;

export default function DiaryPage() {
    const today = useTodayIso();
    const [offset, setOffset] = useState(0); // days back from today (0 = today)
    const [direction, setDirection] = useState<1 | -1>(1); // which way the page slides when the day changes
    const [editing, setEditing] = useState<MealEntryResponse | null>(null);
    const restore = useRestoreMeal();

    const date = today ? shiftIso(today, offset) : null;
    const diary = useDiary(date);
    const groups = new Map((diary.data?.meals ?? []).map((m) => [m.mealType, m]));
    const totals = diary.data?.totals;

    function go(delta: -1 | 1) {
        setDirection(delta);
        setOffset(offset + delta);
    }

    function onDeleted(entry: MealEntryResponse) {
        if (!date) return;
        toast.success("Entry removed", {
            id: "entry-removed",
            duration: 6000,
            action: {
                label: "Undo",
                onClick: () =>
                    restore.mutate(
                        { date, mealType: entry.mealType, fdcId: entry.fdcId, grams: entry.grams },
                        { onError: (e) => toast.error(errorMessage(e)) },
                    ),
            },
        });
    }

    return (
        <div>
            <PageHeader kicker={date ? weekdayName(date) : "Diary"} title="Diary" />

            <div className="mt-8 flex items-center justify-between rounded-sm border bg-card px-4 py-3">
                <button type="button" aria-label="Previous day" onClick={() => go(-1)} className="transition-transform active:scale-75">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="text-center">
                    <div className="font-display text-xl uppercase">{date && today ? dayLabel(date, today) : "…"}</div>
                    <div className="text-xs text-muted-foreground">
                        {totals
                            ? `${fmt(totals.kcal)} kcal logged · P ${fmt(totals.proteinG)} g · C ${fmt(totals.carbsG)} g · F ${fmt(totals.fatG)} g`
                            : "Loading…"}
                    </div>
                </div>
                <button
                    type="button"
                    aria-label="Next day"
                    disabled={offset >= 0}
                    onClick={() => go(1)}
                    className="transition-transform enabled:active:scale-75 disabled:opacity-30"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {diary.isError && (
                <div className="mt-5 rounded-sm border bg-card p-6">
                    <p className="text-sm text-destructive">{errorMessage(diary.error)}</p>
                    <button type="button" onClick={() => void diary.refetch()} className="mt-3 text-sm text-primary underline">
                        Try again
                    </button>
                </div>
            )}

            {/* key={date}: a new day slides in from the side you navigated toward. */}
            <motion.div
                key={date ?? "loading"}
                initial={{ opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease }}
                className="mt-5 grid gap-5 md:grid-cols-2"
            >
                {MEAL_ORDER.map((type) => {
                    const g = groups.get(type);
                    const entries = g?.entries ?? [];
                    return (
                        <section key={type} className="rounded-sm border bg-card p-6">
                            <div className="flex items-baseline justify-between border-b pb-3">
                                <h2 className="font-display text-xl uppercase">{MEAL_LABEL[type]}</h2>
                                <span className="text-sm text-muted-foreground">{fmt(g?.totals.kcal ?? 0)} kcal</span>
                            </div>
                            {diary.isLoading && <div className="mt-3 h-12 animate-pulse rounded-sm bg-muted" />}
                            <AnimatePresence initial={false}>
                                {entries.map((e) => (
                                    <motion.div
                                        key={e.id}
                                        layout="position"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0, x: -24 }}
                                        transition={{ duration: 0.25, ease }}
                                        className="overflow-hidden border-b"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setEditing(e)}
                                            className="flex w-full items-center justify-between py-3 text-left"
                                        >
                                            <div>
                                                <div className="text-sm font-medium">{e.foodName}</div>
                                                <div className="text-xs text-muted-foreground">{gramsText(e.grams)}</div>
                                            </div>
                                            <span className="text-sm font-bold">{fmt(e.kcal)}</span>
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <Link
                                href={`/add-food?meal=${type}${date ? `&date=${date}` : ""}`}
                                className="mt-3 flex items-center gap-2 text-sm text-primary"
                            >
                                <Plus className="h-4 w-4" /> Add {MEAL_LABEL[type].toLowerCase()}
                            </Link>
                        </section>
                    );
                })}
            </motion.div>

            <EntryEditModal entry={editing} onClose={() => setEditing(null)} onDeleted={onDeleted} />
        </div>
    );
}