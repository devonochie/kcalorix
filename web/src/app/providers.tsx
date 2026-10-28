"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { isApiError } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { toast } from "@/lib/toast";
import { AppToaster } from "@/components/ui/AppToaster";

/**
 * Put `meta: { success: "Message" }` on a useMutation and a toast shows when it succeeds.
 * (Error toasts below are only for connection and server problems; validation and other
 * errors stay inline next to the form, as before.)
 */
type MutationMeta = { success?: string };

function Toasts({ client }: { client: QueryClient }) {
    useEffect(() => {
        return client.getMutationCache().subscribe((event) => {
            if (event.type !== "updated") return;
            const { action, mutation } = event;
            const meta = mutation.meta as MutationMeta | undefined;

            if (action.type === "success" && meta?.success) {
                // id = message, so the same toast (e.g. "Set logged") replaces itself instead of stacking.
                toast.success(meta.success, { id: meta.success });
            }

            if (action.type === "error") {
                const e = action.error;
                if (isApiError(e) && (e.code === "NETWORK_ERROR" || e.status >= 500 || e.status === 401)) {
                    toast.error(e.status === 401 ? "Your session expired. Please log in again." : errorMessage(e), { id: "global-error" });
                }
            }
        });
    }, [client]);
    return null;
}

export function Providers({ children }: { children: ReactNode }) {
    // useState so the client is created once per browser session, not on every render
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        staleTime: 30_000,
                        retry: (failureCount, error) => {
                            if (isApiError(error) && [401, 403, 404].includes(error.status)) return false;
                            return failureCount < 1;
                        },
                    },
                    mutations: { retry: false },
                },
            }),
    );

    return (
        <QueryClientProvider client={client}>
            {/* "user" = skip movement for people who turned animations off in their device settings */}
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
            <Toasts client={client} />
            <AppToaster />
        </QueryClientProvider>
    );
}