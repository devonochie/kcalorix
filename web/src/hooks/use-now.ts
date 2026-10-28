"use client";

import { useEffect, useState } from "react";

/** Current timestamp (ms) that re-renders the caller every `ms` milliseconds. */
export function useNow(ms = 1000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), ms);
        return () => clearInterval(t);
    }, [ms]);
    return now;
}