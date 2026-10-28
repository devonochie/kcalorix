"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type InstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Shows an "Install app" button when the browser allows installing. Shows nothing otherwise (for example on iPhone, where people use Share > Add to Home Screen). */
export function InstallButton() {
    const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);

    useEffect(() => {
        const onPrompt = (e: Event) => {
            e.preventDefault();
            setPrompt(e as InstallPromptEvent);
        };
        const onInstalled = () => setPrompt(null);
        window.addEventListener("beforeinstallprompt", onPrompt);
        window.addEventListener("appinstalled", onInstalled);
        return () => {
            window.removeEventListener("beforeinstallprompt", onPrompt);
            window.removeEventListener("appinstalled", onInstalled);
        };
    }, []);

    if (!prompt) return null;
    return (
        <button
            type="button"
            onClick={async () => {
                await prompt.prompt();
                setPrompt(null);
            }}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-widest"
        >
            <Download className="h-3.5 w-3.5" /> Install app
        </button>
    );
}