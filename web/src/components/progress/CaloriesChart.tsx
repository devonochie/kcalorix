import { motion } from "motion/react";
import { weekdayName } from "@/lib/dates";
import type { DayTrend } from "@/types";

const short = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** One bar per day. Bright bars are days over the calorie goal, the dashed line is the goal. */
export function CaloriesChart({ days, target }: { days: DayTrend[]; target: number }) {
    if (days.length === 0) return <p className="mt-6 text-sm text-muted-foreground">No data yet.</p>;

    const max = Math.max(target * 1.25, ...days.map((d) => d.eatenKcal), 1);
    const weekly = days.length <= 7;

    return (
        <div className="mt-6">
            <div className="relative h-48">
                <div className={`flex h-full items-end ${weekly ? "gap-2" : "gap-px"}`}>
                    {days.map((d, i) => (
                        <div key={d.date} className="flex h-full flex-1 items-end">
                            <motion.div
                                className={`w-full rounded-t-sm ${d.eatenKcal === 0 ? "bg-muted" : d.eatenKcal > target ? "bg-primary" : "bg-primary/30"}`}
                                initial={{ height: "0%" }}
                                animate={{ height: d.eatenKcal === 0 ? "2px" : `${(d.eatenKcal / max) * 100}%` }}
                                transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1], delay: Math.min(i * 0.02, 0.5) }}
                                title={`${short(d.date)}: ${Math.round(d.eatenKcal).toLocaleString()} kcal`}
                            />
                        </div>
                    ))}
                </div>
                <div
                    className="pointer-events-none absolute inset-x-0 border-t border-dashed border-muted-foreground/60"
                    style={{ bottom: `${(target / max) * 100}%` }}
                />
            </div>
            {weekly ? (
                <div className="mt-2 flex gap-2">
                    {days.map((d) => (
                        <span key={d.date} className="flex-1 text-center text-[10px] uppercase text-muted-foreground">
              {weekdayName(d.date, "short")}
            </span>
                    ))}
                </div>
            ) : (
                <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                    <span>{short(days[0]!.date)}</span>
                    <span>{short(days[days.length - 1]!.date)}</span>
                </div>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
                Bright bars are days over your {Math.round(target).toLocaleString()} kcal goal.
            </p>
        </div>
    );
}