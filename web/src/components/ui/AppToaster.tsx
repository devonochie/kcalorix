"use client";

import type { CSSProperties } from "react";
import { Toaster } from "sonner";
import { CircleAlert, CircleCheck } from "lucide-react";

/**
 * Mounted once in providers.tsx. The wrapper has class "app-light" so the toasts use the
 * same light colours as the app pages, even on the dark landing page.
 */
export function AppToaster() {
    return (
        <div className="app-light">
            <Toaster
                position="top-center"
                offset="calc(env(safe-area-inset-top) + 12px)"
                mobileOffset="calc(env(safe-area-inset-top) + 12px)"
                visibleToasts={3}
                duration={3500}
                gap={10}
                theme="light"
                icons={{
                    success: <CircleCheck className="h-5 w-5 text-primary" />,
                    error: <CircleAlert className="h-5 w-5 text-destructive" />,
                }}
                toastOptions={{
                    classNames: {
                        toast: "!rounded-sm !shadow-lg !text-sm !font-medium",
                        actionButton: "!rounded-sm !bg-primary !font-bold !uppercase !tracking-widest !text-primary-foreground",
                    },
                }}
                style={
                    {
                        fontFamily: "var(--font-sans)",
                        "--normal-bg": "var(--card)",
                        "--normal-text": "var(--foreground)",
                        "--normal-border": "var(--border)",
                        "--border-radius": "var(--radius)",
                    } as CSSProperties
                }
            />
        </div>
    );
}