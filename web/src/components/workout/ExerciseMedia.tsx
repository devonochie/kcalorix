"use client";

import { useState } from "react";
import { mediaUrl, youtubeEmbedUrl } from "@/lib/workout";

type Props = {
    videoPath: string | null;
    thumbnailPath: string | null;
    title: string;
    className?: string;
};

/** Plays an exercise clip: YouTube embed or a hosted file (e.g. Cloudflare). Shows the URL when the file can't be played. */
export function ExerciseMedia({ videoPath, thumbnailPath, title, className = "" }: Props) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const youtube = youtubeEmbedUrl(videoPath);
    const video = youtube ? null : mediaUrl(videoPath);

    if (youtube) {
        return (
            <iframe
                src={youtube}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={`bg-black ${className}`}
            />
        );
    }

    if (video && failedSrc === video) {
        return (
            <div className={`grid place-items-center bg-black p-6 text-center text-xs text-white/80 ${className}`}>
                <div>
                    <p className="font-bold uppercase tracking-widest">Video couldn&apos;t be played</p>
                    <p className="mt-2 break-all opacity-70">{video}</p>
                </div>
            </div>
        );
    }

    if (video) {
        return (
            <video
                key={video}
                src={video.includes("#") ? video : `${video}#t=0.1`}
                poster={mediaUrl(thumbnailPath) ?? undefined}
                controls
                loop
                muted
                playsInline
                preload="auto"
                onError={() => setFailedSrc(video)}
                className={`bg-black object-contain ${className}`}
            />
        );
    }
    return null;
}