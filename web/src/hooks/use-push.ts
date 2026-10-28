"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationsApi } from "@/lib/api";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
    const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(padded);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
}

export type PushStatus = "loading" | "unsupported" | "blocked" | "off" | "on";

/**
 * Turns phone/browser alerts on or off for THIS device.
 * Needs the service worker, which only runs in a production build.
 */
export function usePush() {
    const [status, setStatus] = useState<PushStatus>("loading");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
        if (!supported) return setStatus("unsupported");
        if (Notification.permission === "denied") return setStatus("blocked");
        try {
            const reg = await navigator.serviceWorker.getRegistration();
            const sub = await reg?.pushManager.getSubscription();
            setStatus(sub && Notification.permission === "granted" ? "on" : "off");
        } catch {
            setStatus("off");
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const enable = useCallback(async () => {
        setBusy(true);
        setError(null);
        try {
            const key = await notificationsApi.pushPublicKey();
            if (!key) throw new Error("Phone alerts are not set up on the server yet.");

            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                setStatus(permission === "denied" ? "blocked" : "off");
                return;
            }

            const reg = await navigator.serviceWorker.ready;
            const sub =
                (await reg.pushManager.getSubscription()) ??
                (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) }));

            const json = sub.toJSON();
            if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) throw new Error("This browser gave an incomplete subscription.");
            await notificationsApi.pushSubscribe({ endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth });
            setStatus("on");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not turn on phone alerts.");
        } finally {
            setBusy(false);
        }
    }, []);

    const disable = useCallback(async () => {
        setBusy(true);
        setError(null);
        try {
            const reg = await navigator.serviceWorker.getRegistration();
            const sub = await reg?.pushManager.getSubscription();
            if (sub) {
                await notificationsApi.pushUnsubscribe(sub.endpoint).catch(() => undefined);
                await sub.unsubscribe();
            }
            setStatus("off");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not turn off phone alerts.");
        } finally {
            setBusy(false);
        }
    }, []);

    return { status, busy, error, enable, disable };
}