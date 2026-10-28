import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { RegisterSW } from "@/components/pwa/RegisterSW";

const anton = Anton({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-anton",
});

const spaceGrotesk = Space_Grotesk({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
    variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
    title: "Kcalorix",
    description: "Track your meals, calories and workouts in one place.",
    applicationName: "Kcalorix",
    appleWebApp: { capable: true, title: "Kcalorix", statusBarStyle: "default" },
    formatDetection: { telephone: false },
};

export const viewport: Viewport = {
    themeColor: "#fe7802",
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" className={`${anton.variable} ${spaceGrotesk.variable}`}>
        <body className="min-h-dvh">
        <Providers>{children}</Providers>
        <RegisterSW />
        </body>
        </html>
    );
}