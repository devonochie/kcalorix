// ADD THIS to your existing public/sw.js (keep everything already in it).

self.addEventListener("push", (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = { body: event.data ? event.data.text() : "" };
    }
    const title = data.title || "Calorix";
    event.waitUntil(
        self.registration.showNotification(title, {
            body: data.body || "",
            icon: "/pwa-icon/192",
            badge: "/pwa-icon/192",
            tag: "calorix-daily", // a newer nudge replaces an older one instead of stacking
            data: { url: data.url || "/today" },
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || "/today";
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
            for (const c of list) {
                if ("focus" in c) {
                    c.navigate(url);
                    return c.focus();
                }
            }
            return self.clients.openWindow(url);
        })
    );
});