"use client";

import { useEffect, useRef, useState } from "react";

/** Animates a number from its previous value to `target`. Returns the number to display right now. */
export function useCountUp(target: number, ms = 900) {
    const [value, setValue] = useState(0);
    const last = useRef(0);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            last.current = target;
            setValue(target);
            return;
        }
        const from = last.current;
        const start = performance.now();
        let raf = requestAnimationFrame(function tick(now) {
            const p = Math.min(1, (now - start) / ms);
            const eased = 1 - Math.pow(1 - p, 3); // ease-out
            last.current = from + (target - from) * eased;
            setValue(last.current);
            if (p < 1) raf = requestAnimationFrame(tick);
        });
        return () => cancelAnimationFrame(raf);
    }, [target, ms]);

    return value;
}