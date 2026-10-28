import { Trophy } from "lucide-react";
import { formatClock } from "@/lib/workout";

type Props = {
    exerciseName: string | null;
    recordText: string | undefined;
    elapsed: number;
    canFinish: boolean;
    onFinish: () => void;
    onCancel: () => void;
};

export function FinishCard({ exerciseName, recordText, elapsed, canFinish, onFinish, onCancel }: Props) {
    return (
        <section className="rounded-sm border border-primary/40 bg-primary/10 p-6">
            <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-background text-primary"><Trophy className="h-4 w-4" /></span>
                <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Personal record</p>
                    <p className="font-bold">{exerciseName ? `${exerciseName} · ${recordText ?? "none yet"}` : "—"}</p>
                </div>
            </div>
            <div className="mt-4 flex justify-between text-sm">
                <span className="text-muted-foreground">This session</span>
                <span className="font-bold tabular-nums">{formatClock(elapsed)}</span>
            </div>
            <button
                type="button"
                disabled={!canFinish}
                onClick={onFinish}
                className="mt-4 w-full rounded-full bg-primary py-3.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:-translate-y-0.5 enabled:active:scale-95 disabled:opacity-50"
            >
                Finish workout
            </button>
            {!canFinish && <p className="mt-2 text-xs text-muted-foreground">Log at least one set to finish.</p>}
            <button type="button" onClick={onCancel} className="mt-3 w-full text-center text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                Cancel workout
            </button>
        </section>
    );
}