"use client";

import { useState } from "react";
import { Plus, Trophy } from "lucide-react";
import { PageHeader } from "@/components/shell/AppShell";
import { CaloriesChart } from "@/components/progress/CaloriesChart";
import { LogWeightModal } from "@/components/progress/LogWeightModal";
import { WeightChart } from "@/components/progress/WeightChart";
import { cardCls } from "@/components/ui/classes";
import { useTodayIso, useTrends } from "@/hooks/use-food";
import { useProfile } from "@/hooks/use-profile";
import { useRecords } from "@/hooks/use-workout";
import { errorMessage } from "@/lib/errors";
import { formatWeight } from "@/lib/units";
import { recordLines } from "@/lib/workout";
import { UnitSystem } from "@/types";

const RANGES = [7, 30, 90];
const h2 = "font-display text-xl uppercase";

export default function ProgressPage() {
    const [range, setRange] = useState(30);
    const [logging, setLogging] = useState(false);

    const today = useTodayIso();
    const profile = useProfile();
    const trends = useTrends(range, today);
    const records = useRecords();

    const units = profile.data?.unitSystem ?? UnitSystem.METRIC;
    const data = trends.data;

    const weights = [...(data?.weights ?? [])].sort((a, b) => a.date.localeCompare(b.date));
    const lastWeigh = weights[weights.length - 1];
    const currentKg = lastWeigh ? Number(lastWeigh.weightKg) : profile.data ? Number(profile.data.weightKg) : null;
    const change = data?.weightChangeKg ?? null;
    const workouts = data ? data.days.reduce((sum, d) => sum + d.workoutsCompleted, 0) : 0;

    const stats: [string, string, string][] = data
        ? [
            [
                "Current weight",
                currentKg !== null ? formatWeight(currentKg, units) : "—",
                change === null
                    ? "Log your weight to see the change"
                    : `${change > 0 ? "+" : change < 0 ? "−" : ""}${formatWeight(Math.abs(change), units)} in ${range} days`,
            ],
            [
                "Avg. eaten",
                `${Math.round(data.avgEatenKcal).toLocaleString()} kcal`,
                `Goal ${Math.round(data.calorieTarget).toLocaleString()} kcal · logged ${data.daysLogged} of ${range} days`,
            ],
            ["Avg. burned", `${Math.round(data.avgBurnedKcal).toLocaleString()} kcal`, "From workouts, per day"],
            ["Workouts", String(workouts), `Last ${range} days`],
        ]
        : [];

    const prs = (records.data ?? [])
        .map((r) => ({ r, lines: recordLines(r, units) }))
        .filter((x) => x.lines.length > 0);

    return (
        <div>
            <PageHeader kicker="Your trends" title="Progress">
                <div className="flex gap-2">
                    {RANGES.map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setRange(r)}
                            className={`rounded-full border px-4 py-2.5 text-xs uppercase tracking-widest ${range === r ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
                        >
                            {r} days
                        </button>
                    ))}
                </div>
            </PageHeader>

            {trends.isError && (
                <div className={`${cardCls} mt-8`}>
                    <p className="text-sm text-destructive">{errorMessage(trends.error)}</p>
                    <button type="button" onClick={() => void trends.refetch()} className="mt-3 text-sm text-primary underline">
                        Try again
                    </button>
                </div>
            )}

            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {trends.isLoading || !today
                    ? [0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-sm border bg-card" />)
                    : stats.map(([label, value, sub], i) => (
                        <div key={label} className={`${cardCls} animate-fadeup`} style={{ animationDelay: `${i * 70}ms` }}>
                            <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
                            <div className="mt-2 font-display text-4xl">{value}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
                        </div>
                    ))}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <section className={cardCls}>
                    <div className="flex items-center justify-between gap-3">
                        <h2 className={h2}>Weight</h2>
                        <button
                            type="button"
                            disabled={!today}
                            onClick={() => setLogging(true)}
                            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-60"
                        >
                            <Plus className="h-4 w-4" /> Log weight
                        </button>
                    </div>
                    {trends.isLoading ? (
                        <div className="mt-6 h-40 animate-pulse rounded-sm bg-muted" />
                    ) : (
                        <WeightChart weights={weights} units={units} />
                    )}
                </section>

                <section className={cardCls}>
                    <h2 className={h2}>Calories, last {range} days</h2>
                    {trends.isLoading || !data ? (
                        <div className="mt-6 h-48 animate-pulse rounded-sm bg-muted" />
                    ) : (
                        <CaloriesChart days={data.days} target={data.calorieTarget} />
                    )}
                </section>
            </div>

            <section className={`${cardCls} mt-5`}>
                <h2 className={h2}>Personal records</h2>
                {records.isLoading && <div className="mt-4 h-20 animate-pulse rounded-sm bg-muted" />}
                {records.isError && <p className="mt-4 text-sm text-destructive">{errorMessage(records.error)}</p>}
                {records.data && prs.length === 0 && (
                    <p className="mt-4 text-sm text-muted-foreground">
                        Finish a workout and your best lifts and times will show up here.
                    </p>
                )}
                <div className="mt-2 grid gap-x-8 md:grid-cols-2">
                    {prs.map(({ r, lines }) => (
                        <div key={r.exerciseId} className="flex items-center gap-3 border-b py-4 last:border-0">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <Trophy className="h-4 w-4" />
              </span>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium">{r.exerciseName}</div>
                                <div className="text-xs text-muted-foreground">{lines.join(" · ")}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {today && <LogWeightModal open={logging} onClose={() => setLogging(false)} units={units} today={today} />}
        </div>
    );
}