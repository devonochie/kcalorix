import { scale } from "@/components/food/meal-meta";
import type { FoodSearchItem } from "@/types";

/** Max foods added to the diary in one go. */
export const MAX_BATCH = 10;

export interface Row {
    key: string;
    name: string;
    confidence: string;
    grams: number;
    matches: FoodSearchItem[];
    pick: number; // index into matches
}

export const clampGrams = (g: number) => Math.min(5000, Math.max(10, g));

/** Turns the photo-detection response into editable rows. */
export function rowsFromDetection(
    items: { name: string; confidence: string; estimatedGrams: number; matches: FoodSearchItem[] }[],
): Row[] {
    return items.map((it, i) => ({
        key: `${i}-${it.name}`,
        name: it.name,
        confidence: it.confidence,
        grams: clampGrams(it.estimatedGrams),
        matches: it.matches,
        pick: 0,
    }));
}

/** Only rows that matched a food in the database can be added. */
export const withMatch = (rows: Row[] | null) => (rows ?? []).filter((r) => r.matches.length > 0);

export function totalsOf(rows: Row[]) {
    return rows.reduce(
        (s, r) => {
            const m = r.matches[r.pick]!;
            return {
                k: s.k + scale(m.kcal, r.grams),
                p: s.p + scale(m.proteinG, r.grams),
                c: s.c + scale(m.carbsG, r.grams),
                f: s.f + scale(m.fatG, r.grams),
            };
        },
        { k: 0, p: 0, c: 0, f: 0 },
    );
}