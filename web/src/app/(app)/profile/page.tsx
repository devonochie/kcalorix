"use client";

import { LogOut, ShieldAlert, ShieldCheck, UserRound } from "lucide-react";
import { PageHeader } from "@/components/shell/AppShell";
import { GoalsForm } from "@/components/profile/GoalsForm";
import { TargetsCard } from "@/components/profile/TargetsCard";
import { NotificationsCard } from "@/components/profile/NotificationsCard";
import { DataCard } from "@/components/profile/DataCard";
import { profileCardCls } from "@/components/profile/profile-ui";
import { useLogout, useMe } from "@/hooks/use-auth";
import { useProfile, useTargets } from "@/hooks/use-profile";
import { InstallButton } from "@/components/pwa/InstallButton";

const GOAL_LABEL: Record<string, string> = {
    LOSE: "Lose weight",
    MAINTAIN: "Maintain",
    GAIN: "Build muscle",
};

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-sm border bg-background/60 p-3 text-center backdrop-blur-sm sm:p-4">
            <div className="truncate font-display text-xl uppercase sm:text-2xl">{value}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        </div>
    );
}

export default function ProfilePage() {
    const { user } = useMe();
    const profile = useProfile();
    const targets = useTargets();
    const logout = useLogout();
    const name = user?.displayName || user?.email || "You";
    const verified = !(user && !user.emailVerified);

    return (
        <div>
            <PageHeader kicker="Account and goals" title="Profile" />

            {/* ---------- hero ---------- */}
            <section className="animate-fadeup relative mt-8 overflow-hidden rounded-sm border bg-gradient-to-br from-primary/20 via-card to-card p-5 sm:p-8">
                <UserRound aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 rotate-12 text-primary/[0.07]" />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
                    <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-primary font-display text-4xl text-primary-foreground shadow-lg ring-4 ring-primary/20">
                        {name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="truncate font-display text-3xl uppercase leading-none sm:text-4xl">{name}</div>
                        <div className="mt-1 truncate text-sm text-muted-foreground">{user?.email}</div>
                        <span
                            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                                verified ? "bg-primary/15 text-primary" : "bg-destructive/10 text-destructive"
                            }`}
                        >
                            {verified ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                            {verified ? "Email verified" : "Not verified"}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <InstallButton />
                        <button
                            type="button"
                            onClick={() => logout.mutate()}
                            disabled={logout.isPending}
                            className="flex items-center gap-2 rounded-full border bg-card px-5 py-3 text-xs uppercase tracking-widest transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-destructive enabled:hover:text-destructive enabled:hover:shadow-md enabled:active:scale-95 disabled:opacity-60"
                        >
                            <LogOut className="h-4 w-4" /> {logout.isPending ? "Logging out…" : "Log out"}
                        </button>
                    </div>
                </div>

                <div className="relative mt-6 grid grid-cols-3 gap-3">
                    <Stat label="Goal" value={profile.data ? (GOAL_LABEL[profile.data.goal] ?? "—") : "—"} />
                    <Stat label="Training days" value={profile.data?.daysPerWeek ? `${profile.data.daysPerWeek} / week` : "—"} />
                    <Stat label="Daily kcal" value={targets.data ? targets.data.calorieTarget.toLocaleString() : "—"} />
                </div>
            </section>

            <div className="mt-5 grid gap-5 2xl:grid-cols-2">
                <div className="space-y-5">
                    {profile.isLoading && <div className="h-96 animate-pulse rounded-sm border bg-card" />}
                    {profile.isError && (
                        <section className={profileCardCls}>
                            <p className="text-sm text-destructive">Couldn&apos;t load your profile.</p>
                            <button type="button" onClick={() => void profile.refetch()} className="mt-3 text-sm text-primary underline">
                                Try again
                            </button>
                        </section>
                    )}
                    {profile.data && <GoalsForm profile={profile.data} />}
                </div>
                <div className="space-y-5">
                    <TargetsCard />
                    <NotificationsCard />
                    <DataCard />
                </div>
            </div>
        </div>
    );
}