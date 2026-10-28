"use client";

import { useState, type FormEvent } from "react";
import { Database, Download, ShieldAlert, Trash2 } from "lucide-react";
import { errorCls, fieldCls } from "@/components/ui/classes";
import { useDeleteAccount, useExportCsv, useExportData } from "@/hooks/use-profile";
import { errorMessage } from "@/lib/errors";
import { profileCardCls, SectionHeading } from "./profile-ui";

export function DataCard() {
    const exportData = useExportData();
    const exportCsv = useExportCsv();
    const del = useDeleteAccount();
    const [confirming, setConfirming] = useState(false);
    const [password, setPassword] = useState("");

    function submit(e: FormEvent) {
        e.preventDefault();
        if (!password || del.isPending) return;
        del.mutate({ password });
    }

    return (
        <section className={profileCardCls}>
            <SectionHeading icon={Database} title="Your data" sub="Take a copy with you, or start over" />
            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => exportData.mutate()}
                    disabled={exportData.isPending}
                    className="flex items-center gap-2 rounded-full border bg-card px-5 py-3 text-sm transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-primary enabled:hover:text-primary enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-60"
                >
                    <Download className={`h-4 w-4 ${exportData.isPending ? "animate-bounce" : ""}`} />
                    {exportData.isPending ? "Preparing…" : "Export my data"}
                </button>
                <button
                    type="button"
                    onClick={() => exportCsv.mutate()}
                    disabled={exportCsv.isPending}
                    className="flex items-center gap-2 rounded-full border bg-card px-5 py-3 text-sm transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-primary enabled:hover:text-primary enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-60"
                >
                    <Download className={`h-4 w-4 ${exportCsv.isPending ? "animate-bounce" : ""}`} />
                    {exportCsv.isPending ? "Preparing…" : "Export as CSV"}
                </button>
            </div>
            {(exportData.error || exportCsv.error) && (
                <p className={errorCls}>{errorMessage(exportData.error ?? exportCsv.error)}</p>
            )}

            <div className="mt-6 rounded-sm border border-destructive/30 bg-destructive/5 p-4 sm:p-5">
                <h3 className="flex items-center gap-2 font-display text-xl uppercase text-destructive">
                    <ShieldAlert className="h-5 w-5" /> Delete account
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    This removes your account and all your logs. It cannot be undone.
                </p>
                {!confirming ? (
                    <button
                        type="button"
                        onClick={() => setConfirming(true)}
                        className="mt-4 flex items-center gap-2 rounded-full border border-destructive bg-card px-5 py-3 text-sm text-destructive transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground active:scale-95"
                    >
                        <Trash2 className="h-4 w-4" /> Delete my account
                    </button>
                ) : (
                    <form onSubmit={submit} className="animate-fadeup mt-4 space-y-3">
                        <input
                            type="password"
                            autoComplete="current-password"
                            aria-label="Password"
                            placeholder="Enter your password to confirm"
                            className={fieldCls}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {del.error && <p role="alert" className={errorCls}>{errorMessage(del.error)}</p>}
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={!password || del.isPending}
                                className="rounded-full bg-destructive px-5 py-3 text-sm font-bold text-destructive-foreground transition-transform enabled:active:scale-95 disabled:opacity-60"
                            >
                                {del.isPending ? "Deleting…" : "Yes, delete everything"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setConfirming(false);
                                    setPassword("");
                                    del.reset();
                                }}
                                className="rounded-full border bg-card px-5 py-3 text-sm transition-transform active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
}