"use client";

import { Bell, Clock } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { errorCls, fieldCls, labelCls } from "@/components/ui/classes";
import { useNotificationPrefs, useUpdateNotificationPrefs } from "@/hooks/use-profile";
import { usePush } from "@/hooks/use-push";
import { errorMessage } from "@/lib/errors";
import { profileCardCls, SectionHeading } from "./profile-ui";

export function NotificationsCard() {
    const { data, isLoading, isError } = useNotificationPrefs();
    const update = useUpdateNotificationPrefs();
    const push = usePush();
    const time = (data?.nudgeTime ?? "").slice(0, 5);

    const pushSub =
        push.status === "unsupported"
            ? "Not available in this browser. On iPhone, add Kcalorix to your Home Screen first."
            : push.status === "blocked"
                ? "Blocked. Allow notifications for Kcalorix in your browser or phone settings."
                : "Get the daily nudge on this device, even when the app is closed";

    return (
        <section className={profileCardCls}>
            <SectionHeading icon={Bell} title="Notifications" sub="Gentle reminders, only when you want them" />
            {isLoading && <div className="h-16 animate-pulse rounded-sm bg-muted" />}
            {isError && <p className="text-sm text-destructive">Couldn&apos;t load your notification settings.</p>}
            {data && (
                <>
                    <Toggle
                        title="Daily nudges"
                        sub="A daily check-in on your calories at the time you choose"
                        on={data.enabled}
                        disabled={update.isPending}
                        onChange={() => update.mutate({ enabled: !data.enabled, nudgeTime: data.nudgeTime })}
                    />
                    <Toggle
                        title="Phone alerts"
                        sub={pushSub}
                        on={push.status === "on"}
                        disabled={push.busy || push.status === "loading" || push.status === "unsupported" || push.status === "blocked"}
                        onChange={() => void (push.status === "on" ? push.disable() : push.enable())}
                    />
                    {push.error && <p className={errorCls}>{push.error}</p>}
                    <label className="mt-4 block">
                <span className={`${labelCls} flex items-center gap-1.5`}>
                  <Clock className="h-3.5 w-3.5" /> Nudge time
                </span>
                        <input
                            type="time"
                            className={fieldCls}
                            value={time}
                            disabled={update.isPending}
                            onChange={(e) => {
                                if (e.target.value) update.mutate({ enabled: data.enabled, nudgeTime: e.target.value });
                            }}
                        />
                    </label>
                    {update.error && <p className={errorCls}>{errorMessage(update.error)}</p>}
                </>
            )}
        </section>
    );
}