"use client";

import { useEffect } from "react";

/** Turns on the service worker. Only in production, so it does not get in the way while you develop. */
export function RegisterSW() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
        navigator.serviceWorker.register("/sw.js").catch(() => {});
    }, []);
    return null;
}