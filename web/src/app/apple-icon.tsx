import { iconImage } from "@/lib/pwa-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iPhones round the corners themselves, so this one fills the whole square.
export default function AppleIcon() {
    return iconImage({ size: 180, rounded: false, glyph: 0.5 });
}