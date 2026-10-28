import { AnimatePresence, motion } from "motion/react";
import { Plus, Trash2 } from "lucide-react";
import { cardCls, fieldCls, iconBtnCls, labelCls, pillBtnCls } from "@/components/ui/classes";
import { ExerciseRow } from "./ExerciseRow";
import type { DayRow, ExRow } from "./plan-form";

type Props = {
    day: DayRow;
    index: number;
    canRemove: boolean;
    onRename: (name: string) => void;
    onRemove: () => void;
    onAddExercise: () => void;
    onChangeExercise: (exKey: string, patch: Partial<ExRow>) => void;
    onMoveExercise: (index: number, dir: -1 | 1) => void;
    onRemoveExercise: (exKey: string) => void;
};

export function DayCard({
                            day, index, canRemove, onRename, onRemove, onAddExercise, onChangeExercise, onMoveExercise, onRemoveExercise,
                        }: Props) {
    return (
        <section className={cardCls}>
            <div className="flex items-end gap-3">
                <label className="min-w-0 flex-1">
                    <span className={labelCls}>Day {index + 1} name</span>
                    <input className={fieldCls} maxLength={60} value={day.name} onChange={(e) => onRename(e.target.value)} />
                </label>
                <button
                    type="button"
                    aria-label={`Remove day ${index + 1}`}
                    disabled={!canRemove}
                    onClick={onRemove}
                    className={iconBtnCls}
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <div className="relative mt-5 space-y-4">
                {/* layout: moving a row up or down makes both rows glide to their new spot. */}
                <AnimatePresence initial={false} mode="popLayout">
                    {day.exercises.map((ex, ei) => (
                        <motion.div
                            key={ex.key}
                            layout="position"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                        >
                            <ExerciseRow
                                row={ex}
                                index={ei}
                                count={day.exercises.length}
                                onChange={(patch) => onChangeExercise(ex.key, patch)}
                                onMove={(dir) => onMoveExercise(ei, dir)}
                                onRemove={() => onRemoveExercise(ex.key)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
                {day.exercises.length === 0 && <p className="text-sm text-muted-foreground">No exercises in this day yet.</p>}
            </div>

            <button type="button" onClick={onAddExercise} className={`${pillBtnCls} mt-5 flex items-center gap-2`}>
                <Plus className="h-4 w-4" /> Add exercise
            </button>
        </section>
    );
}