"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { motion } from "motion/react";
import { enumLabel } from "@/lib/workout";
import { DUR, EASE } from "@/lib/motion";
import type { WorkoutSummaryResponse } from "@/types";

/** One workout: tap the text to preview it, tap the orange button to start it right away. */
export function WorkoutRow({
                               workout: w, index, disabled, onStart, delay = 0,
                           }: {
    workout: WorkoutSummaryResponse;
    index: number;
    disabled: boolean;
    onStart: () => void;
    /** extra seconds to wait before the row animates in (e.g. while a dialog is still opening) */
    delay?: number;
}) {
    return (
        <motion.li
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.base, ease: EASE, delay: delay + index * 0.07 }}
            className="flex items-stretch rounded-sm border bg-card transition-colors hover:border-primary"
        >
            <Link href={`/workouts/${w.id}`} className="min-w-0 flex-1 p-4 sm:p-5">
                <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] uppercase tracking-widest text-primary">
                    {enumLabel(w.level)}
                </span>
                <h3 className="mt-3 truncate font-display text-xl uppercase leading-tight sm:text-2xl">{w.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                    {w.estimatedMinutes} min · {w.exerciseCount} exercises
                </p>
            </Link>
            <button
                type="button"
                aria-label={`Start ${w.name}`}
                disabled={disabled}
                onClick={onStart}
                className="m-3 grid w-14 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground transition-transform enabled:active:scale-95 disabled:opacity-50 sm:w-16"
            >
                <Play className="h-5 w-5" />
            </button>
        </motion.li>
    );
}