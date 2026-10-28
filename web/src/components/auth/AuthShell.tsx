import Link from "next/link";
import type { ReactNode } from "react";
import { Background } from "@/components/ui/Background";
import { Logo } from "@/components/ui/Logo";
import { BACKGROUNDS } from "@/lib/backgrounds";

export function AuthShell({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
    return (
        <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-background px-5 py-10">
            <Background config={BACKGROUNDS.auth} />
            <div className="absolute inset-0 bg-scrim" />
            {/* soft glowing blobs that drift slowly behind the card */}
            <div aria-hidden className="animate-float pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
            <div
                aria-hidden
                className="animate-float pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-primary/15 blur-3xl"
                style={{ animationDelay: "-7s", animationDirection: "reverse" }}
            />

            <div className="relative z-10 flex w-full max-w-md flex-col items-center">
                <Link href="/" className="animate-fadein">
                    <Logo />
                </Link>
                <p className="mt-8 hidden text-center font-display text-6xl uppercase leading-[0.9] sm:block">
                    <span className="block overflow-hidden">
                        <span className="animate-rise block text-outline">{kicker}</span>
                    </span>
                    <span className="block overflow-hidden">
                        <span className="animate-rise block text-primary" style={{ animationDelay: "120ms" }}>
                            {title}
                        </span>
                    </span>
                </p>
                <div className="animate-card mt-8 w-full rounded-sm border bg-background/75 p-6 shadow-2xl backdrop-blur-md sm:p-8">
                    {/* each direct child (heading, text, form, link) fades up one after another */}
                    <div className="stagger">{children}</div>
                </div>
            </div>
        </main>
    );
}