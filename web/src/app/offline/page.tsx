import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Offline · Kcalorix" };

export default function OfflinePage() {
    return (
        <main className="grid min-h-dvh place-items-center bg-background px-6 text-center">
            <div>
                <Logo />
                <p className="mt-12 text-xs uppercase tracking-[0.3em] text-primary">No connection</p>
                <h1 className="mt-2 font-display text-6xl uppercase">You&apos;re offline</h1>
                <p className="mt-3 text-sm text-muted-foreground">
                    Kcalorix needs the internet to load your meals and workouts. Check your connection and try again.
                </p>
                <Link
                    href="/today"
                    className="mt-8 inline-block rounded-sm bg-primary px-6 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground"
                >
                    Try again
                </Link>
            </div>
        </main>
    );
}