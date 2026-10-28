"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthShell } from "./AuthShell";
import { fieldCls, primaryBtnCls } from "@/components/ui/classes";
import { useForgotPassword, useResetPassword, useVerifyEmail } from "@/hooks/use-auth";
import { errorMessage, fieldErrors } from "@/lib/errors";

type Mode = "forgot" | "reset" | "verify";

export function AuthRecovery({ mode, token = "" }: { mode: Mode; token?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const forgot = useForgotPassword();
  const reset = useResetPassword();
  const verify = useVerifyEmail();
  const busy = forgot.isPending || reset.isPending || verify.isPending;

  const title = mode === "forgot" ? "Forgot password" : mode === "reset" ? "Reset password" : "Verify email";
  const missingToken = mode !== "forgot" && !token;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || missingToken || message) return;
    setError(null);
    setFields({});
    try {
      if (mode === "forgot") {
        const res = await forgot.mutateAsync(email.trim());
        setMessage(res.message);
      } else if (mode === "reset") {
        const res = await reset.mutateAsync({ token, newPassword: password });
        setPassword("");
        setMessage(res.message);
      } else {
        await verify.mutateAsync(token);
        setMessage("Email verified. You can now log in.");
      }
    } catch (e) {
      setError(errorMessage(e));
      setFields(fieldErrors(e));
    }
  }

  return (
      <AuthShell kicker={mode === "verify" ? "You're" : "Fresh"} title={mode === "verify" ? "Almost in" : "Start"}>
        <h1 className="font-display text-4xl uppercase">{title}</h1>
        {message ? (
            <p role="status" className="mt-6 text-sm text-foreground">
              {message}
            </p>
        ) : (
            <form onSubmit={submit} className="mt-8 space-y-4">
              {mode === "forgot" && (
                  <>
                    <input
                        aria-label="Email"
                        autoComplete="email"
                        className={fieldCls}
                        required
                        type="email"
                        maxLength={255}
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {fields["email"] && <p className="text-sm text-destructive">{fields["email"]}</p>}
                  </>
              )}
              {mode === "reset" && (
                  <>
                    <input
                        aria-label="New password"
                        autoComplete="new-password"
                        className={fieldCls}
                        required
                        type="password"
                        minLength={8}
                        maxLength={72}
                        placeholder="New password (min 8 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {fields["newPassword"] && <p className="text-sm text-destructive">{fields["newPassword"]}</p>}
                  </>
              )}
              {missingToken && (
                  <p role="alert" className="text-sm text-destructive">
                    This link is missing its token. Please use the link in your email.
                  </p>
              )}
              {fields["token"] && <p className="text-sm text-destructive">{fields["token"]}</p>}
              {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
              )}
              <button type="submit" disabled={busy || missingToken} className={`${primaryBtnCls} w-full`}>
                {busy
                    ? "Please wait…"
                    : mode === "forgot"
                        ? "Send reset link"
                        : mode === "reset"
                            ? "Update password"
                            : "Verify email"}
              </button>
            </form>
        )}
        <Link href="/login" className="mt-8 text-center text-sm text-primary hover:underline">
          Back to log in
        </Link>
        {mode === "reset" && missingToken && (
            <Link href="/forgot-password" className="mt-4 text-center text-sm text-primary hover:underline">
              Request a new link
            </Link>
        )}
      </AuthShell>
  );
}