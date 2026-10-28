/**
 * Change a page's background here. Nothing else needs to change.
 *   image: { type: "image", src: "/images/s3.jpg" }
 *   video: { type: "video", src: "/videos/bg.mp4", poster: "/images/s3.jpg" }  (files go in public/)
 */
export type BackgroundConfig =
    | { type: "image"; src: string }
    | { type: "video"; src: string; poster: string; webm?: string };

export const BACKGROUNDS = {
    auth: {
        type: "video",
        src: "/videos/bg.mp4",
        webm: "/videos/bg.webm",
        poster: "/images/auth-poster.jpg",
    },
} satisfies Record<string, BackgroundConfig>;