import { motion } from "motion/react";
import { Check, Plus } from "lucide-react";
import { ExerciseThumb } from "../ExerciseThumb";
import type { SessionSetResponse } from "@/types";
import type { Item } from "./types";

type Props = {
    items: Item[];
    sets: SessionSetResponse[]; // all sets of the session
    currentId: string | null;
    onSelect: (exerciseId: string) => void;
    onAdd: () => void;
};

export function ExerciseList({ items, sets, currentId, onSelect, onAdd }: Props) {
    return (
        <section className="rounded-sm border bg-card p-4">
            <p className="px-2 pb-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Exercises</p>
            {items.map((it) => {
                const done = sets.filter((s) => s.exerciseId === it.exerciseId).length;
                const goal = it.target?.targetSets ?? null;
                const complete = goal !== null && done >= goal;
                return (
                    <button
                        key={it.exerciseId}
                        type="button"
                        onClick={() => onSelect(it.exerciseId)}
                        className={`relative isolate flex w-full items-center gap-3 rounded-sm p-2 text-left transition-colors ${it.exerciseId === currentId ? "" : "hover:bg-muted"}`}
                    >
                        {/* One highlight that glides to whichever exercise is selected. */}
                        {it.exerciseId === currentId && (
                            <motion.span layoutId="exercise-active" className="absolute inset-0 -z-10 rounded-sm bg-primary/15" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                        )}
                        <ExerciseThumb path={it.thumb} alt="" className="h-12 w-14 shrink-0 rounded-sm" />
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-bold">{it.name}</div>
                            <div className="text-xs text-muted-foreground">{goal !== null ? `${done} / ${goal} sets` : `${done} sets`}</div>
                        </div>
                        <span className={`grid h-6 w-6 place-items-center rounded-full border-2 ${complete ? "border-primary bg-primary text-primary-foreground" : done > 0 ? "border-primary" : "border-muted-foreground/40"}`}>
                            {complete && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }} className="grid place-items-center">
                                    <Check className="h-3 w-3" />
                                </motion.span>
                            )}
                        </span>
                    </button>
                );
            })}
            {items.length === 0 && <p className="px-2 py-3 text-sm text-muted-foreground">Nothing here yet.</p>}
            <button type="button" onClick={onAdd} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border py-3 text-xs uppercase tracking-widest transition-transform active:scale-95">
                <Plus className="h-4 w-4" /> Add exercise
            </button>
        </section>
    );
}