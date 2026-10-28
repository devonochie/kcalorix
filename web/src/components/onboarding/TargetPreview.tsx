"use client";

import { useCountUp } from "@/hooks/use-count-up";
import type { estimateTargets } from "@/lib/targets";

type Estimate = ReturnType<typeof estimateTargets>;

function MacroBar({ label, value, max }: { label: string; value: number; max: number }) {
    const shown = useCountUp(value, 500);
    return (
        <div className="mt-5">
            <div className="flex justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className="tabular-nums text-muted-foreground">{Math.round(shown)} g</span>
            </div>
            <div className="mt-1.5 h-2 bg-muted">
                <div
                    className="h-full bg-primary transition-[width] duration-500 ease-out"
                    style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
                />
            </div>
        </div>
    );
}

export function TargetPreview({ estimate }: { estimate: Estimate }) {
    const kcal = useCountUp(estimate.calorieTarget, 500);

    return (
        <aside className="rounded-sm border bg-card p-5 sm:p-7">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Your daily target</p>
            <div className="mt-4 font-display text-6xl tabular-nums">
                {Math.round(kcal).toLocaleString()} <span className="font-sans text-base text-muted-foreground">kcal</span>
            </div>
            <MacroBar label="Protein" value={estimate.proteinG} max={250} />
            <MacroBar label="Carbs" value={estimate.carbsG} max={400} />
            <MacroBar label="Fat" value={estimate.fatG} max={120} />
            {estimate.notes.map((n) => (
                <p key={n} className="mt-4 text-xs text-destructive">
                    {n}
                </p>
            ))}
            <p className="mt-6 text-xs text-muted-foreground">
                It updates as you answer. You can change it any time in your profile.
            </p>
        </aside>
    );
}