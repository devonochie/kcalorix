"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { errorCls, fieldCls, labelCls, primaryBtnCls } from "@/components/ui/classes";
import { MEAL_CHIP, MEAL_ORDER, fmt } from "./meal-meta";
import { useAddMeal, useFoodDetail } from "@/hooks/use-food";
import { errorMessage } from "@/lib/errors";
import type { FoodSearchItem, MealType } from "@/types";

function DetailBody({
                        item,
                        date,
                        initialMeal,
                        onAdded,
                    }: {
    item: FoodSearchItem;
    date: string | null;
    initialMeal: MealType;
    onAdded: (name: string, meal: MealType) => void;
}) {
    const detail = useFoodDetail(item.fdcId);
    const add = useAddMeal();
    const [grams, setGrams] = useState("100");
    const [meal, setMeal] = useState<MealType>(initialMeal);
    const [invalid, setInvalid] = useState(false);

    const food = detail.data;
    const g = Number(grams.replace(",", "."));
    const valid = Number.isFinite(g) && g >= 1 && g <= 5000;
    const k = valid ? g / 100 : 0;
    const base = food ?? { ...item, fiberG: 0, sugarG: 0, sodiumMg: 0, portions: [] };

    return (
        <div>
            <p className="text-sm font-medium">{item.description}</p>
            {item.brand && <p className="text-xs text-muted-foreground">{item.brand}</p>}

            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                {[
                    ["kcal", fmt(base.kcal * k)],
                    ["Protein", `${fmt(base.proteinG * k)} g`],
                    ["Carbs", `${fmt(base.carbsG * k)} g`],
                    ["Fat", `${fmt(base.fatG * k)} g`],
                ].map(([l, v]) => (
                    <div key={l} className="rounded-sm bg-primary/10 p-2">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div>
                        <div className="font-display text-lg">{v}</div>
                    </div>
                ))}
            </div>
            {food && (
                <p className="mt-2 text-xs text-muted-foreground">
                    Fiber {fmt(food.fiberG * k)} g · Sugar {fmt(food.sugarG * k)} g · Sodium {fmt(food.sodiumMg * k)} mg
                </p>
            )}
            {detail.isLoading && <p className="mt-2 text-xs text-muted-foreground">Loading details…</p>}
            {detail.isError && <p className={errorCls}>{errorMessage(detail.error)}</p>}

            <label className="mt-5 block">
                <span className={labelCls}>Amount (grams)</span>
                <input inputMode="decimal" className={fieldCls} value={grams} onChange={(e) => setGrams(e.target.value)} />
                {invalid && !valid && <p className={errorCls}>Enter an amount from 1 to 5000 g.</p>}
            </label>

            {food && food.portions.length > 0 && (
                <label className="mt-4 block">
                    <span className={labelCls}>Common portions</span>
                    <select
                        className={fieldCls}
                        value=""
                        onChange={(e) => e.target.value && setGrams(e.target.value)}
                    >
                        <option value="">Choose a portion…</option>
                        {food.portions.map((p) => (
                            <option key={`${p.label}-${p.gramWeight}`} value={String(p.gramWeight)}>
                                {p.label} ({fmt(p.gramWeight)} g)
                            </option>
                        ))}
                    </select>
                </label>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
                {MEAL_ORDER.map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setMeal(m)}
                        className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest ${meal === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                    >
                        {MEAL_CHIP[m]}
                    </button>
                ))}
            </div>

            {add.error && <p role="alert" className={errorCls}>{errorMessage(add.error)}</p>}

            <button
                type="button"
                disabled={add.isPending || !date}
                className={`mt-6 w-full ${primaryBtnCls}`}
                onClick={() => {
                    if (!valid || !date) return setInvalid(true);
                    add.mutate(
                        { date, mealType: meal, fdcId: item.fdcId, grams: g },
                        { onSuccess: () => onAdded(item.description, meal) },
                    );
                }}
            >
                {add.isPending ? "Adding…" : `Add to ${MEAL_CHIP[meal]}`}
            </button>
        </div>
    );
}

export function FoodDetailModal({
                                    item,
                                    date,
                                    initialMeal,
                                    onClose,
                                    onAdded,
                                }: {
    item: FoodSearchItem | null;
    date: string | null;
    initialMeal: MealType;
    onClose: () => void;
    onAdded: (name: string, meal: MealType) => void;
}) {
    return (
        <Modal open={!!item} onClose={onClose} title="Add food">
            {item && <DetailBody key={item.fdcId} item={item} date={date} initialMeal={initialMeal} onAdded={onAdded} />}
        </Modal>
    );
}