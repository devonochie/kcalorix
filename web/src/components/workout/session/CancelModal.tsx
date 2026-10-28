import { Modal } from "@/components/ui/Modal";
import { pillBtnCls, pillPrimaryCls } from "@/components/ui/classes";

type Props = {
    open: boolean;
    onClose: () => void;
    busy: boolean;
    error: string | null;
    onConfirm: () => void;
};

export function CancelModal({ open, onClose, busy, error, onConfirm }: Props) {
    return (
        <Modal open={open} onClose={onClose} title="Cancel workout?">
            <p className="text-sm text-muted-foreground">Your logged sets will not be saved to your history.</p>
            {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
            <div className="mt-4 flex gap-3">
                <button type="button" onClick={onConfirm} disabled={busy} className={pillPrimaryCls}>
                    {busy ? "Cancelling…" : "Cancel workout"}
                </button>
                <button type="button" onClick={onClose} className={pillBtnCls}>Keep going</button>
            </div>
        </Modal>
    );
}