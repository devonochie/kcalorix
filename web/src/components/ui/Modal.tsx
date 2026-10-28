"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

const DESKTOP = "(min-width: 640px)";
const subscribe = (cb: () => void) => {
    const mq = window.matchMedia(DESKTOP);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
};
/** true on tablet/desktop (centred dialog), false on phones (bottom sheet). */
const useIsDesktop = () => useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => false);

const ease = [0.2, 0.8, 0.2, 1] as const;

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
    const isDesktop = useIsDesktop();

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // Stop the page behind the modal from scrolling.
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="modal"
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onMouseDown={(e) => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-sm border bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-sm"
                        initial={isDesktop ? { opacity: 0, y: 12, scale: 0.97 } : { y: "100%" }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={isDesktop ? { opacity: 0, y: 8, scale: 0.98 } : { y: "100%" }}
                        transition={{ duration: 0.3, ease }}
                    >
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <h2 className="font-display text-2xl uppercase">{title}</h2>
                            <button type="button" aria-label="Close" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-transform active:scale-90">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}