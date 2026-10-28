"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/shell/AppShell";
import { cardCls } from "@/components/ui/classes";
import { MEAL_LABEL, MEAL_ORDER, fmt, gramsText } from "@/components/food/meal-meta";
import { useBalance, useDiary, useTodayIso, useTrends } from "@/hooks/use-food";
import { useCountUp } from "@/hooks/use-count-up";
import { useToday } from "@/hooks/use-today";
import { weekdayName } from "@/lib/dates";
import { errorMessage } from "@/lib/errors";
import { RecommendationType } from "@/types";

const ease = [0.2, 0.8, 0.2, 1] as const;

function Ring({ left, pct }: { left: number; pct: number }) {
    const r = 70;
    const c = 2 * Math.PI * r;
    const over = left < 0;
    const shown = useCountUp(Math.abs(left));
    return (
        <div className="relative h-44 w-44 shrink-0">
            <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                <circle cx="80" cy="80" r={r} fill="none" strokeWidth="14" className="stroke-muted" />
                {/* Draws itself on load and glides to the new value whenever you log food. */}
                <motion.circle
                    cx="80"
                    cy="80"
                    r={r}
                    fill="none"
                    strokeWidth="14"
                    strokeLinecap="round"
                    className={`transition-[stroke] duration-500 ${over ? "stroke-destructive" : "stroke-primary"}`}
                    strokeDasharray={c}
                    initial={{ strokeDashoffset: c }}
                    animate={{ strokeDashoffset: c * (1 - pct) }}
                    transition={{ duration: 1.1, ease }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl tabular-nums">{fmt(Math.round(shown))}</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{over ? "kcal over" : "kcal left"}</span>
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    const shown = useCountUp(value);
    return (
        <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
            <div className="font-display text-2xl tabular-nums">{fmt(Math.round(shown))}</div>
        </div>
    );
}

const pulse = "animate-pulse rounded-sm bg-muted";

export default function TodayPage() {
    const router = useRouter();
    const now = useToday();
    const today = useTodayIso();
    const balance = useBalance(today);
    const diary = useDiary(today);
    const trends = useTrends(7, today);
    const [q, setQ] = useState("");

    const hour = now?.getHours();
    const greeting = hour === undefined ? "Today" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    function search(e: FormEvent) {
        e.preventDefault();
        router.push(q.trim() ? `/add-food?q=${encodeURIComponent(q.trim())}` : "/add-food");
    }

    const b = balance.data;
    const groups = new Map((diary.data?.meals ?? []).map((m) => [m.mealType, m]));
    const days = trends.data?.days ?? [];
    const maxDay = Math.max(trends.data?.calorieTarget ?? 0, ...days.map((d) => d.eatenKcal), 1);
    const rec = b?.recommendation;

    return (
        <div>
            <PageHeader kicker={greeting} title="Today">
                <form onSubmit={search} className="hidden items-center gap-2 rounded-sm border bg-card px-4 py-2.5 md:flex">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search foods"
                        aria-label="Search foods"
                        className="w-40 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </form>
                <Link
                    href="/add-food"
                    className="hidden items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5 md:flex"
                >
                    <Plus className="h-4 w-4" /> Log food
                </Link>
            </PageHeader>

            {balance.isError && (
                <div className={`${cardCls} mt-8`}>
                    <p className="text-sm text-destructive">{errorMessage(balance.error)}</p>
                    <button type="button" onClick={() => void balance.refetch()} className="mt-3 text-sm text-primary underline">
                        Try again
                    </button>
                </div>
            )}

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
                <div className="space-y-5 stagger">
                    <section className={`${cardCls} flex flex-col items-center gap-6 sm:flex-row sm:flex-wrap`}>
                        {b ? (
                            <>
                                <Ring left={b.remainingKcal} pct={b.calorieTarget > 0 ? Math.min(1, Math.max(0, b.netKcal / b.calorieTarget)) : 0} />
                                <div className="w-full sm:w-auto">
                                    <div className="flex justify-center gap-6 sm:flex-col sm:justify-start lg:flex-row xl:flex-col">
                                        <Stat label="Eaten" value={b.eatenKcal} />
                                        <Stat label="Burned" value={b.burnedKcal} />
                                        <Stat label="Goal" value={b.calorieTarget} />
                                    </div>
                                    {b.creditedBurnKcal !== b.burnedKcal && (
                                        <p className="mt-3 text-center text-xs text-muted-foreground sm:text-left">{fmt(b.creditedBurnKcal)} kcal counted toward your goal</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className={`${pulse} h-44 w-full`} />
                        )}
                    </section>

                    <section className={cardCls}>
                        <h2 className="font-display text-xl uppercase">Macros</h2>
                        <div className="mt-4 space-y-4">
                            {b
                                ? (
                                    [
                                        ["Protein", b.protein, "bg-protein"],
                                        ["Carbs", b.carbs, "bg-carbs"],
                                        ["Fat", b.fat, "bg-fat"],
                                    ] as const
                                ).map(([name, m, bar], i) => (
                                    <div key={name}>
                                        <div className="mb-1.5 flex justify-between text-sm">
                                            <span className="font-medium">{name}</span>
                                            <span className="text-muted-foreground">
                          {fmt(m.consumedG)} / {fmt(m.targetG)} g
                        </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                                            <motion.div
                                                className={`h-full rounded-full ${bar}`}
                                                initial={{ width: "0%" }}
                                                animate={{ width: `${m.targetG > 0 ? Math.min(100, (m.consumedG / m.targetG) * 100) : 0}%` }}
                                                transition={{ duration: 0.8, ease, delay: 0.15 + i * 0.1 }}
                                            />
                                        </div>
                                    </div>
                                ))
                                : [0, 1, 2].map((i) => <div key={i} className={`${pulse} h-8`} />)}
                        </div>
                    </section>
                </div>

                <section className={`${cardCls} hidden animate-fadeup [animation-delay:80ms] lg:block`}>
                    <h2 className="font-display text-xl uppercase">Today&apos;s meals</h2>
                    <div className="mt-4 space-y-6">
                        {MEAL_ORDER.map((type) => {
                            const g = groups.get(type);
                            const entries = g?.entries ?? [];
                            return (
                                <div key={type}>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-sm font-bold uppercase tracking-widest">{MEAL_LABEL[type]}</span>
                                        <span className="text-sm text-muted-foreground">{fmt(g?.totals.kcal ?? 0)} kcal</span>
                                    </div>
                                    {entries.length === 0 ? (
                                        <Link href={`/add-food?meal=${type}`} className="mt-3 flex items-center gap-2 text-sm text-primary">
                                            <Plus className="h-4 w-4" /> Add {MEAL_LABEL[type].toLowerCase()}
                                        </Link>
                                    ) : (
                                        entries.map((e) => (
                                            <div key={e.id} className="flex items-center justify-between border-b py-3 last:border-0">
                                                <div>
                                                    <div className="text-sm font-medium">{e.foodName}</div>
                                                    <div className="text-xs text-muted-foreground">{gramsText(e.grams)}</div>
                                                </div>
                                                <span className="text-sm font-medium">{fmt(e.kcal)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <div className="space-y-5 stagger">
                    <section className={`${cardCls} hidden lg:block`}>
                        <h2 className="font-display text-xl uppercase">Last 7 days</h2>
                        <div className="mt-5 flex h-36 items-end gap-2">
                            {days.map((d, idx) => (
                                <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                                    <motion.div
                                        className={`w-full rounded-sm ${idx === days.length - 1 ? "bg-primary" : "bg-primary/25"}`}
                                        initial={{ height: "0%" }}
                                        animate={{ height: `${Math.max(2, (d.eatenKcal / maxDay) * 100)}%` }}
                                        transition={{ duration: 0.7, ease, delay: 0.2 + idx * 0.06 }}
                                        title={`${fmt(d.eatenKcal)} kcal`}
                                    />
                                    <span className="text-[10px] uppercase text-muted-foreground">{weekdayName(d.date, "short")}</span>
                                </div>
                            ))}
                            {trends.isLoading && <div className={`${pulse} h-full w-full`} />}
                        </div>
                    </section>

                    {rec && (
                        <section className="rounded-sm border border-primary/40 bg-primary/10 p-6">
                            <h2 className="font-bold">{rec.message}</h2>
                            {rec.type === RecommendationType.EAT_MORE && (
                                <Link href="/add-food" className="mt-4 inline-block rounded-sm bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                                    Add food
                                </Link>
                            )}
                            {rec.type === RecommendationType.BURN_OFF && (
                                <Link href="/workouts" className="mt-4 inline-block rounded-sm bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                                    Go to workouts
                                </Link>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}