"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

/**
 * Big tappable tile for one workout category.
 * With a photo it becomes a picture card (dark fade so the text stays readable);
 * without one, or if the photo fails to load, it keeps the original gradient + icon look.
 */
export function CategoryTile({
                                 label, detail, icon: Icon, image, selected, wide, onSelect,
                             }: {
    label: string;
    detail: string | null;
    icon: LucideIcon;
    image?: string;
    selected: boolean;
    wide?: boolean; // full width on phones
    onSelect: () => void;
}) {
    const [failed, setFailed] = useState(false);
    const hasPhoto = Boolean(image) && !failed;

    return (
        <motion.button
            type="button"
            aria-pressed={selected}
            onClick={onSelect}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            className={`group relative flex min-h-36 flex-col justify-between overflow-hidden rounded-sm border p-5 text-left transition-colors md:min-h-52 ${
                wide ? "col-span-2 md:col-span-1" : ""
            } ${
                hasPhoto
                    ? `bg-card text-white ${selected ? "border-primary ring-2 ring-primary" : "hover:border-primary"}`
                    : selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-gradient-to-br from-primary/15 via-card to-card hover:border-primary"
            }`}
        >
            {hasPhoto ? (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={image}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        onError={() => setFailed(true)}
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* dark fade for readable text; turns orange when the tile is selected */}
                    <span
                        aria-hidden
                        className={`pointer-events-none absolute inset-0 transition-colors ${
                            selected
                                ? "bg-gradient-to-t from-primary/90 via-primary/45 to-black/10"
                                : "bg-gradient-to-t from-black/85 via-black/40 to-black/10"
                        }`}
                    />
                </>
            ) : (
                <Icon
                    aria-hidden
                    className={`pointer-events-none absolute -bottom-5 -right-4 h-28 w-28 md:h-32 md:w-32 ${
                        selected ? "text-primary-foreground opacity-20" : "text-primary opacity-15"
                    }`}
                />
            )}
            <span className="relative font-display text-2xl uppercase leading-none md:text-3xl">{label}</span>
            <span
                className={`relative text-[11px] uppercase tracking-widest ${
                    hasPhoto ? "text-white/80" : selected ? "opacity-80" : "text-muted-foreground"
                }`}
            >
                {detail ?? " "}
            </span>
        </motion.button>
    );
}