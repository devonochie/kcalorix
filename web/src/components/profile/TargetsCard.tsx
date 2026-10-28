"use client";

import { useEffect, useState } from "react";
import { Flame, Target } from "lucide-react";
import { useTargets } from "@/hooks/use-profile";
import { profileCardCls, SectionHeading } from "./profile-ui";

/** Counts up from 0 to `value` once (skipped when the device asks for reduced motion). */
function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
    const [v, setV] = useState(0);
    useEffect(() => {
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            setV(value);
            return;
        }
        let raf = 0;
        const t0 = performance.now();
        const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / 900);
            setV(Math.round(value * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value]);
    return <>{v.toLocaleString()}{suffix}</>;
}

export function TargetsCard() {
    const { data, isLoading, isError } = useTargets();

    // share of the day's calories each macro covers (protein and carbs 4 kcal/g, fat 9 kcal/g)
    const share = (g: number, kcalPerG: number) =>
        data && data.calorieTarget > 0 ? Math.min(100, Math.round(((g * kcalPerG) / data.calorieTarget) * 100)) : 0;

    const macros = data
        ? [
            { label: "Protein", g: data.proteinG, color: "var(--protein)", pct: share(data.proteinG, 4) },
            { label: "Carbs", g: data.carbsG, color: "var(--carbs)", pct: share(data.carbsG, 4) },
            { label: "Fat", g: data.fatG, color: "var(--fat)", pct: share(data.fatG, 9) },
        ]
        : [];

    return (
        <section className={profileCardCls}>
            <SectionHeading icon={Target} title="Daily targets" sub="Worked out from your goals and body stats" />
            {isLoading && <div className="h-40 animate-pulse rounded-sm bg-muted" />}
            {isError && <p className="text-sm text-destructive">Couldn&apos;t load your targets.</p>}
            {data && (
                <>
                    <div className="animate-fadeup relative overflow-hidden rounded-sm bg-gradient-to-br from-primary to-primary/70 p-5 text-primary-foreground">
                        <Flame aria-hidden className="pointer-events-none absolute -bottom-6 -right-4 h-32 w-32 -rotate-12 text-primary-foreground/15" />
                        <div className="relative">
                            <div className="text-[10px] uppercase tracking-[0.3em] opacity-80">Calories per day</div>
                            <div className="font-display text-5xl leading-none sm:text-6xl">
                                <CountUp value={data.calorieTarget} />
                                <span className="ml-2 text-lg opacity-80">kcal</span>
                            </div>
                        </div>
                    </div>

                    <div className="stagger mt-3 grid grid-cols-3 gap-3">
                        {macros.map((m) => (
                            <div key={m.label} className="rounded-sm border bg-background p-3 sm:p-4">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
                                    {m.label}
                                </div>
                                <div className="mt-1 font-display text-2xl leading-none sm:text-3xl">
                                    <CountUp value={m.g} suffix=" g" />
                                </div>
                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                                    <span
                                        className="animate-grow-x block h-full rounded-full"
                                        style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                                    />
                                </div>
                                <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{m.pct}% of kcal</div>
                            </div>
                        ))}
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground">
                        Resting energy (BMR) {data.bmr.toLocaleString()} kcal · Daily energy use (TDEE) {data.tdee.toLocaleString()} kcal
                    </p>
                    {data.notes.map((n) => (
                        <p key={n} className="mt-2 text-xs text-destructive">
                            {n}
                        </p>
                    ))}
                </>
            )}
        </section>
    );
}