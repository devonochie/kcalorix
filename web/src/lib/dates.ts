// All dates are "yyyy-mm-dd" strings, like the backend's LocalDate.

/** Today's date in a given time zone. */
export function todayIn(timezone: string, now: Date): string {
    try {
        return new Intl.DateTimeFormat("en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(now);
    } catch {
        return now.toISOString().slice(0, 10);
    }
}

const utc = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(Date.UTC(y!, m! - 1, d!));
};

export function shiftIso(iso: string, days: number): string {
    const t = utc(iso);
    t.setUTCDate(t.getUTCDate() + days);
    return t.toISOString().slice(0, 10);
}

export const isIso = (s: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export function weekdayName(iso: string, style: "long" | "short" = "long") {
    return utc(iso).toLocaleDateString("en-US", { weekday: style, timeZone: "UTC" });
}

export function dayLabel(iso: string, today: string) {
    if (iso === today) return "Today";
    if (iso === shiftIso(today, -1)) return "Yesterday";
    return utc(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}