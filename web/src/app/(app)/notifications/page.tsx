"use client";

import { useState } from "react";
import { Bell, Flame, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shell/AppShell";
import { useMarkAllRead, useMarkRead, useNotificationList, useUnreadCount } from "@/hooks/use-notifications";
import { useToday } from "@/hooks/use-today";
import { errorMessage } from "@/lib/errors";

// One icon per notification type. Unknown types fall back to the bell.
const ICONS: Record<string, LucideIcon> = { DAILY_BALANCE: Flame };

function formatWhen(iso: string, now: Date | null): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    if (now) {
        if (d.toDateString() === now.toDateString()) {
            return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        }
        if ((now.getTime() - d.getTime()) / 86_400_000 < 7) {
            return d.toLocaleDateString("en-US", { weekday: "short" });
        }
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const pill = (on: boolean) =>
    `rounded-full border px-4 py-2.5 text-xs uppercase tracking-widest ${on ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`;

export default function NotificationsPage() {
    const now = useToday();
    const [unreadOnly, setUnreadOnly] = useState(false);
    const unread = useUnreadCount();
    const list = useNotificationList(unreadOnly);
    const markRead = useMarkRead();
    const markAll = useMarkAllRead();

    const items = list.data?.pages.flatMap((p) => p.content) ?? [];
    const actionError = markRead.error ?? markAll.error;

    return (
        <div>
            <PageHeader kicker="Stay on track" title="Notifications">
                <button
                    type="button"
                    disabled={unread === 0 || markAll.isPending}
                    onClick={() => markAll.mutate()}
                    className="rounded-full border bg-card px-5 py-3 text-xs uppercase tracking-widest disabled:opacity-50"
                >
                    {markAll.isPending ? "Working…" : "Mark all as read"}
                </button>
            </PageHeader>

            <div className="mt-6 flex gap-2">
                <button type="button" onClick={() => setUnreadOnly(false)} className={pill(!unreadOnly)}>
                    All
                </button>
                <button type="button" onClick={() => setUnreadOnly(true)} className={pill(unreadOnly)}>
                    Unread · {unread}
                </button>
            </div>

            {actionError && (
                <p role="alert" className="mt-4 text-sm text-destructive">
                    {errorMessage(actionError)}
                </p>
            )}

            <section className="mt-5 max-w-3xl overflow-hidden rounded-sm border bg-card">
                {list.isLoading && <div className="m-5 h-24 animate-pulse rounded-sm bg-muted" />}

                {list.isError && (
                    <div className="p-6">
                        <p className="text-sm text-destructive">{errorMessage(list.error)}</p>
                        <button type="button" onClick={() => void list.refetch()} className="mt-3 text-sm text-primary underline">
                            Try again
                        </button>
                    </div>
                )}

                {items.map((n) => {
                    const Icon = ICONS[n.type] ?? Bell;
                    return (
                        <button
                            key={n.id}
                            type="button"
                            onClick={() => !n.read && markRead.mutate(n.id)}
                            className={`flex w-full items-center gap-4 border-b px-5 py-4 text-left last:border-0 ${n.read ? "" : "bg-primary/5"}`}
                        >
                            <span className={`h-2 w-2 shrink-0 rounded-full ${n.read ? "" : "bg-primary"}`} />
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <Icon className="h-4 w-4" />
              </span>
                            <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{n.title}</span>
                <span className="block text-xs text-muted-foreground">{n.message}</span>
              </span>
                            <span className="shrink-0 text-xs text-muted-foreground">{formatWhen(n.createdAt, now)}</span>
                        </button>
                    );
                })}

                {list.isSuccess && items.length === 0 && (
                    <p className="p-6 text-sm text-muted-foreground">
                        {unreadOnly ? "You're all caught up." : "No notifications yet."}
                    </p>
                )}

                {list.hasNextPage && (
                    <button
                        type="button"
                        onClick={() => void list.fetchNextPage()}
                        disabled={list.isFetchingNextPage}
                        className="w-full border-t px-5 py-4 text-sm text-primary disabled:opacity-60"
                    >
                        {list.isFetchingNextPage ? "Loading…" : "Load more"}
                    </button>
                )}
            </section>
        </div>
    );
}