import { iconImage } from "@/lib/pwa-icon";

// /pwa-icon/192, /pwa-icon/512 and /pwa-icon/maskable are made once at build time.
export const dynamicParams = false;

export function generateStaticParams() {
    return [{ size: "192" }, { size: "512" }, { size: "maskable" }];
}

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
    const { size } = await params;
    // "maskable" fills the whole square (Android crops it into its own shape),
    // so the letter is smaller to stay inside the safe area.
    if (size === "maskable") return iconImage({ size: 512, rounded: false, glyph: 0.42 });
    return iconImage({ size: size === "192" ? 192 : 512, rounded: true, glyph: 0.58 });
}