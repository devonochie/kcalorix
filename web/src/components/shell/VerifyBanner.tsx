"use client";

import { useMe, useResendVerification } from "@/hooks/use-auth";
import { errorMessage } from "@/lib/errors";

/** Shows only while the logged-in user has not verified their email. */
export function VerifyBanner() {
    const { user, refetch } = useMe();
    const resend = useResendVerification();

    if (!user || user.emailVerified) return null;

    return (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-sm border bg-card px-5 py-3 text-sm">
            <span className="text-muted-foreground">Email not verified</span>
            <button
                type="button"
                disabled={resend.isPending}
                className="text-primary underline disabled:opacity-60"
                onClick={() => resend.mutate()}
            >
                Resend email
            </button>
            <button type="button" className="text-primary underline" onClick={() => void refetch()}>
                Check verification
            </button>
            {resend.isError && <p role="alert" className="text-destructive">{errorMessage(resend.error)}</p>}
        </div>
    );
}