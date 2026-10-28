import { Modal } from "@/components/ui/Modal";
import { pillBtnCls, pillPrimaryCls } from "@/components/ui/classes";
import { formatClock } from "@/lib/workout";

type Props = {
    open: boolean;
    onClose: () => void;
    setsCount: number;
    elapsed: number;
    notes: string;
    onNotesChange: (value: string) => void;
    busy: boolean;
    error: string | null;
    onSubmit: () => void;
};

export function FinishModal({ open, onClose, setsCount, elapsed, notes, onNotesChange, busy, error, onSubmit }: Props) {
    return (
        <Modal open={open} onClose={onClose} title="Finish workout">
            <p className="text-sm text-muted-foreground">
                {setsCount} sets logged in {formatClock(elapsed)}. Add a note if you like.
            </p>
            <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="How did it go? (optional)"
                className="mt-3 w-full rounded-sm border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
            <div className="mt-4 flex gap-3">
                <button type="button" onClick={onSubmit} disabled={busy} className={pillPrimaryCls}>
                    {busy ? "Saving…" : "Finish"}
                </button>
                <button type="button" onClick={onClose} className={pillBtnCls}>Keep going</button>
            </div>
        </Modal>
    );
}