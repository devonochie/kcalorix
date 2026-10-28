"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ChevronLeft, ChevronRight, Clock, Dumbbell, Flame, Pencil, Play, Plus, Sparkles, Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/shell/AppShell";
import { Modal } from "@/components/ui/Modal";
import { WorkoutTabs } from "@/components/workout/WorkoutTabs";
import {
    useActiveSession, useDeletePlan, useGeneratePlan, usePlan, usePlans, useSessionHistory, useStartSession,
} from "@/hooks/use-workout";
import { useProfile } from "@/hooks/use-profile";
import { isApiError } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { formatDuration, sessionTitle } from "@/lib/workout";
import { cardCls, pillBtnCls, pillPrimaryCls } from "@/components/ui/classes";
import type { PlanSummaryResponse, StartSessionRequest } from "@/types";

/** "equipment HOME_BASIC" -> "equipment Home basic": makes generated descriptions read like text. */
const pretty = (text: string) =>
    text.replace(/\b[A-Z][A-Z_]{2,}\b/g, (w) => {
        const s = w.replace(/_/g, " ").toLowerCase();
        return s.charAt(0).toUpperCase() + s.slice(1);
    });

/** Lets the person choose which day of a plan to train. */
function StartPlanModal({
                            plan, onClose, onStart, busy,
                        }: {
    plan: PlanSummaryResponse | null;
    onClose: () => void;
    onStart: (body: StartSessionRequest) => void;
    busy: boolean;
}) {
    const detail = usePlan(plan?.id ?? null);
    const days = detail.data ? [...detail.data.days].sort((a, b) => a.dayOrder - b.dayOrder) : [];
    return (
        <Modal open={plan !== null} onClose={onClose} title={plan ? `Start ${plan.name}` : "Start"}>
            <p className="text-sm text-muted-foreground">Which day are you training?</p>
            {detail.isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
            {detail.isError && <p role="alert" className="mt-4 text-sm text-destructive">{errorMessage(detail.error)}</p>}
            <div className="stagger mt-4 space-y-2">
                {days.map((d) => (
                    <button
                        key={d.id}
                        type="button"
                        disabled={busy}
                        onClick={() => onStart({ planId: plan!.id, dayId: d.id })}
                        className="group flex w-full items-center justify-between rounded-sm border bg-background p-4 text-left transition-all duration-200 hover:border-primary hover:bg-primary/5 enabled:active:scale-[0.99] disabled:opacity-60"
                    >
            <span>
              <span className="block text-sm font-bold">{d.name}</span>
              <span className="text-xs text-muted-foreground">{d.exercises.length} exercises</span>
            </span>
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Play className="h-4 w-4" />
            </span>
                    </button>
                ))}
            </div>
        </Modal>
    );
}

export default function WorkoutsPage() {
    const router = useRouter();
    const active = useActiveSession();
    const plans = usePlans();
    const start = useStartSession();
    const remove = useDeletePlan();
    const generate = useGeneratePlan();
    const profile = useProfile();
    const prefsReady = !!(
        profile.data?.experienceLevel && profile.data?.daysPerWeek && profile.data?.equipmentAccess
    );
    const autoPlan = () =>
        generate.mutate(undefined, { onSuccess: (plan) => router.push(`/workouts/plans/${plan.id}`) });

    const [page, setPage] = useState(0);
    const history = useSessionHistory(page);
    const [startPlan, setStartPlan] = useState<PlanSummaryResponse | null>(null);
    const [deleting, setDeleting] = useState<PlanSummaryResponse | null>(null);

    const hasActive = !!active.data;
    const begin = (body: StartSessionRequest) =>
        start.mutate(body, {
            onSuccess: (s) => router.push(`/workouts/session/${s.id}`),
            onError: () => setStartPlan(null), // the error message shows on the page
        });

    const sessions = history.data?.content ?? [];
    const totalPages = history.data?.totalPages ?? 0;

    return (
        <div>
            <PageHeader kicker="Train" title="My plans">
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        disabled={!prefsReady || generate.isPending}
                        onClick={autoPlan}
                        className="group flex items-center gap-2 rounded-full border bg-card px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-primary enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-50"
                    >
                        <Sparkles className={`h-4 w-4 text-primary transition-transform duration-300 group-hover:rotate-12 ${generate.isPending ? "animate-pulse" : ""}`} />
                        {generate.isPending ? "Building…" : "Auto plan"}
                    </button>
                    <Link
                        href="/workouts/plans/new"
                        className="group flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                    >
                        <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" /> Create plan
                    </Link>
                </div>
            </PageHeader>

            {profile.data && !prefsReady && (
                <p className="mt-4 text-sm text-muted-foreground">
                    Want a plan built for you?{" "}
                    <Link href="/profile" className="text-primary underline">Add your training preferences</Link> in your profile first.
                </p>
            )}
            {generate.isError && (
                <p role="alert" className="mt-4 text-sm text-destructive">{errorMessage(generate.error)}</p>
            )}

            <WorkoutTabs active="plans" />

            {hasActive && active.data && (
                <div className="animate-pop mt-6 flex flex-wrap items-center justify-between gap-4 rounded-sm border border-primary/40 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-5">
                    <div className="flex items-center gap-4">
                        <span className="relative flex h-3 w-3 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                        </span>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Workout in progress</p>
                            <p className="font-display text-xl uppercase">{sessionTitle(active.data)}</p>
                        </div>
                    </div>
                    <Link href={`/workouts/session/${active.data.id}`} className={`${pillPrimaryCls} transition-shadow hover:shadow-lg`}>Resume</Link>
                </div>
            )}

            {start.isError && (
                <p role="alert" className="mt-4 text-sm text-destructive">
                    {errorMessage(start.error)}{" "}
                    {isApiError(start.error) && start.error.status === 400 && (
                        <Link href="/profile" className="text-primary underline">Open profile</Link>
                    )}
                </p>
            )}

            {/* ---------- plans ---------- */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-3xl uppercase leading-none">My plans</h2>
                    <span aria-hidden className="animate-grow-x mt-2 block h-1 w-12 rounded-full bg-primary" />
                </div>
                <button
                    type="button"
                    disabled={hasActive || start.isPending}
                    onClick={() => begin({})}
                    className="group flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-xs uppercase tracking-widest transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-primary enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-50"
                >
                    <Play className="h-3.5 w-3.5 text-primary transition-transform duration-300 group-hover:translate-x-0.5" />
                    Start quick workout
                </button>
            </div>

            {plans.isLoading && (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[0, 1].map((i) => <div key={i} className="h-48 animate-pulse rounded-sm border bg-card" />)}
                </div>
            )}
            {plans.isError && (
                <div className={`${cardCls} mt-5`}>
                    <p className="text-sm text-destructive">{errorMessage(plans.error)}</p>
                    <button type="button" onClick={() => void plans.refetch()} className="mt-3 text-sm text-primary underline">Try again</button>
                </div>
            )}
            {plans.data && plans.data.length === 0 && (
                <div className="animate-fadeup relative mt-5 overflow-hidden rounded-sm border bg-gradient-to-br from-primary/10 via-card to-card p-8 text-center">
                    <Dumbbell aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rotate-12 text-primary/10" />
                    <div className="relative">
                        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                            <Dumbbell className="h-6 w-6" />
                        </span>
                        <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
                            No plans yet. Create a plan with your training days, or start a quick workout and add exercises as you go.
                        </p>
                        <Link href="/workouts/plans/new" className={`${pillPrimaryCls} mt-5 inline-flex items-center gap-2`}>
                            <Plus className="h-4 w-4" /> Create plan
                        </Link>
                    </div>
                </div>
            )}
            <div className="stagger mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(plans.data ?? []).map((p) => (
                    <article
                        key={p.id}
                        className="group relative overflow-hidden rounded-sm border bg-gradient-to-br from-primary/[0.07] via-card to-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_20px_44px_-22px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
                    >
                        {/* accent bar: short at rest, grows across the card on hover */}
                        <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left scale-x-[0.18] bg-primary transition-transform duration-500 group-hover:scale-x-100" />
                        <Dumbbell
                            aria-hidden
                            className="pointer-events-none absolute -bottom-7 -right-5 h-36 w-36 -rotate-12 text-primary/[0.09] transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110"
                        />
                        <div className="relative">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                                {p.dayCount} {p.dayCount === 1 ? "day" : "days"}
                            </span>
                            <h3 className="mt-3 font-display text-2xl uppercase leading-tight">{p.name}</h3>
                            {p.description && (
                                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{pretty(p.description)}</p>
                            )}
                            <div className="mt-6 flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={hasActive || start.isPending}
                                    onClick={() => { start.reset(); setStartPlan(p); }}
                                    className="group/btn flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all duration-200 enabled:hover:shadow-lg enabled:active:scale-95 disabled:opacity-50"
                                >
                                    <Play className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" /> Start
                                </button>
                                <Link
                                    href={`/workouts/plans/${p.id}`}
                                    aria-label={`Edit ${p.name}`}
                                    className="grid h-11 w-11 place-items-center rounded-full border bg-card transition-all duration-200 hover:border-primary hover:text-primary active:scale-90"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Link>
                                <button
                                    type="button"
                                    aria-label={`Delete ${p.name}`}
                                    onClick={() => { remove.reset(); setDeleting(p); }}
                                    className="grid h-11 w-11 place-items-center rounded-full border bg-card transition-all duration-200 hover:border-destructive hover:text-destructive active:scale-90"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* ---------- history ---------- */}
            <div className="mt-14">
                <h2 className="font-display text-3xl uppercase leading-none">History</h2>
                <span aria-hidden className="animate-grow-x mt-2 block h-1 w-12 rounded-full bg-primary" />
            </div>
            {history.isLoading && <div className="mt-5 h-28 animate-pulse rounded-sm border bg-card" />}
            {history.isError && (
                <div className={`${cardCls} mt-5`}>
                    <p className="text-sm text-destructive">{errorMessage(history.error)}</p>
                    <button type="button" onClick={() => void history.refetch()} className="mt-3 text-sm text-primary underline">Try again</button>
                </div>
            )}
            {history.data && sessions.length === 0 && (
                <div className={`${cardCls} animate-fadeup mt-5`}>
                    <p className="text-sm text-muted-foreground">Finished workouts will show up here.</p>
                </div>
            )}
            {sessions.length > 0 && (
                <ul className="stagger mt-5 divide-y overflow-hidden rounded-sm border bg-card">
                    {sessions.map((s) => {
                        const d = new Date(s.startedAt);
                        return (
                            <li key={s.id}>
                                <Link
                                    href={`/workouts/session/${s.id}`}
                                    className="group flex items-center gap-4 p-4 transition-colors duration-200 hover:bg-primary/5 sm:p-5"
                                >
                                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-sm bg-primary/10 text-center leading-none transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                                        <span>
                                            <span className="block font-display text-2xl">{d.getDate()}</span>
                                            <span className="mt-0.5 block text-[10px] uppercase tracking-widest opacity-70">
                                                {d.toLocaleDateString("en-US", { month: "short" })}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold">{sessionTitle(s)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {d.toLocaleDateString("en-US", { weekday: "long" })}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-primary" /> {formatDuration(s.durationSeconds)}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <Dumbbell className="h-3.5 w-3.5 text-primary" /> {s.setCount} {s.setCount === 1 ? "set" : "sets"}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5">
                                                <Flame className="h-3.5 w-3.5 text-primary" /> {s.caloriesBurned != null ? `${s.caloriesBurned} kcal` : "—"}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
            {totalPages > 1 && (
                <div className="mt-5 flex items-center justify-center gap-4">
                    <button type="button" aria-label="Newer workouts" disabled={page === 0} onClick={() => setPage(page - 1)} className="grid h-10 w-10 place-items-center rounded-full border bg-card transition-all duration-200 enabled:hover:border-primary enabled:hover:text-primary enabled:active:scale-90 disabled:opacity-30">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">Page {page + 1} of {totalPages}</span>
                    <button type="button" aria-label="Older workouts" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)} className="grid h-10 w-10 place-items-center rounded-full border bg-card transition-all duration-200 enabled:hover:border-primary enabled:hover:text-primary enabled:active:scale-90 disabled:opacity-30">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            <StartPlanModal plan={startPlan} onClose={() => setStartPlan(null)} onStart={begin} busy={start.isPending} />

            <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete plan?">
                <p className="text-sm text-muted-foreground">
                    {deleting ? `“${deleting.name}” will be removed. Your past workouts stay in your history.` : ""}
                </p>
                {remove.isError && <p role="alert" className="mt-2 text-sm text-destructive">{errorMessage(remove.error)}</p>}
                <div className="mt-4 flex gap-3">
                    <button
                        type="button"
                        disabled={remove.isPending}
                        onClick={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
                        className={pillPrimaryCls}
                    >
                        {remove.isPending ? "Deleting…" : "Delete"}
                    </button>
                    <button type="button" onClick={() => setDeleting(null)} className={pillBtnCls}>Keep it</button>
                </div>
            </Modal>
        </div>
    );
}