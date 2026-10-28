"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/use-auth";
import { FullPageSkeleton } from "@/components/ui/FullPageSkeleton";

/** Only shows its children to a logged-in person who finished onboarding. */
export function AuthGate({ children }: { children: ReactNode }) {
    const { user, isLoading, isError } = useMe();
    const router = useRouter();
    const needsOnboarding = !!user && !user.onboardingCompleted;

    useEffect(() => {
        if (isLoading) return;
        // No user, or the server couldn't confirm one: go to login.
        if (isError || !user) router.replace("/login");
        else if (needsOnboarding) router.replace("/onboarding");
    }, [user, isLoading, isError, needsOnboarding, router]);

    if (isLoading || isError || !user || needsOnboarding) {
        return <FullPageSkeleton light />;
    }

    return <>{children}</>;
}