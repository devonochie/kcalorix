import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { fieldCls, iconBtnCls, labelCls } from "@/components/ui/classes";
import type { ExRow } from "./plan-form";

const smallFieldCls = "w-full rounded-sm border bg-card px-3 py-2.5 text-center text-sm font-bold outline-none focus:border-primary";

type Props = {
    row: ExRow;
    index: number;
    count: number;
    onChange: (patch: Partial<ExRow>) => void;
    onMove: (dir: -1 | 1) => void;
    onRemove: () => void;
};

export function ExerciseRow({ row, index, count, onChange, onMove, onRemove }: Props) {
    return (
        <div className="rounded-sm border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 break-words text-sm font-bold">{row.name}</p>
                <div className="flex shrink-0 gap-1.5">
                    <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => onMove(-1)} className={iconBtnCls}>
                        <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(1)} className={iconBtnCls}>
                        <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label={`Remove ${row.name}`} onClick={onRemove} className={iconBtnCls}>
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                <label>
                    <span className={labelCls}>Sets</span>
                    <input className={smallFieldCls} inputMode="numeric" value={row.sets} onChange={(e) => onChange({ sets: e.target.value })} />
                </label>
                {row.mode === "reps" ? (
                    <>
                        <label>
                            <span className={labelCls}>Min reps</span>
                            <input className={smallFieldCls} inputMode="numeric" value={row.repsMin} onChange={(e) => onChange({ repsMin: e.target.value })} />
                        </label>
                        <label>
                            <span className={labelCls}>Max reps</span>
                            <input className={smallFieldCls} inputMode="numeric" value={row.repsMax} onChange={(e) => onChange({ repsMax: e.target.value })} />
                        </label>
                    </>
                ) : (
                    <label>
                        <span className={labelCls}>Time (mm:ss)</span>
                        <input className={smallFieldCls} value={row.seconds} onChange={(e) => onChange({ seconds: e.target.value })} />
                    </label>
                )}
                <label>
                    <span className={labelCls}>Rest (sec)</span>
                    <input className={smallFieldCls} inputMode="numeric" value={row.rest} onChange={(e) => onChange({ rest: e.target.value })} />
                </label>
            </div>
            <input
                aria-label={`Notes for ${row.name}`}
                className={`${fieldCls} mt-3`}
                maxLength={300}
                placeholder="Notes (optional)"
                value={row.notes}
                onChange={(e) => onChange({ notes: e.target.value })}
            />
        </div>
    );
}