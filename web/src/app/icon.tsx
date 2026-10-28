import { iconImage } from "@/lib/pwa-icon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// The little icon in the browser tab (replaces favicon.ico).
export default function Icon() {
    return iconImage({ size: 64, rounded: true, glyph: 0.62 });
}