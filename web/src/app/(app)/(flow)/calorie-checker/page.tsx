"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Plus, Sparkles } from "lucide-react";
import { CheckerHeader } from "@/components/food/checker/CheckerHeader";
import { DetectedRow } from "@/components/food/checker/DetectedRow";
import { MacroBars } from "@/components/food/checker/MacroBars";
import { MealChips } from "@/components/food/checker/MealChips";
import { PhotoActions } from "@/components/food/checker/PhotoActions";
import { MAX_BATCH, rowsFromDetection, totalsOf, withMatch, type Row } from "@/components/food/checker/checker-rows";
import { MEAL_CHIP, defaultMeal, mealFromParam } from "@/components/food/meal-meta";
import { errorCls } from "@/components/ui/classes";
import { useAddMealBatch, useDetectFood, useTodayIso } from "@/hooks/use-food";
import { useTargets } from "@/hooks/use-profile";
import { useToday } from "@/hooks/use-today";
import { isIso } from "@/lib/dates";
import { errorMessage } from "@/lib/errors";
import { prepareImage } from "@/lib/image";
import type { MealType } from "@/types";

function CheckerInner() {
    const router = useRouter();
    const params = useSearchParams();
    const now = useToday();
    const todayIso = useTodayIso();
    const dateParam = params.get("date");
    const date = isIso(dateParam) ? dateParam : todayIso;

    const [meal, setMeal] = useState<MealType | null>(mealFromParam(params.get("meal")));
    const activeMeal = meal ?? defaultMeal(now);
    const [preview, setPreview] = useState<string | null>(null);
    const [rows, setRows] = useState<Row[] | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const detect = useDetectFood();
    const addBatch = useAddMealBatch();
    const targets = useTargets();

    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

    async function onFile(file: File | undefined) {
        if (!file) return;
        setFileError(null);
        setRows(null);
        detect.reset();
        try {
            const blob = await prepareImage(file);
            setPreview(URL.createObjectURL(blob));
            detect.mutate(blob, { onSuccess: (res) => setRows(rowsFromDetection(res.items)) });
        } catch (e) {
            setFileError(errorMessage(e));
        }
    }

    const matched = withMatch(rows);
    const totals = totalsOf(matched);

    const update = (key: string, patch: Partial<Row>) =>
        setRows((rs) => rs?.map((r) => (r.key === key ? { ...r, ...patch } : r)) ?? null);
    const remove = (key: string) => setRows((rs) => rs?.filter((x) => x.key !== key) ?? null);

    const nameHref = (q: string) => `/add-food?q=${encodeURIComponent(q)}&meal=${activeMeal}`;

    function addToDiary() {
        if (!date) return;
        addBatch.mutate(
            {
                date,
                mealType: activeMeal,
                items: matched.slice(0, MAX_BATCH).map((r) => ({ fdcId: r.matches[r.pick]!.fdcId, grams: r.grams })),
            },
            { onSuccess: () => router.push("/today") },
        );
    }

    // Step 1: no photo yet
    if (!preview) {
        return (
            <div className="px-5 py-8 md:px-10">
                <div className="mx-auto max-w-2xl">
                    <CheckerHeader />
                    <div className="mt-8 rounded-sm border border-dashed bg-card p-6 text-center sm:p-10">
                        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary">
                            <Camera className="h-6 w-6" />
                        </span>
                        <h2 className="mt-4 font-display text-2xl uppercase">Snap your meal</h2>
                        <p className="mt-1 text-sm text-muted-foreground">We spot the foods, you confirm the amounts.</p>
                        <PhotoActions variant="start" onFile={(f) => void onFile(f)} />
                        {fileError && <p role="alert" className={`${errorCls} mt-4`}>{fileError}</p>}
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: photo chosen
    return (
        <div className="px-5 py-8 md:px-10">
            <div className="mx-auto max-w-6xl">
                <CheckerHeader />
                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-sm border bg-muted">
                            <Image src={preview} alt="Your meal photo" fill unoptimized className="object-cover" />
                            <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs">
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                                {detect.isPending ? "Analyzing your meal…" : `${rows?.length ?? 0} foods detected`}
                            </span>
                        </div>
                        <PhotoActions variant="retake" disabled={detect.isPending} onFile={(f) => void onFile(f)} />
                    </div>

                    <section className="rounded-sm border bg-card p-4 sm:p-6">
                        <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Detected foods</p>
                                <h2 className="font-display text-2xl uppercase">Check and adjust</h2>
                            </div>
                            <MealChips active={activeMeal} onSelect={setMeal} />
                        </div>

                        {detect.isPending && <div className="mt-4 h-24 animate-pulse rounded-sm bg-muted" />}
                        {(detect.error || fileError) && (
                            <div role="alert" className="py-4 text-sm text-destructive">
                                <p>{fileError ?? errorMessage(detect.error)}</p>
                                <Link href="/add-food" className="mt-2 inline-block text-primary underline">
                                    Search by name instead
                                </Link>
                            </div>
                        )}
                        {rows && rows.length === 0 && (
                            <p className="py-4 text-sm text-muted-foreground">We couldn&apos;t spot any food in that photo. Try a clearer shot, or search by name.</p>
                        )}

                        {rows?.map((r, i) => (
                            <DetectedRow
                                key={r.key}
                                row={r}
                                index={i}
                                searchHref={nameHref(r.name)}
                                onChange={(patch) => update(r.key, patch)}
                                onRemove={() => remove(r.key)}
                            />
                        ))}

                        <Link href={`/add-food?meal=${activeMeal}`} className="mt-4 flex items-center gap-2 text-sm text-primary">
                            <Plus className="h-4 w-4" /> Add a missing food
                        </Link>

                        {targets.data && <MacroBars totals={totals} targets={targets.data} />}

                        <div className="mt-6 flex items-baseline justify-between border-t pt-5">
                            <span className="text-sm text-muted-foreground">Total</span>
                            <span className="font-display text-4xl">
                                {totals.k} <span className="font-sans text-sm text-muted-foreground">kcal</span>
                            </span>
                        </div>

                        {matched.length > MAX_BATCH && <p className="mt-3 text-xs text-muted-foreground">Only the first {MAX_BATCH} foods are added at once.</p>}
                        {addBatch.error && <p role="alert" className={`${errorCls} mt-3`}>{errorMessage(addBatch.error)}</p>}
                        <button
                            type="button"
                            disabled={matched.length === 0 || !date || addBatch.isPending}
                            onClick={addToDiary}
                            className="mt-5 w-full rounded-sm bg-primary py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground disabled:opacity-60"
                        >
                            {addBatch.isPending ? "Adding…" : `Add ${Math.min(matched.length, MAX_BATCH)} foods to ${MEAL_CHIP[activeMeal]}`}
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default function CalorieCheckerPage() {
    return (
        <Suspense>
            <CheckerInner />
        </Suspense>
    );
}