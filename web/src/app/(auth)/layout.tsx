"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMe } from "@/hooks/use-auth";
import { FullPageSkeleton } from "@/components/ui/FullPageSkeleton";

// Email links must work whether or not the person is logged in.
const OPEN_PATHS = ["/verify-email", "/reset-password"];

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useMe();
  const router = useRouter();
  const path = usePathname();
  const isOpen = OPEN_PATHS.some((p) => path.startsWith(p));
  const mustLeave = !!user && !isOpen;

  useEffect(() => {
    if (mustLeave && user) router.replace(user.onboardingCompleted ? "/today" : "/onboarding");
  }, [mustLeave, user, router]);

  if (isLoading || mustLeave) return <FullPageSkeleton />;
  return <>{children}</>;
}
