import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { scale } from "@/components/food/meal-meta";
import { clampGrams, type Row } from "./checker-rows";

type Props = {
    row: Row;
    index: number;
    /** Where to search this food by name when nothing matched. */
    searchHref: string;
    onChange: (patch: Partial<Row>) => void;
    onRemove: () => void;
};

const stepBtn = "grid h-9 w-9 place-items-center rounded-full border disabled:opacity-40";

export function DetectedRow({ row: r, index, searchHref, onChange, onRemove }: Props) {
    const m = r.matches[r.pick];

    return (
        <div className="border-b py-3">
            {/* line 1: number, name and macros, remove */}
            <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {index + 1}
        </span>
                <div className="min-w-0 flex-1">
                    <div className="break-words text-sm font-medium">
                        {r.name}
                        {r.confidence !== "high" && (
                            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">Not sure</span>
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {m ? `P ${scale(m.proteinG, r.grams)} g · C ${scale(m.carbsG, r.grams)} g · F ${scale(m.fatG, r.grams)} g` : "No match in the food database"}
                    </div>
                </div>
                <button type="button" aria-label={`Remove ${r.name}`} onClick={onRemove} className="-mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center text-muted-foreground">
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* line 2: grams stepper and kcal, aligned under the name */}
            <div className="mt-2 flex items-center justify-between gap-3 pl-9">
                <div className="flex items-center gap-2">
                    <button type="button" aria-label="Less" disabled={r.grams <= 10} onClick={() => onChange({ grams: clampGrams(r.grams - 10) })} className={stepBtn}>
                        <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-14 text-center text-sm font-medium">{r.grams} g</span>
                    <button type="button" aria-label="More" onClick={() => onChange({ grams: clampGrams(r.grams + 10) })} className={stepBtn}>
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                </div>
                <span className="text-right text-sm font-bold">
          {m ? scale(m.kcal, r.grams) : 0} <span className="text-xs font-normal text-muted-foreground">kcal</span>
        </span>
            </div>

            {r.matches.length > 1 && (
                <select
                    aria-label={`Food match for ${r.name}`}
                    value={r.pick}
                    onChange={(e) => onChange({ pick: Number(e.target.value) })}
                    className="mt-2 w-full rounded-sm border bg-card px-3 py-2 text-xs"
                >
                    {r.matches.map((x, idx) => (
                        <option key={x.fdcId} value={idx}>
                            {x.description}
                            {x.brand ? ` (${x.brand})` : ""} · {Math.round(x.kcal)} kcal/100 g
                        </option>
                    ))}
                </select>
            )}
            {r.matches.length === 0 && (
                <Link href={searchHref} className="mt-2 inline-block text-xs text-primary underline">
                    Search “{r.name}” by name
                </Link>
            )}
        </div>
    );
}