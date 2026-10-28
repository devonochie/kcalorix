"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { errorCls, fieldCls, labelCls, primaryBtnCls } from "@/components/ui/classes";
import { MEAL_CHIP, MEAL_ORDER, fmt } from "./meal-meta";
import { useDeleteMeal, useUpdateMeal } from "@/hooks/use-food";
import { errorMessage } from "@/lib/errors";
import type { MealEntryResponse, MealType } from "@/types";

function EntryForm({ entry, onClose, onDeleted }: { entry: MealEntryResponse; onClose: () => void; onDeleted?: (entry: MealEntryResponse) => void }) {
    const update = useUpdateMeal();
    const remove = useDeleteMeal();
    const [grams, setGrams] = useState(String(entry.grams));
    const [meal, setMeal] = useState<MealType>(entry.mealType);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [invalid, setInvalid] = useState(false);

    const g = Number(grams.replace(",", "."));
    const valid = Number.isFinite(g) && g >= 1 && g <= 5000;
    const ratio = valid ? g / entry.grams : 1;
    const busy = update.isPending || remove.isPending;
    const error = update.error ?? remove.error;

    return (
        <div>
            <p className="text-sm font-medium">{entry.foodName}</p>
            {entry.brand && <p className="text-xs text-muted-foreground">{entry.brand}</p>}

            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                {[
                    ["kcal", fmt(entry.kcal * ratio)],
                    ["Protein", `${fmt(entry.proteinG * ratio)} g`],
                    ["Carbs", `${fmt(entry.carbsG * ratio)} g`],
                    ["Fat", `${fmt(entry.fatG * ratio)} g`],
                ].map(([l, v]) => (
                    <div key={l} className="rounded-sm bg-primary/10 p-2">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{l}</div>
                        <div className="font-display text-lg">{v}</div>
                    </div>
                ))}
            </div>

            <label className="mt-5 block">
                <span className={labelCls}>Amount (grams)</span>
                <input inputMode="decimal" className={fieldCls} value={grams} onChange={(e) => setGrams(e.target.value)} />
                {invalid && !valid && <p className={errorCls}>Enter an amount from 1 to 5000 g.</p>}
            </label>

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

            {error && <p role="alert" className={errorCls}>{errorMessage(error)}</p>}

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    disabled={busy}
                    className={primaryBtnCls}
                    onClick={() => {
                        if (!valid) return setInvalid(true);
                        update.mutate({ id: entry.id, body: { mealType: meal, grams: g } }, { onSuccess: onClose });
                    }}
                >
                    {update.isPending ? "Saving…" : "Save"}
                </button>
                {!confirmDelete ? (
                    <button type="button" onClick={() => setConfirmDelete(true)} className="text-sm text-destructive underline">
                        Delete
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                            remove.mutate(entry.id, {
                                onSuccess: () => {
                                    onClose();
                                    onDeleted?.(entry);
                                },
                            })
                        }
                        className="rounded-full bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground"
                    >
                        {remove.isPending ? "Deleting…" : "Yes, delete"}
                    </button>
                )}
            </div>
        </div>
    );
}

export function EntryEditModal({
                                   entry,
                                   onClose,
                                   onDeleted,
                               }: {
    entry: MealEntryResponse | null;
    onClose: () => void;
    onDeleted?: (entry: MealEntryResponse) => void;
}) {
    return (
        <Modal open={!!entry} onClose={onClose} title="Edit entry">
            {entry && <EntryForm key={entry.id} entry={entry} onClose={onClose} onDeleted={onDeleted} />}
        </Modal>
    );
}