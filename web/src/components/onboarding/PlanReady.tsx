"use client";

import { motion, type Variants } from "motion/react";
import { Confetti } from "@/components/ui/Confetti";
import { pillPrimaryCls } from "@/components/ui/classes";
import { useCountUp } from "@/hooks/use-count-up";
import { DUR, EASE } from "@/lib/motion";
import type { estimateTargets } from "@/lib/targets";

type Estimate = ReturnType<typeof estimateTargets>;

const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE } },
};

/** The short "your plan is ready" reveal shown right after the profile is saved. */
export function PlanReady({ estimate, name, onContinue }: { estimate: Estimate; name: string; onContinue: () => void }) {
    const kcal = useCountUp(estimate.calorieTarget, 1200);
    const macros = [
        ["Protein", estimate.proteinG],
        ["Carbs", estimate.carbsG],
        ["Fat", estimate.fatG],
    ] as const;

    return (
        <div className="app-light bg-app grid min-h-dvh place-items-center px-5 text-center text-foreground">
            <Confetti />
            <motion.div variants={list} initial="hidden" animate="show" className="w-full max-w-md" role="status">
                <motion.p variants={item} className="text-xs uppercase tracking-[0.3em] text-primary">
                    {name ? `All set, ${name}` : "All set"}
                </motion.p>
                <motion.h1 variants={item} className="mt-3 font-display text-5xl uppercase md:text-6xl">
                    Your plan is ready
                </motion.h1>
                <motion.div variants={item} className="mt-8 rounded-sm border bg-card p-7">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Your daily target</p>
                    <div className="mt-3 font-display text-7xl tabular-nums">
                        {Math.round(kcal).toLocaleString()} <span className="font-sans text-base text-muted-foreground">kcal</span>
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-3 border-t pt-5">
                        {macros.map(([label, grams]) => (
                            <div key={label}>
                                <div className="font-display text-2xl tabular-nums">{grams} g</div>
                                <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
                <motion.div variants={item} className="mt-8">
                    <button type="button" onClick={onContinue} className={pillPrimaryCls}>
                        Go to today
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}