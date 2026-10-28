"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, Pause, Play, Plus, SkipForward, X } from "lucide-react";
import { ExerciseMedia } from "../ExerciseMedia";
import { ExerciseThumb } from "../ExerciseThumb";
import { formatClock } from "@/lib/workout";
import { iconBtnCls, pillBtnCls, pillPrimaryCls } from "@/components/ui/classes";
import { stepTarget, type Step } from "./build-steps";

/** Full-screen frame: exit button and one progress bar segment per step. */
export function GuidedShell({
                                total, index, onExit, children,
                            }: {
    total: number;
    index: number;
    onExit: () => void;
    children: ReactNode;
}) {
    // Rendered on document.body: an animated/transformed parent would otherwise become the
    // containing block of "fixed" and squash this screen. The wrapper classes re-apply the
    // light theme, because outside the app shell the page would fall back to the dark one.
    return createPortal(
        <div className="app-light animate-fadein fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-background text-foreground">
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-5">
                <div className="flex items-center gap-3">
                    <button type="button" aria-label="Exit guided mode" onClick={onExit} className={`${iconBtnCls} shrink-0`}>
                        <X className="h-4 w-4" />
                    </button>
                    <div aria-hidden className="flex min-w-0 flex-1 gap-1">
                        {Array.from({ length: total }, (_, i) => (
                            <span
                                key={i}
                                className={`h-1 min-w-0 flex-1 rounded-full transition-colors duration-300 ${i < index ? "bg-primary" : i === index ? "bg-primary/50" : "bg-border"}`}
                            />
                        ))}
                    </div>
                </div>
                {children}
            </div>
        </div>,
        document.body,
    );
}

function Media({ step }: { step: Step }) {
    return (
        // Phone: stretches to fill all free height (taller picture).
        // sm and up: fixed 16:9, capped by window height (46dvh) so the page doesn't scroll.
        // Children are absolutely positioned: a percentage height would collapse inside a stretched box.
        <div className="relative mt-3 min-h-[38dvh] w-full flex-1 overflow-hidden rounded-sm border bg-card sm:mx-auto sm:mt-4 sm:aspect-video sm:min-h-0 sm:w-[min(100%,calc(46dvh*16/9))] sm:flex-none">
            {step.videoPath ? (
                <ExerciseMedia
                    videoPath={step.videoPath}
                    thumbnailPath={step.thumb}
                    title={step.name}
                    className="absolute inset-0 h-full w-full"
                />
            ) : (
                <ExerciseThumb path={step.thumb} alt={step.name} className="absolute inset-0 h-full w-full" />
            )}
        </div>
    );
}

export function ReadyView({
                              step, index, total, left, paused, onStart, onTogglePause,
                          }: {
    step: Step; index: number; total: number; left: number; paused: boolean;
    onStart: () => void; onTogglePause: () => void;
}) {
    return (
        <div className="animate-fadein flex flex-1 flex-col items-center justify-center py-6 text-center">
            <p className="font-display text-4xl uppercase sm:text-5xl md:text-6xl">Ready to go!</p>
            <p className="mt-4 font-display text-[6.5rem] leading-none tabular-nums text-primary sm:text-[9rem]">{left}</p>
            <p className="mt-4 text-sm text-muted-foreground">{index + 1}/{total}</p>
            <p className="font-display text-2xl uppercase sm:text-3xl">{step.name}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{stepTarget(step)}</p>

            {step.howTo.length > 0 && (
                <ol className="mt-5 w-full max-w-md space-y-2 text-left text-sm text-muted-foreground">
                    {step.howTo.map((t, i) => (
                        <li key={i} className="flex gap-3">
                            <span className="font-display text-primary">{i + 1}</span>
                            <span className="min-w-0">{t}</span>
                        </li>
                    ))}
                </ol>
            )}

            <div className="mt-8 flex gap-3">
                <button type="button" onClick={onTogglePause} aria-label={paused ? "Resume" : "Pause"} className={iconBtnCls}>
                    {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
                <button type="button" onClick={onStart} className={pillPrimaryCls}>Start</button>
            </div>
        </div>
    );
}

export function WorkView({
                             step, index, total, left, paused, onDone, onSkip, onTogglePause,
                         }: {
    step: Step; index: number; total: number; left: number; paused: boolean;
    onDone: () => void; onSkip: () => void; onTogglePause: () => void;
}) {
    const timed = step.durationSeconds != null;
    return (
        <div className="animate-fadein flex flex-1 flex-col">
            <Media step={step} />
            <div className="mt-4 w-full sm:mx-auto sm:mt-5 sm:w-[min(100%,calc(46dvh*16/9))]">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {index + 1}/{total} · Set {step.setNumber} of {step.setCount}
                </p>
                <h1 className="font-display text-3xl uppercase sm:text-4xl">{step.name}</h1>
                <p className="mt-2 font-display text-6xl tabular-nums sm:text-7xl">
                    {timed ? formatClock(left) : `× ${step.reps ?? 0}`}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-5 sm:pt-6">
                    {timed ? (
                        <button type="button" onClick={onTogglePause} className={`${pillPrimaryCls} inline-flex items-center gap-2`}>
                            {paused ? <><Play className="h-4 w-4" /> Resume</> : <><Pause className="h-4 w-4" /> Pause</>}
                        </button>
                    ) : (
                        <button type="button" onClick={onDone} className={`${pillPrimaryCls} inline-flex items-center gap-2`}>
                            <Check className="h-4 w-4" /> Done
                        </button>
                    )}
                    <button type="button" onClick={onSkip} className={`${pillBtnCls} inline-flex items-center gap-2`}>
                        <SkipForward className="h-4 w-4" /> Skip
                    </button>
                </div>
            </div>
        </div>
    );
}

export function RestView({
                             next, nextIndex, total, left, paused, onAdd, onSkip, onTogglePause,
                         }: {
    next: Step; nextIndex: number; total: number; left: number; paused: boolean;
    onAdd: () => void; onSkip: () => void; onTogglePause: () => void;
}) {
    return (
        <div className="animate-fadein flex flex-1 flex-col">
            <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-sm bg-primary px-4 py-10 text-center text-primary-foreground sm:mt-6 sm:px-6">
                <p className="font-display text-3xl uppercase sm:text-4xl">Rest</p>
                <p className="mt-4 font-display text-7xl tabular-nums sm:text-8xl">{formatClock(left)}</p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 rounded-full border border-primary-foreground/40 px-5 py-3 text-sm font-bold uppercase tracking-widest transition-transform active:scale-95">
                        <Plus className="h-4 w-4" /> 20s
                    </button>
                    <button type="button" onClick={onTogglePause} aria-label={paused ? "Resume" : "Pause"} className="grid h-11 w-11 place-items-center rounded-full border border-primary-foreground/40 transition-transform active:scale-90">
                        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </button>
                    <button type="button" onClick={onSkip} className="inline-flex items-center gap-1 rounded-full bg-primary-foreground px-5 py-3 text-sm font-bold uppercase tracking-widest text-primary transition-transform active:scale-95">
                        Skip <SkipForward className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-sm border bg-card p-3 sm:gap-4 sm:p-4">
                <ExerciseThumb path={next.thumb} alt="" className="h-14 w-14 shrink-0 rounded-sm sm:h-16 sm:w-16" />
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Next · {nextIndex + 1}/{total}</p>
                    <p className="truncate font-display text-lg uppercase sm:text-xl">{next.name}</p>
                </div>
                <p className="shrink-0 text-sm text-muted-foreground">{stepTarget(next)}</p>
            </div>
        </div>
    );
}

export function DoneView({
                             setsLogged, failedCount, busy, error, onFinish, onRetry, onExit,
                         }: {
    setsLogged: number; failedCount: number; busy: boolean; error: string | null;
    onFinish: () => void; onRetry: () => void; onExit: () => void;
}) {
    return (
        <div className="animate-fadein flex flex-1 flex-col items-center justify-center py-6 text-center">
            <p className="font-display text-4xl uppercase sm:text-5xl md:text-6xl">Workout complete</p>
            <p className="mt-4 text-sm text-muted-foreground">
                {setsLogged > 0 ? `${setsLogged} sets logged` : failedCount > 0 ? "" : "Nothing was logged, so there is nothing to save."}
            </p>
            {failedCount > 0 && (
                <p role="alert" className="mt-3 max-w-sm text-sm text-destructive">
                    {failedCount} {failedCount === 1 ? "set" : "sets"} could not be saved. Check your connection and try again.
                </p>
            )}
            {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
            <div className="mt-8 flex gap-3">
                {failedCount > 0 ? (
                    <button type="button" disabled={busy} onClick={onRetry} className={pillPrimaryCls}>
                        {busy ? "Saving…" : "Retry saving"}
                    </button>
                ) : setsLogged > 0 ? (
                    <button type="button" disabled={busy} onClick={onFinish} className={pillPrimaryCls}>
                        {busy ? "Saving…" : "Finish"}
                    </button>
                ) : (
                    <button type="button" onClick={onExit} className={pillBtnCls}>Back</button>
                )}
            </div>
        </div>
    );
}