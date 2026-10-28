"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthRecovery } from "@/components/auth/AuthRecovery";

function VerifyEmailInner() {
  const token = useSearchParams().get("token") ?? "";
  return <AuthRecovery mode="verify" token={token} />;
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}
