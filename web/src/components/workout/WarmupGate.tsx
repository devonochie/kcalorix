"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { GuidedShell } from "./guided/GuidedScreens";
import { ExerciseMedia } from "./ExerciseMedia";
import { ExerciseThumb } from "./ExerciseThumb";
import { Confetti } from "@/components/ui/Confetti";
import { errorCls, pillPrimaryCls } from "@/components/ui/classes";
import { useCompleteWarmup, useExerciseDetails, useExerciseList } from "@/hooks/use-workout";
import { useNow } from "@/hooks/use-now";
import { errorMessage } from "@/lib/errors";
import { formatClock } from "@/lib/workout";
import { ExerciseCategory } from "@/types";
import type { ExerciseDetailResponse, ExerciseSummaryResponse, SessionResponse } from "@/types";

/** How long each warm-up move runs. */
const WARMUP_SECONDS = 30;
/** "Get ready" countdown before the first move, and the short "Next up" countdown between moves. */
const FIRST_READY_SECONDS = 5;
const READY_SECONDS = 3;

const CHEERS = [
    "Nice and easy, loosen up.",
    "Looking good, keep it moving!",
    "Feel those muscles waking up.",
    "Smooth and steady, you've got this.",
    "Breathe and stay relaxed.",
    "Strong start, keep going!",
];

type Phase = "intro" | "ready" | "work" | "done";

const buzz = (pattern: number | number[] = 200) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
};

const cheerFor = (index: number, left: number) => {
    if (left <= 5) return "Almost there, finish strong!";
    if (left <= WARMUP_SECONDS / 2) return "Halfway done, keep it going!";
    return CHEERS[index % CHEERS.length]!;
};

/** Round buttons in the bottom bar: bigger than iconBtnCls so they are easy to hit with a thumb. */
const navBtnCls =
    "grid h-12 w-12 shrink-0 place-items-center rounded-full border bg-card transition-transform enabled:active:scale-90 disabled:opacity-30";

/** Shown before every session. Sets can't be logged until the warm-up is completed. */
export function WarmupGate({ session }: { session: SessionResponse }) {
    const list = useExerciseList({ category: ExerciseCategory.WARMUP });
    const complete = useCompleteWarmup(session.id);

    const items = list.data?.pages.flatMap((p) => p.content) ?? [];
    const details = useExerciseDetails(items.map((e) => e.slug));

    if (list.isLoading) {
        return <div className="h-64 animate-pulse rounded-sm border bg-card" />;
    }

    // No warm-up exercises (or they failed to load): never trap the person, let them go on.
    if (list.isError || items.length === 0) {
        return (
            <div className="mx-auto max-w-2xl text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-primary">Before you lift</p>
                <h1 className="font-display text-4xl uppercase md:text-5xl">Let&apos;s get going</h1>
                <p className="mt-3 text-sm text-muted-foreground">Take a minute to loosen up, then kick off your workout.</p>
                {list.isError && <p className={errorCls}>{errorMessage(list.error)}</p>}
                {complete.isError && <p className={errorCls}>{errorMessage(complete.error)}</p>}
                <button
                    type="button"
                    disabled={complete.isPending}
                    onClick={() => complete.mutate()}
                    className={`${pillPrimaryCls} mt-6`}
                >
                    {complete.isPending ? "Starting…" : "Start workout"}
                </button>
            </div>
        );
    }

    return (
        <WarmupRunner
            items={items}
            details={details}
            onFinish={() => complete.mutate()}
            finishing={complete.isPending}
            error={complete.isError ? errorMessage(complete.error) : null}
        />
    );
}

function WarmupRunner({
                          items, details, onFinish, finishing, error,
                      }: {
    items: ExerciseSummaryResponse[];
    details: Map<string, ExerciseDetailResponse>;
    onFinish: () => void;
    finishing: boolean;
    error: string | null;
}) {
    const router = useRouter();
    const now = useNow(250);

    const [phase, setPhase] = useState<Phase>("intro");
    const [index, setIndex] = useState(0);
    const [endsAt, setEndsAt] = useState(0);
    const [pausedMs, setPausedMs] = useState<number | null>(null);

    const ex = items[Math.min(index, items.length - 1)]!;
    const detail = details.get(ex.slug) ?? null;
    const isLast = index === items.length - 1;
    const paused = pausedMs !== null;

    const running = phase === "ready" || phase === "work";
    const phaseSeconds = phase === "ready" ? (index === 0 ? FIRST_READY_SECONDS : READY_SECONDS) : WARMUP_SECONDS;
    const leftMs = pausedMs ?? Math.max(0, endsAt - now);
    const left = Math.min(phaseSeconds, Math.ceil(leftMs / 1000));
    const fraction = Math.min(1, leftMs / (phaseSeconds * 1000));
    const expired = running && !paused && left === 0;

    /** Starts the "get ready" countdown for move i. */
    function startMove(i: number) {
        setIndex(i);
        setPhase("ready");
        setPausedMs(null);
        setEndsAt(Date.now() + (i === 0 ? FIRST_READY_SECONDS : READY_SECONDS) * 1000);
    }

    function beginWork() {
        setPhase("work");
        setPausedMs(null);
        setEndsAt(Date.now() + WARMUP_SECONDS * 1000);
        buzz(60);
    }

    function finishAll() {
        setPhase("done");
        setPausedMs(null);
        buzz([100, 60, 200]);
    }

    function next() {
        if (isLast) finishAll();
        else startMove(index + 1);
    }

    function togglePause() {
        if (pausedMs === null) setPausedMs(Math.max(0, endsAt - Date.now()));
        else {
            setEndsAt(Date.now() + pausedMs);
            setPausedMs(null);
        }
    }

    // a countdown reached zero: ready -> work, work -> next move (or done)
    useEffect(() => {
        if (!expired) return;
        if (phase === "ready") beginWork();
        else if (phase === "work") {
            buzz();
            next();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expired]);

    // pause by itself when the person switches to another app or tab
    useEffect(() => {
        const onHide = () => {
            if (document.hidden && running && pausedMs === null) setPausedMs(Math.max(0, endsAt - Date.now()));
        };
        document.addEventListener("visibilitychange", onHide);
        return () => document.removeEventListener("visibilitychange", onHide);
    }, [running, pausedMs, endsAt]);

    // keep the screen on while moving (not supported everywhere, so it fails silently)
    useEffect(() => {
        if (!running) return;
        let lock: WakeLockSentinel | null = null;
        let cancelled = false;
        navigator.wakeLock
            ?.request("screen")
            .then((l) => {
                if (cancelled) void l.release();
                else lock = l;
            })
            .catch(() => {});
        return () => {
            cancelled = true;
            void lock?.release();
        };
    }, [running]);

    const frameCls =
        "relative mt-3 min-h-[30dvh] w-full flex-1 overflow-hidden rounded-sm border bg-card sm:mx-auto sm:mt-4 sm:aspect-video sm:min-h-0 sm:w-[min(100%,calc(40dvh*16/9))] sm:flex-none";
    const bodyCls = "mt-4 w-full sm:mx-auto sm:w-[min(100%,calc(40dvh*16/9))]";
    const barCls =
        "sticky bottom-0 z-10 -mx-4 mt-auto border-t bg-background/90 px-4 pb-1 pt-3 backdrop-blur sm:-mx-5 sm:px-5";

    return (
        <GuidedShell
            total={items.length}
            index={phase === "done" ? items.length : phase === "intro" ? 0 : index}
            onExit={() => router.push("/workouts")}
        >
            {/* ---------- 1. Welcome ---------- */}
            {phase === "intro" && (
                <div className="animate-fadein flex flex-1 flex-col pt-6">
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-primary">Before you lift</p>
                        <h1 className="mt-3 font-display text-4xl uppercase leading-[1.05] sm:text-5xl md:text-6xl">
                            Come on, let&apos;s warm up!
                        </h1>
                        <p className="mt-4 max-w-md text-sm text-muted-foreground">
                            Time for our routine warm-up before we kick off. A few minutes now keeps you loose, strong and ready to go.
                        </p>
                        <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                            {items.length} {items.length === 1 ? "move" : "moves"} · about {Math.max(1, Math.ceil((items.length * (WARMUP_SECONDS + READY_SECONDS)) / 60))} min
                        </p>
                        <ul className="mt-5 grid max-h-[32dvh] w-full max-w-md gap-2 overflow-y-auto text-left">
                            {items.map((e, i) => (
                                <li key={e.id} className="flex items-center gap-3 rounded-sm border bg-card p-2">
                                    <ExerciseThumb path={e.thumbnailPath} alt="" className="h-10 w-10 shrink-0 rounded-sm" />
                                    <span className="min-w-0 flex-1 truncate font-display text-base uppercase">{e.name}</span>
                                    <span className="shrink-0 pr-1 text-xs text-muted-foreground">{i + 1}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className={barCls}>
                        <button type="button" onClick={() => startMove(0)} className={`${pillPrimaryCls} mx-auto block w-full max-w-md py-4`}>
                            Let&apos;s go
                        </button>
                    </div>
                </div>
            )}

            {/* ---------- 2. Get ready / next up ---------- */}
            {phase === "ready" && (
                <div className="animate-fadein flex flex-1 flex-col pt-6">
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                            {index === 0 ? "Get ready" : "Next up"} · {index + 1}/{items.length}
                        </p>
                        <p key={left} className="animate-pop mt-4 font-display text-[7rem] leading-none tabular-nums text-primary sm:text-[9rem]">
                            {left}
                        </p>
                        <div className="mt-6 flex w-full max-w-sm items-center gap-3 rounded-sm border bg-card p-3 text-left">
                            <ExerciseThumb path={detail?.thumbnailPath ?? ex.thumbnailPath} alt="" className="h-14 w-14 shrink-0 rounded-sm" />
                            <p className="min-w-0 flex-1 truncate font-display text-xl uppercase">{ex.name}</p>
                        </div>
                        {paused && <p className="mt-4 text-sm text-muted-foreground">Paused. Take a breather.</p>}
                    </div>
                    <div className={barCls}>
                        <div className="mx-auto flex w-full max-w-md items-center gap-3">
                            <button type="button" aria-label={paused ? "Resume" : "Pause"} onClick={togglePause} className={navBtnCls}>
                                {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                            </button>
                            <button type="button" onClick={beginWork} className={`${pillPrimaryCls} flex-1 py-4`}>
                                Start now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- 3. The move ---------- */}
            {phase === "work" && (
                <div key={ex.id} className="animate-fadein flex flex-1 flex-col">
                    <div className={frameCls}>
                        {detail?.videoPath ? (
                            <ExerciseMedia
                                videoPath={detail.videoPath}
                                thumbnailPath={detail.thumbnailPath ?? ex.thumbnailPath}
                                title={ex.name}
                                className="absolute inset-0 h-full w-full"
                            />
                        ) : (
                            <ExerciseThumb path={detail?.thumbnailPath ?? ex.thumbnailPath} alt={ex.name} className="absolute inset-0 h-full w-full" />
                        )}
                    </div>

                    <div className={bodyCls}>
                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                    Warm-up · {index + 1}/{items.length}
                                </p>
                                <h1 className="font-display text-3xl uppercase sm:text-4xl">{ex.name}</h1>
                                <p className="mt-1 text-sm text-primary" aria-live="polite">
                                    {paused ? "Paused. Take a breather." : cheerFor(index, left)}
                                </p>
                            </div>
                            <TimerRing left={left} fraction={fraction} paused={paused} />
                        </div>

                        {detail && detail.steps.length > 0 && (
                            <details className="group mt-4 rounded-sm border bg-card px-4 py-3">
                                <summary className="flex cursor-pointer list-none items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                                    How to do it
                                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                                </summary>
                                <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                                    {detail.steps.map((t, i) => (
                                        <li key={i} className="flex gap-3">
                                            <span className="font-display text-primary">{i + 1}</span>
                                            <span className="min-w-0">{t}</span>
                                        </li>
                                    ))}
                                </ol>
                            </details>
                        )}
                    </div>

                    <div className={`${barCls} mt-4`}>
                        <div className="mx-auto flex w-full max-w-md items-center gap-3">
                            <button type="button" aria-label="Previous move" onClick={() => startMove(Math.max(0, index - 1))} className={navBtnCls}>
                                <SkipBack className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={togglePause}
                                className={`${pillPrimaryCls} inline-flex flex-1 items-center justify-center gap-2 py-4`}
                            >
                                {paused ? <><Play className="h-4 w-4" /> Resume</> : <><Pause className="h-4 w-4" /> Pause</>}
                            </button>
                            <button type="button" aria-label={isLast ? "Finish warm-up" : "Next move"} onClick={next} className={navBtnCls}>
                                {isLast ? <Check className="h-5 w-5" /> : <SkipForward className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- 4. Done ---------- */}
            {phase === "done" && (
                <div className="animate-fadein flex flex-1 flex-col items-center justify-center py-6 text-center">
                    <Confetti />
                    <p className="text-xs uppercase tracking-[0.3em] text-primary">Warm-up complete</p>
                    <p className="mt-3 font-display text-4xl uppercase sm:text-5xl md:text-6xl">You&apos;re warmed up!</p>
                    <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                        Muscles loose, heart rate up. Let&apos;s kick off and make this one count.
                    </p>
                    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
                    <button type="button" disabled={finishing} onClick={onFinish} className={`${pillPrimaryCls} mt-8 px-10 py-4`}>
                        {finishing ? "Starting…" : "Start workout"}
                    </button>
                </div>
            )}
        </GuidedShell>
    );
}

/** Circular countdown: the ring empties as the move runs out. */
function TimerRing({ left, fraction, paused }: { left: number; fraction: number; paused: boolean }) {
    const r = 44;
    const c = 2 * Math.PI * r;
    return (
        <div role="timer" aria-label={`${left} seconds left`} className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
                <circle cx="50" cy="50" r={r} fill="none" strokeWidth="7" className="stroke-border" />
                <circle
                    cx="50" cy="50" r={r} fill="none" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c * (1 - fraction)}
                    className={`stroke-primary transition-[stroke-dashoffset] duration-300 ease-linear ${paused ? "opacity-40" : ""}`}
                />
            </svg>
            <span className={`absolute inset-0 grid place-items-center font-display text-2xl tabular-nums sm:text-3xl ${left <= 5 ? "text-primary" : ""}`}>
                {formatClock(left)}
            </span>
        </div>
    );
}