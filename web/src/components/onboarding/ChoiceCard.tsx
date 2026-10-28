"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";

type Props = { on: boolean; title: string; sub?: string; onClick: () => void };

/** A big selectable card with a check circle. Used by every single-choice question. */
export function ChoiceCard({ on, title, sub, onClick }: Props) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={on}
            className={`flex w-full items-center justify-between gap-3 rounded-sm border p-5 text-left transition-[colors,transform] active:scale-[0.99] ${on ? "border-primary bg-primary/10" : "bg-card"}`}
        >
      <span className="min-w-0">
        <span className="block font-medium">{title}</span>
          {sub && <span className="text-sm text-muted-foreground">{sub}</span>}
      </span>
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : ""}`}>
        {on && (
            <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 16 }}
                className="grid place-items-center"
            >
                <Check className="h-3.5 w-3.5" />
            </motion.span>
        )}
      </span>
        </button>
    );
}