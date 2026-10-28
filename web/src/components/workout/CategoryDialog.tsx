"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, useDragControls } from "motion/react";
import { X, type LucideIcon } from "lucide-react";
import { DUR, EASE } from "@/lib/motion";

const DESKTOP = "(min-width: 640px)";
const subscribe = (cb: () => void) => {
    const mq = window.matchMedia(DESKTOP);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
};
/** true on tablet/desktop (centred dialog), false on phones (bottom sheet you can swipe down). */
const useIsDesktop = () => useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => false);

/**
 * The popup that opens when a workout category tile is tapped.
 * Render it inside <AnimatePresence> so it can play its exit animation:
 *   <AnimatePresence>{open && <CategoryDialog ... />}</AnimatePresence>
 *
 * Phone: bottom sheet. Drag the header down (or tap outside) to close.
 * Desktop: centred dialog. Esc or tap outside closes it.
 */
export function CategoryDialog({
                                   label, blurb, detail, icon: Icon, image, onClose, children,
                               }: {
    label: string;
    blurb: string;
    detail: string | null;
    icon: LucideIcon;
    image?: string;
    onClose: () => void;
    children: ReactNode;
}) {
    const isDesktop = useIsDesktop();
    const controls = useDragControls();
    const titleId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const [imageFailed, setImageFailed] = useState(false);
    const hasPhoto = Boolean(image) && !imageFailed;

    // Esc closes.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // Stop the page behind from scrolling.
    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, []);

    // Move focus into the dialog, and give it back to the tile that opened it when it closes.
    useEffect(() => {
        const opener = document.activeElement as HTMLElement | null;
        panelRef.current?.focus({ preventScroll: true });
        return () => opener?.focus?.({ preventScroll: true });
    }, []);

    // Rendered into <body> so it always sits above the bottom nav. The page wrapper (animate-page) is its own
    // stacking context, so a z-50 dialog inside it would still end up underneath the z-20 nav.
    return createPortal(
        <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.fast }}
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-sm border bg-background shadow-2xl outline-none sm:max-w-xl sm:rounded-sm"
                initial={isDesktop ? { opacity: 0, y: 24, scale: 0.96 } : { y: "100%" }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={isDesktop ? { opacity: 0, y: 12, scale: 0.97 } : { y: "100%" }}
                transition={{ duration: DUR.base + 0.05, ease: EASE }}
                drag={isDesktop ? false : "y"}
                dragControls={controls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.6 }}
                onDragEnd={(_, info) => {
                    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
                }}
            >
                {/* Header: the category photo. On phones, drag this part down to dismiss. */}
                <div
                    className="relative h-40 shrink-0 touch-none overflow-hidden bg-gradient-to-br from-primary/25 via-card to-card sm:h-48"
                    onPointerDown={(e) => {
                        if (!isDesktop) controls.start(e);
                    }}
                >
                    {hasPhoto ? (
                        <motion.img
                            src={image}
                            alt=""
                            aria-hidden
                            onError={() => setImageFailed(true)}
                            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.9, ease: EASE }}
                        />
                    ) : (
                        <Icon aria-hidden className="pointer-events-none absolute -bottom-6 -right-4 h-40 w-40 text-primary opacity-15" />
                    )}
                    <span
                        aria-hidden
                        className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${
                            hasPhoto ? "from-black/90 via-black/35 to-black/10" : "from-transparent to-transparent"
                        }`}
                    />

                    {/* little grab handle, phones only */}
                    <span aria-hidden className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/50 sm:hidden" />

                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-transform hover:bg-black/60 active:scale-90"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="absolute inset-x-0 bottom-0 p-5">
                        <motion.h2
                            id={titleId}
                            className={`font-display text-4xl uppercase leading-none sm:text-5xl ${hasPhoto ? "text-white" : ""}`}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: DUR.base, ease: EASE, delay: 0.1 }}
                        >
                            {label}
                        </motion.h2>
                        <motion.p
                            className={`mt-1.5 text-sm ${hasPhoto ? "text-white/80" : "text-muted-foreground"}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: DUR.base, ease: EASE, delay: 0.16 }}
                        >
                            {blurb}
                        </motion.p>
                        {detail && (
                            <motion.p
                                className={`mt-2 text-[11px] uppercase tracking-widest ${hasPhoto ? "text-white/70" : "text-muted-foreground"}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: DUR.base, delay: 0.24 }}
                            >
                                {detail}
                            </motion.p>
                        )}
                    </div>
                </div>

                {/* Workout list: this part scrolls, the photo header stays put. */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
                    {children}
                </div>
            </motion.div>
        </motion.div>,
        document.body,
    );
}