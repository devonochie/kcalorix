"use client";

import { useEffect } from "react";
import Link from "next/link";

// Next.js has used different names for the "try again" function over time,
// so this accepts all of them.
interface ErrorPageProps {
    error: unknown;
    retry?: () => void;
    unstable_retry?: () => void;
    reset?: () => void;
}

export default function ErrorPage(props: ErrorPageProps) {
    const { error } = props;
    const retry = props.retry ?? props.unstable_retry ?? props.reset;

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="grid min-h-dvh place-items-center bg-background px-6 text-center">
            <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary">Something broke</p>
                <h1 className="mt-2 font-display text-6xl uppercase">Oops</h1>
                <p className="mt-3 text-sm text-muted-foreground">Something went wrong on our side. Please try again.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {retry && (
                        <button
                            type="button"
                            onClick={() => retry()}
                            className="rounded-sm bg-primary px-6 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground"
                        >
                            Try again
                        </button>
                    )}
                    <Link href="/today" className="rounded-sm border px-6 py-3 text-sm font-bold uppercase tracking-widest">
                        Go to Today
                    </Link>
                </div>
            </div>
        </main>
    );
}