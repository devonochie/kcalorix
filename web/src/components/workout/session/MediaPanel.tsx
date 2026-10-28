import { AnimatePresence, motion } from "motion/react";
import { Clock, Dumbbell, Flame, Star } from "lucide-react";
import { ExerciseMedia } from "../ExerciseMedia";
import { ExerciseThumb } from "../ExerciseThumb";
import { formatClock, targetText } from "@/lib/workout";
import type { Item } from "./types";

const tile = "grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-primary/15 text-primary";
const chip = "rounded-full bg-background px-3 py-2 text-xs font-bold uppercase tracking-widest";

type Props = {
    current: Item | null;
    index: number;
    total: number;
    setsLogged: number;
    restLeft: number;
    restTarget: number | null;
    showNext: boolean;
    onAdjustRest: (deltaSeconds: number) => void;
    onSkipRest: () => void;
    onNext: () => void;
};

export function MediaPanel({
                               current, index, total, setsLogged, restLeft, restTarget, showNext, onAdjustRest, onSkipRest, onNext,
                           }: Props) {
    const videoPath = current?.detail?.videoPath ?? null;
    // How much of the rest is left (1 = just started, 0 = done). Extra time added with +15s counts as "full" until it burns down.
    const restRatio = restLeft > 0 ? Math.min(1, restLeft / Math.max(restTarget ?? restLeft, restLeft)) : 0;
    const urgent = restLeft > 0 && restLeft <= 5;
    const thumbPath = current?.detail?.thumbnailPath ?? current?.thumb ?? null;

    const info = [
        { icon: Dumbbell, v: current?.name ?? "—", l: "Exercise" },
        { icon: Star, v: current?.difficulty ?? "—", l: "Difficulty" },
        { icon: Clock, v: targetText(current?.target ?? null), l: "Sets × reps" },
        { icon: Flame, v: `${setsLogged} logged`, l: "This exercise" },
    ];

    return (
        <section className="overflow-hidden rounded-sm border bg-card">
            <div className="relative flex aspect-video max-h-[420px] w-full flex-col justify-between overflow-hidden p-6">
                {videoPath ? (
                    <ExerciseMedia
                        videoPath={videoPath}
                        thumbnailPath={thumbPath}
                        title={current?.name ?? "Exercise"}
                        className="absolute inset-0 h-full w-full"
                    />
                ) : (
                    <>
                        <ExerciseThumb path={thumbPath} alt="" className="absolute inset-0 h-full w-full" />
                        <div className="absolute inset-0 bg-background/55" />
                    </>
                )}
                {/* Rest countdown bar along the bottom edge. Linear 1s steps make it look continuous. */}
                <AnimatePresence>
                    {restLeft > 0 && (
                        <motion.div key="rest-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-background/60">
                            <motion.div
                                className="h-full origin-left bg-primary"
                                initial={false}
                                animate={{ width: `${restRatio * 100}%` }}
                                transition={{ duration: 1, ease: "linear" }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="pointer-events-none relative flex items-start justify-between">
                    <div>
                        <h2 className="font-display text-3xl uppercase">
                            {current ? `Exercise ${index + 1}/${total}` : "No exercises yet"}
                        </h2>
                        <p className="text-sm text-muted-foreground">{current?.group ?? "Add an exercise to begin"}</p>
                    </div>
                </div>
                <div className={`pointer-events-none relative flex items-end justify-between ${videoPath ? "pb-12" : ""}`}>
                    <div className="pointer-events-auto flex flex-wrap items-center gap-2">
                        <motion.span
                            animate={urgent ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                            transition={urgent ? { duration: 1, repeat: Infinity } : { duration: 0.2 }}
                            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest tabular-nums transition-colors ${urgent ? "bg-primary text-primary-foreground" : "bg-background"}`}
                        >
                            {restLeft > 0 ? `Rest ${formatClock(restLeft)}` : "Ready"}
                        </motion.span>
                        <AnimatePresence>
                            {restLeft > 0 && (
                                <motion.div
                                    key="rest-controls"
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-wrap items-center gap-2"
                                >
                                    <button type="button" onClick={() => onAdjustRest(-15)} className={chip}>−15s</button>
                                    <button type="button" onClick={() => onAdjustRest(15)} className={chip}>+15s</button>
                                    <button type="button" onClick={onSkipRest} className={chip}>Skip</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {showNext && (
                            <button
                                type="button"
                                onClick={onNext}
                                className="animate-pop rounded-full bg-primary px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-transform active:scale-95"
                            >
                                Next exercise →
                            </button>
                        )}
                    </div>
                    {restTarget !== null && (
                        <span className="rounded-full bg-background px-4 py-2 text-xs font-bold uppercase tracking-widest">
              Rest target {formatClock(restTarget)}
            </span>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-4">
                {info.map(({ icon: Icon, v, l }) => (
                    <div key={l} className="flex items-center gap-3">
                        <span className={tile}><Icon className="h-4 w-4" /></span>
                        <div className="min-w-0">
                            <div className="truncate text-sm font-bold">{v}</div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}