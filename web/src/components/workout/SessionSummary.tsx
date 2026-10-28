"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Clock, Dumbbell, Flame, Trophy, Weight, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shell/AppShell";
import { Confetti } from "@/components/ui/Confetti";
import { useCountUp } from "@/hooks/use-count-up";
import { useProfile } from "@/hooks/use-profile";
import { clearNewRecords, peekNewRecords } from "@/lib/records";
import { describeSet, formatDuration, kgToDisplay, sessionTitle, setVolumeKg, weightLabel } from "@/lib/workout";
import { cardCls, pillBtnCls, pillPrimaryCls } from "@/components/ui/classes";
import { SessionStatus, UnitSystem } from "@/types";
import type { SessionResponse, SessionSetResponse } from "@/types";

/** One stat box. The number counts up from 0; null shows a dash. */
function StatTile({ icon: Icon, label, value, format, index }: {
    icon: LucideIcon;
    label: string;
    value: number | null;
    format: (n: number) => string;
    index: number;
}) {
    const shown = useCountUp(value ?? 0, 1100);
    return (
        <div
            className="flex animate-fadeup items-center gap-3 rounded-sm border bg-card p-4"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-primary/15 text-primary"><Icon className="h-4 w-4" /></span>
            <div className="min-w-0">
                <div className="truncate text-sm font-bold tabular-nums">{value === null ? "—" : format(Math.round(shown))}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
            </div>
        </div>
    );
}

export function SessionSummary({ session }: { session: SessionResponse }) {
    const units = useProfile().data?.unitSystem ?? UnitSystem.METRIC;
    const cancelled = session.status === SessionStatus.CANCELLED;
    const volumeKg = session.sets.reduce((sum, s) => sum + setVolumeKg(s), 0);

    // Records beaten in this workout (saved just before finishing). Read once, then cleared so a revisit doesn't celebrate again.
    const [newRecords] = useState(() => (cancelled ? [] : peekNewRecords(session.id)));
    useEffect(() => clearNewRecords(session.id), [session.id]);

    // Group the sets by exercise, in the order the exercises were first used.
    const groups = new Map<string, { name: string; sets: SessionSetResponse[] }>();
    for (const s of session.sets) {
        const g = groups.get(s.exerciseId) ?? { name: s.exerciseName, sets: [] };
        g.sets.push(s);
        groups.set(s.exerciseId, g);
    }

    const stats = [
        { icon: Clock, l: "Duration", v: session.durationSeconds, f: (n: number) => formatDuration(n) },
        { icon: Flame, l: "Calories burned", v: session.caloriesBurned, f: (n: number) => `${n} kcal` },
        { icon: Dumbbell, l: "Sets", v: session.sets.length, f: (n: number) => String(n) },
        {
            icon: Weight,
            l: "Volume",
            v: volumeKg > 0 ? kgToDisplay(volumeKg, units) : null,
            f: (n: number) => `${n.toLocaleString()} ${weightLabel(units)}`,
        },
    ];

    return (
        <div>
            {newRecords.length > 0 && <Confetti />}
            <PageHeader
                kicker={cancelled ? "Cancelled" : new Date(session.startedAt).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                title={cancelled ? "Workout cancelled" : "Workout complete"}
            />
            <Link href="/workouts" className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to workouts
            </Link>

            <p className="mt-6 font-display text-2xl uppercase">{sessionTitle(session)}</p>

            {newRecords.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
                    className="mt-5 flex items-center gap-4 rounded-sm border border-primary/40 bg-primary/10 p-5"
                >
                    <motion.span
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.45 }}
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                    >
                        <Trophy className="h-5 w-5" />
                    </motion.span>
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">New personal {newRecords.length > 1 ? "records" : "record"}</p>
                        <p className="font-bold">{newRecords.join(" · ")}</p>
                    </div>
                </motion.section>
            )}

            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                {stats.map((s, i) => (
                    <StatTile key={s.l} icon={s.icon} label={s.l} value={s.v} format={s.f} index={i} />
                ))}
            </div>

            {session.notes && (
                <section className={`${cardCls} mt-5`}>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Notes</p>
                    <p className="mt-2 text-sm">{session.notes}</p>
                </section>
            )}

            <div className="mt-5 grid gap-5 md:grid-cols-2">
                {[...groups.entries()].map(([id, g], i) => (
                    <section key={id} className={`${cardCls} animate-fadeup`} style={{ animationDelay: `${300 + i * 80}ms` }}>
                        <h2 className="font-display text-xl uppercase">{g.name}</h2>
                        <ul className="mt-3 divide-y">
                            {g.sets.map((s) => (
                                <li key={s.id} className="flex justify-between py-2.5 text-sm">
                                    <span className="text-muted-foreground">Set {s.setNumber}</span>
                                    <span className="font-bold tabular-nums">{describeSet(s, units)}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
                {groups.size === 0 && <p className="text-sm text-muted-foreground">No sets were logged.</p>}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/workouts" className={pillPrimaryCls}>Done</Link>
                {!cancelled && <Link href="/progress" className={pillBtnCls}>View progress</Link>}
            </div>
        </div>
    );
}