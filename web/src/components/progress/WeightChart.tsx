import { motion } from "motion/react";
import { formatWeight } from "@/lib/units";
import type { UnitSystem, WeightLogResponse } from "@/types";

const ms = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const short = (iso: string) =>
    new Date(ms(iso)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** Line chart of weigh-ins, spaced by date. */
export function WeightChart({ weights, units }: { weights: WeightLogResponse[]; units: UnitSystem }) {
    const pts = [...weights]
        .map((w) => ({ date: w.date, kg: Number(w.weightKg) }))
        .sort((a, b) => a.date.localeCompare(b.date));

    if (pts.length === 0) {
        return <p className="mt-6 text-sm text-muted-foreground">No weigh-ins in this range yet. Log your weight to start the chart.</p>;
    }

    const kgs = pts.map((p) => p.kg);
    const lo = Math.min(...kgs);
    const hi = Math.max(...kgs);
    const min = lo - 0.5;
    const max = hi + 0.5;
    const t0 = ms(pts[0]!.date);
    const t1 = ms(pts[pts.length - 1]!.date);
    const x = (iso: string) => (pts.length === 1 || t1 === t0 ? 150 : ((ms(iso) - t0) / (t1 - t0)) * 300);
    const y = (kg: number) => 10 + ((max - kg) / (max - min)) * 80;
    const coords = pts.map((p) => [x(p.date), y(p.kg)] as const);
    const r = pts.length > 30 ? 2 : 3.5;

    return (
        <div className="mt-6">
            {/* key = redraw the line whenever the data changes (new range, new weigh-in) */}
            <svg key={`${pts[0]!.date}-${pts.length}-${pts[pts.length - 1]!.date}`} viewBox="-6 0 312 100" className="w-full overflow-visible" role="img" aria-label="Weight over time">
                {coords.length > 1 && (
                    <motion.polyline
                        points={coords.map((c) => c.join(",")).join(" ")}
                        fill="none"
                        className="stroke-primary"
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
                    />
                )}
                {coords.map(([cx, cy], i) => (
                    <motion.circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={r}
                        className="fill-card stroke-primary"
                        strokeWidth="2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 + (i / pts.length) * 0.8 }}
                    >
                        <title>{`${short(pts[i]!.date)}: ${formatWeight(pts[i]!.kg, units)}`}</title>
                    </motion.circle>
                ))}
            </svg>
            <div className="mt-3 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>{short(pts[0]!.date)}</span>
                <span>{pts.length > 1 ? short(pts[pts.length - 1]!.date) : ""}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
                Low {formatWeight(lo, units)} · High {formatWeight(hi, units)} · {pts.length} {pts.length === 1 ? "weigh-in" : "weigh-ins"}
            </p>
        </div>
    );
}