import { MEAL_CHIP, MEAL_ORDER } from "@/components/food/meal-meta";
import type { MealType } from "@/types";

type Props = { active: MealType; onSelect: (meal: MealType) => void };

export function MealChips({ active, onSelect }: Props) {
    return (
        <div className="flex flex-wrap gap-2">
            {MEAL_ORDER.map((m) => (
                <button
                    key={m}
                    type="button"
                    onClick={() => onSelect(m)}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest ${active === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                    {MEAL_CHIP[m]}
                </button>
            ))}
        </div>
    );
}