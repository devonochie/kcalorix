import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: "/",
        name: "Kcalorix",
        short_name: "Kcalorix",
        description: "Track your meals, calories and workouts in one place.",
        lang: "en",
        start_url: "/today",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#fbfaf7",
        theme_color: "#fe7802",
        categories: ["health", "fitness", "lifestyle"],
        icons: [
            { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/pwa-icon/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
            { name: "Log food", url: "/add-food" },
            { name: "Today", url: "/today" },
            { name: "Workouts", url: "/workouts" },
        ],
    };
}