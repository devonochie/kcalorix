"use client";

import { useEffect, useState } from "react";
import type { BackgroundConfig } from "@/lib/backgrounds";

/**
 * A full-bleed picture or looping video behind a page (see lib/backgrounds.ts).
 * Put it first inside a `relative` parent, then give the content `relative z-10`.
 * A video falls back to its poster picture when the person prefers reduced motion or has Data Saver on.
 */
export function Background({ config }: { config: BackgroundConfig }) {
    const [still, setStill] = useState(false);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches || !!conn?.saveData);
    }, []);

    if (config.type === "image") {
        return (
            <div
                aria-hidden
                className="animate-kenburns absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${config.src})` }}
            />
        );
    }

    return (
        <div
            aria-hidden
            className="absolute inset-0 overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${config.poster})` }}
        >
            {!still && (
                <video
                    className={`h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={config.poster}
                    onPlaying={() => setPlaying(true)}
                >
                    {config.webm && <source src={config.webm} type="video/webm" />}
                    <source src={config.src} type="video/mp4" />
                </video>
            )}
        </div>
    );
}
