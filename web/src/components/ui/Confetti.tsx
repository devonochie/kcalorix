"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const COLORS = ["#fe7802", "#f5b301", "#3b82f6", "#a855f7", "#10b981"];

/** A short burst of confetti from the upper middle of the screen. Removes itself after about 2.5 seconds. */
export function Confetti({ count = 32 }: { count?: number }) {
    const [done, setDone] = useState(false);
    const [reduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const [pieces] = useState(() =>
        Array.from({ length: count }, (_, i) => {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1; // mostly upward
            const speed = 140 + Math.random() * 220;
            return {
                id: i,
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed,
                rotate: Math.random() * 720 - 360,
                size: 6 + Math.random() * 6,
                color: COLORS[i % COLORS.length]!,
                delay: Math.random() * 0.12,
            };
        }),
    );

    useEffect(() => {
        const t = setTimeout(() => setDone(true), 2600);
        return () => clearTimeout(t);
    }, []);

    if (done || reduced) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
            <div className="absolute left-1/2 top-1/3">
                {pieces.map((p) => (
                    <motion.span
                        key={p.id}
                        className="absolute block rounded-[1px]"
                        style={{ width: p.size, height: p.size * 0.5, background: p.color }}
                        initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                        animate={{ x: p.x, y: [0, p.y, p.y + 380], opacity: [1, 1, 0], rotate: p.rotate }}
                        transition={{
                            x: { duration: 1.9, ease: "easeOut", delay: p.delay },
                            y: { duration: 1.9, times: [0, 0.4, 1], ease: ["easeOut", "easeIn"], delay: p.delay },
                            opacity: { duration: 1.9, times: [0, 0.7, 1], delay: p.delay },
                            rotate: { duration: 1.9, delay: p.delay },
                        }}
                    />
                ))}
            </div>
        </div>
    );
}