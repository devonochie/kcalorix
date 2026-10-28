import { MealType } from "@/types";

export const MEAL_ORDER = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER, MealType.SNACK];

/** Section names (plural for snacks, like the design). */
export const MEAL_LABEL: Record<MealType, string> = {
    [MealType.BREAKFAST]: "Breakfast",
    [MealType.LUNCH]: "Lunch",
    [MealType.DINNER]: "Dinner",
    [MealType.SNACK]: "Snacks",
};

/** Chip names. */
export const MEAL_CHIP: Record<MealType, string> = { ...MEAL_LABEL, [MealType.SNACK]: "Snack" };

export const mealFromParam = (v: string | null): MealType | null =>
    MEAL_ORDER.find((m) => m === v) ?? null;

export function defaultMeal(now: Date | null): MealType {
    const h = now ? now.getHours() : 12;
    if (h < 10) return MealType.BREAKFAST;
    if (h < 15) return MealType.LUNCH;
    if (h < 21) return MealType.DINNER;
    return MealType.SNACK;
}

export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
export const gramsText = (n: number) => `${Math.round(n * 10) / 10} g`;
export const scale = (per100: number, grams: number) => Math.round((per100 * grams) / 100);