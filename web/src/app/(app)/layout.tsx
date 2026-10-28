import type { ReactNode } from "react";
import { AuthGate } from "@/components/shell/AuthGate";
import { AppShell } from "@/components/shell/AppShell";
import { VerifyBanner } from "@/components/shell/VerifyBanner";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
      <AuthGate>
        <AppShell>
          <VerifyBanner />
          {children}
        </AppShell>
      </AuthGate>
  );
}