"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { fieldCls, primaryBtnCls } from "@/components/ui/classes";
import { Spinner } from "@/components/ui/Spinner";
import { useLogin } from "@/hooks/use-auth";
import { fieldErrors, loginErrorMessage } from "@/lib/errors";

export default function LoginPage() {
    const login = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function submit(e: FormEvent) {
        e.preventDefault();
        if (login.isPending) return;
        login.mutate({ email: email.trim(), password });
    }

    const fields = fieldErrors(login.error);

    return (
        <AuthShell kicker="Welcome" title="Back">
            <h1 className="font-display text-4xl uppercase">Log in</h1>
            <p className="mt-2 text-sm text-muted-foreground">Pick up where you left off.</p>
            <form onSubmit={submit} className="mt-8 space-y-4">
                <input
                    aria-label="Email"
                    autoComplete="email"
                    className={`${fieldCls} ${fields["email"] ? "animate-shake border-destructive" : ""}`}
                    type="email"
                    maxLength={255}
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {fields["email"] && <p className="animate-shake text-sm text-destructive">{fields["email"]}</p>}
                <input
                    aria-label="Password"
                    autoComplete="current-password"
                    className={`${fieldCls} ${fields["password"] ? "animate-shake border-destructive" : ""}`}
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {fields["password"] && <p className="animate-shake text-sm text-destructive">{fields["password"]}</p>}
                <Link href="/forgot-password" className="block text-right text-sm text-primary hover:underline">
                    Forgot password?
                </Link>
                {login.error && (
                    <p role="alert" className="animate-shake text-sm text-destructive">
                        {loginErrorMessage(login.error)}
                    </p>
                )}
                <button type="submit" className={`${primaryBtnCls} flex w-full items-center justify-center gap-2`} disabled={login.isPending}>
                    {login.isPending && <Spinner />}
                    {login.isPending ? "Logging in…" : "Log in"}
                </button>
            </form>
            <p className="mt-8 text-center text-sm text-muted-foreground">
                New here?{" "}
                <Link href="/register" className="text-primary hover:underline">
                    Create an account
                </Link>
            </p>
        </AuthShell>
    );
}