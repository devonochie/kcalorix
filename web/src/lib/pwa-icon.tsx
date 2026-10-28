import { ImageResponse } from "next/og";

/** Draws the Kcalorix app icon (orange square with a "C."). Used by the manifest, the favicon and the Apple icon. */
export function iconImage({ size, rounded, glyph }: { size: number; rounded: boolean; glyph: number }) {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fe7802",
                    borderRadius: rounded ? Math.round(size * 0.22) : 0,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        fontSize: Math.round(size * glyph),
                        fontWeight: 700,
                        color: "#1a1410",
                        lineHeight: 1,
                    }}
                >
                    <span>K</span>
                    <span style={{ color: "#ffffff" }}>.</span>
                </div>
            </div>
        ),
        { width: size, height: size },
    );
}