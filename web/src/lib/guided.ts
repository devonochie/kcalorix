/* Remembers which running workouts were started from a ready-made workout, so they open in guided mode.
   Same sessionStorage hand-off idea as lib/records.ts. If storage is blocked, the normal screen is used. */
const key = (sessionId: string) => `Kcalorix:guided:${sessionId}`;

export function markGuided(sessionId: string) {
    try {
        sessionStorage.setItem(key(sessionId), "1");
    } catch {
        /* storage can be blocked, the normal screen still works */
    }
}

export function isGuided(sessionId: string): boolean {
    try {
        return sessionStorage.getItem(key(sessionId)) === "1";
    } catch {
        return false;
    }
}

export function clearGuided(sessionId: string) {
    try {
        sessionStorage.removeItem(key(sessionId));
    } catch {
        /* nothing to clear */
    }
}