"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { fieldCls, primaryBtnCls } from "@/components/ui/classes";
import { Spinner } from "@/components/ui/Spinner";
import { useRegister } from "@/hooks/use-auth";
import { errorMessage, fieldErrors } from "@/lib/errors";

export default function RegisterPage() {
    const register = useRegister();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function submit(e: FormEvent) {
        e.preventDefault();
        if (register.isPending) return;
        register.mutate({ email: email.trim(), password, displayName: name.trim() });
    }

    const fields = fieldErrors(register.error);

    return (
        <AuthShell kicker="Start" title="Today">
            <h1 className="font-display text-4xl uppercase">Create account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Track meals and workouts in one place.</p>
            <form onSubmit={submit} className="mt-8 space-y-4">
                <input
                    aria-label="Full name"
                    autoComplete="name"
                    className={`${fieldCls} ${fields["displayName"] ? "animate-shake border-destructive" : ""}`}
                    required
                    maxLength={60}
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                {fields["displayName"] && <p className="animate-shake text-sm text-destructive">{fields["displayName"]}</p>}
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
                    autoComplete="new-password"
                    className={`${fieldCls} ${fields["password"] ? "animate-shake border-destructive" : ""}`}
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                    placeholder="Password (min 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {fields["password"] && <p className="animate-shake text-sm text-destructive">{fields["password"]}</p>}
                {register.error && (
                    <p role="alert" className="animate-shake text-sm text-destructive">
                        {errorMessage(register.error)}
                    </p>
                )}
                <button type="submit" className={`${primaryBtnCls} flex w-full items-center justify-center gap-2`} disabled={register.isPending}>
                    {register.isPending && <Spinner />}
                    {register.isPending ? "Creating…" : "Create account"}
                </button>
            </form>
            <p className="mt-8 text-center text-sm text-muted-foreground">
                Already a member?{" "}
                <Link href="/login" className="text-primary hover:underline">
                    Log in
                </Link>
            </p>
        </AuthShell>
    );
}