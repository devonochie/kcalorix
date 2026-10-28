"use client";

import { useRef, type ChangeEvent } from "react";
import { Camera } from "lucide-react";

type Props = {
    onFile: (file: File | undefined) => void;
    /** "start": first photo (big buttons, centred). "retake": replace the current photo. */
    variant: "start" | "retake";
    disabled?: boolean;
};

export function PhotoActions({ onFile, variant, disabled }: Props) {
    const camera = useRef<HTMLInputElement>(null);
    const library = useRef<HTMLInputElement>(null);

    function onChange(e: ChangeEvent<HTMLInputElement>) {
        onFile(e.target.files?.[0]);
        e.target.value = "";
    }

    const inputs = (
        <>
            <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={onChange} />
            <input ref={library} type="file" accept="image/*" hidden onChange={onChange} />
        </>
    );

    if (variant === "start") {
        return (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => camera.current?.click()} className="rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground">
                    Take photo
                </button>
                <button type="button" onClick={() => library.current?.click()} className="rounded-full border bg-card px-6 py-3 text-sm uppercase tracking-widest">
                    Choose photo
                </button>
                {inputs}
            </div>
        );
    }

    return (
        <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={disabled} onClick={() => camera.current?.click()} className="flex items-center gap-2 rounded-full border bg-card px-5 py-3 text-sm disabled:opacity-60">
                <Camera className="h-4 w-4" /> Retake photo
            </button>
            <button type="button" disabled={disabled} onClick={() => library.current?.click()} className="flex items-center gap-2 rounded-full border bg-card px-5 py-3 text-sm disabled:opacity-60">
                <Camera className="h-4 w-4" /> Choose another
            </button>
            {inputs}
        </div>
    );
}