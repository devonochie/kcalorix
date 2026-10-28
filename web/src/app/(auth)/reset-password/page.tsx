"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthRecovery } from "@/components/auth/AuthRecovery";

function ResetPasswordInner() {
  const token = useSearchParams().get("token") ?? "";
  return <AuthRecovery mode="reset" token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}
