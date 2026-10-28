import type { ComponentProps } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Pencil, Trash2 } from "lucide-react";
import { SetForm } from "../SetForm";
import { describeSet, draftFromSet, enumLabel } from "@/lib/workout";
import type { SessionSetResponse, UnitSystem } from "@/types";
import type { Item } from "./types";

const ease = [0.2, 0.8, 0.2, 1] as const;

type SetBody = Parameters<ComponentProps<typeof SetForm>["onSubmit"]>[0];

type Props = {
    current: Item | null;
    sets: SessionSetResponse[]; // sets of the current exercise only
    units: UnitSystem;
    planLoading: boolean;
    logBusy: boolean;
    logError: string | null;
    deleteBusy: boolean;
    deleteError: string | null;
    onLog: (body: SetBody) => void;
    onEdit: (set: SessionSetResponse) => void;
    onDelete: (setId: SessionSetResponse["id"]) => void;
};

export function SetsPanel({
                              current, sets, units, planLoading, logBusy, logError, deleteBusy, deleteError, onLog, onEdit, onDelete,
                          }: Props) {
    const steps = current?.detail?.steps ?? [];

    return (
        <section className="rounded-sm border bg-card p-6">
            <div className="flex items-baseline justify-between">
                <h2 className="font-display text-xl uppercase">Log your sets</h2>
                {current && <span className="text-xs text-muted-foreground">{enumLabel(current.tracking ?? "…")}</span>}
            </div>

            {!current && (
                <p className="mt-4 text-sm text-muted-foreground">
                    This is a quick workout. Add the first exercise from the list on the right.
                </p>
            )}
            {current && planLoading && <p className="mt-4 text-sm text-muted-foreground">Loading your plan…</p>}

            {current && (
                <>
                    {/* key = a different exercise starts a fresh list instead of animating rows in and out */}
                    <ul key={current.exerciseId} className="mt-4 divide-y">
                        <AnimatePresence initial={false}>
                            {sets.map((s) => (
                                <motion.li
                                    key={s.id}
                                    layout="position"
                                    initial={{ opacity: 0, height: 0, backgroundColor: "rgba(254,120,2,0.2)" }}
                                    animate={{ opacity: 1, height: "auto", backgroundColor: "rgba(254,120,2,0)" }}
                                    exit={{ opacity: 0, height: 0, x: -24 }}
                                    transition={{ duration: 0.3, ease, backgroundColor: { duration: 1.2 } }}
                                    className="flex items-center gap-3 overflow-hidden py-3"
                                >
                                    <span className="w-14 text-sm text-muted-foreground">Set {s.setNumber}</span>
                                    <span className="flex-1 font-bold tabular-nums">{describeSet(s, units)}</span>
                                    <button
                                        type="button"
                                        aria-label={`Edit set ${s.setNumber}`}
                                        onClick={() => onEdit(s)}
                                        className="grid h-9 w-9 place-items-center rounded-full border transition-transform active:scale-90"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Delete set ${s.setNumber}`}
                                        disabled={deleteBusy}
                                        onClick={() => onDelete(s.id)}
                                        className="grid h-9 w-9 place-items-center rounded-full border transition-transform enabled:active:scale-90 disabled:opacity-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                        {sets.length === 0 && <li className="py-3 text-sm text-muted-foreground">No sets logged yet.</li>}
                    </ul>
                    {deleteError && <p role="alert" className="mt-2 text-sm text-destructive">{deleteError}</p>}

                    <div className="mt-5 border-t pt-5">
                        {current.tracking ? (
                            <SetForm
                                key={`${current.exerciseId}:${sets.length}`}
                                tracking={current.tracking}
                                units={units}
                                initial={draftFromSet(sets[sets.length - 1] ?? null, units)}
                                submitLabel="Log set"
                                busy={logBusy}
                                error={logError}
                                onSubmit={onLog}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">Loading exercise…</p>
                        )}
                    </div>
                </>
            )}

            {steps.length > 0 && (
                <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">How to:</span> {steps[0]}
                    {current?.detail && (
                        <>
                            {" "}
                            <Link href={`/exercises/${current.detail.slug}`} className="text-primary underline">Full guide</Link>
                        </>
                    )}
                </p>
            )}
        </section>
    );
}