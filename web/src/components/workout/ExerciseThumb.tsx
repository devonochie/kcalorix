"use client";

import { useState } from "react";
import { mediaUrl } from "@/lib/workout";

/** Exercise picture. Falls back to the Lovable gradient when there is no image or it fails to load. */
export function ExerciseThumb({ path, alt, className = "" }: { path: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = mediaUrl(path);

  if (!src || failed) {
    return <div role="img" aria-label={alt} className={`bg-gradient-to-br from-primary/25 via-muted to-background ${className}`} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />
  );
}
