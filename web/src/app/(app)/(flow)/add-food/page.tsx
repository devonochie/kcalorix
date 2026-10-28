"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Plus, Search, X } from "lucide-react";
import { FoodDetailModal } from "@/components/food/FoodDetailModal";
import { MEAL_CHIP, MEAL_LABEL, MEAL_ORDER, defaultMeal, fmt, gramsText, mealFromParam } from "@/components/food/meal-meta";
import { errorCls } from "@/components/ui/classes";
import { useAddMeal, useFoodSearch, useRecentFoods, useTodayIso } from "@/hooks/use-food";
import { useDebounced } from "@/hooks/use-debounced";
import { useToday } from "@/hooks/use-today";
import { dayLabel, isIso } from "@/lib/dates";
import { errorMessage } from "@/lib/errors";
import { toast } from "@/lib/toast";
import type { FoodSearchItem, MealType } from "@/types";

const TABS = ["Search", "Photo", "Recent"] as const;

function AddFoodInner() {
    const params = useSearchParams();
    const now = useToday();
    const todayIso = useTodayIso();
    const dateParam = params.get("date");
    const date = isIso(dateParam) ? dateParam : todayIso;

    const [tab, setTab] = useState<(typeof TABS)[number]>("Search");
    const [meal, setMeal] = useState<MealType | null>(mealFromParam(params.get("meal")));
    const activeMeal = meal ?? defaultMeal(now);
    const [q, setQ] = useState(params.get("q") ?? "");
    const [branded, setBranded] = useState(false);
    const [selected, setSelected] = useState<FoodSearchItem | null>(null);
    const router = useRouter();

    const query = useDebounced(q.trim(), 500);
    const search = useFoodSearch(query, branded);
    const recent = useRecentFoods(todayIso);
    const quickAdd = useAddMeal();

    const announce = (message: string) =>
        toast.success(message, { duration: 5000, action: { label: "Done", onClick: () => router.push("/today") } });

    const results = search.data?.pages.flatMap((p) => p.content) ?? [];
    const snapHref = `/calorie-checker?meal=${activeMeal}${dateParam && isIso(dateParam) ? `&date=${dateParam}` : ""}`;

    return (
        <div className="px-5 py-10">
            <div className="mx-auto max-w-xl">
                <div className="flex items-center justify-between">
                    <h1 className="font-display text-4xl uppercase md:text-5xl">Add food</h1>
                    <Link href="/today" aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full border bg-card">
                        <X className="h-5 w-5" />
                    </Link>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-1 rounded-sm border bg-card p-1">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`rounded-sm py-2.5 text-sm uppercase tracking-widest ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {MEAL_ORDER.map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMeal(m)}
                            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest ${activeMeal === m ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
                        >
                            {MEAL_CHIP[m]}
                        </button>
                    ))}
                    {date && todayIso && date !== todayIso && (
                        <span className="text-xs text-muted-foreground">for {dayLabel(date, todayIso)}</span>
                    )}
                </div>

                {tab === "Search" && (
                    <>
                        <label className="mt-5 flex items-center gap-3 rounded-sm border bg-card px-4 py-3.5">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search foods"
                                aria-label="Search foods"
                                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            />
                        </label>
                        <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <input type="checkbox" checked={branded} onChange={(e) => setBranded(e.target.checked)} />
                            Include branded and packaged foods
                        </label>
                    </>
                )}

                <Link href={snapHref} className="mt-5 flex items-center gap-4 rounded-sm bg-primary p-5 text-primary-foreground">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-foreground/20">
            <Camera className="h-5 w-5" />
          </span>
                    <span>
            <span className="block font-display text-xl uppercase">Snap your meal</span>
            <span className="text-sm opacity-90">We spot the foods, you confirm</span>
          </span>
                </Link>

                {tab === "Search" && (
                    <section className="mt-5 rounded-sm border bg-card p-6">
                        <h2 className="border-b pb-3 font-display text-xl uppercase">Results</h2>
                        {query.length < 2 && <p className="py-4 text-sm text-muted-foreground">Type at least 2 letters to search foods.</p>}
                        {query.length >= 2 && search.isLoading && <div className="my-4 h-16 animate-pulse rounded-sm bg-muted" />}
                        {search.isError && <p role="alert" className={`${errorCls} py-3`}>{errorMessage(search.error)}</p>}
                        {results.map((f) => (
                            <div key={f.fdcId} className="flex items-center justify-between gap-3 border-b py-3 last:border-0">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-medium">{f.description}</div>
                                    <div className="truncate text-xs text-muted-foreground">
                                        {f.brand ? `${f.brand} · ` : ""}100 g · {fmt(f.kcal)} kcal
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    aria-label={`Add ${f.description}`}
                                    onClick={() => setSelected(f)}
                                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        {query.length >= 2 && search.isSuccess && results.length === 0 && (
                            <p className="py-4 text-sm text-muted-foreground">No foods match “{query}”.</p>
                        )}
                        {search.hasNextPage && (
                            <button
                                type="button"
                                onClick={() => void search.fetchNextPage()}
                                disabled={search.isFetchingNextPage}
                                className="mt-3 text-sm text-primary underline disabled:opacity-60"
                            >
                                {search.isFetchingNextPage ? "Loading…" : "Load more"}
                            </button>
                        )}
                    </section>
                )}

                {tab === "Recent" && (
                    <section className="mt-5 rounded-sm border bg-card p-6">
                        <h2 className="border-b pb-3 font-display text-xl uppercase">Recent</h2>
                        {recent.isLoading && <div className="my-4 h-16 animate-pulse rounded-sm bg-muted" />}
                        {!recent.isLoading && recent.foods.length === 0 && (
                            <p className="py-4 text-sm text-muted-foreground">Foods you logged in the last 3 days will show up here.</p>
                        )}
                        {recent.foods.map((f) => (
                            <div key={f.fdcId} className="flex items-center justify-between gap-3 border-b py-3 last:border-0">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-medium">{f.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {gramsText(f.grams)} · {fmt(f.kcal)} kcal
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    aria-label={`Add ${f.name}`}
                                    disabled={!date || quickAdd.isPending}
                                    onClick={() =>
                                        date &&
                                        quickAdd.mutate(
                                            { date, mealType: activeMeal, fdcId: f.fdcId, grams: f.grams },
                                            { onSuccess: () => announce(`Added ${f.name} to ${MEAL_LABEL[activeMeal]}`) },
                                        )
                                    }
                                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary disabled:opacity-60"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        {quickAdd.error && <p role="alert" className={`${errorCls} py-3`}>{errorMessage(quickAdd.error)}</p>}
                    </section>
                )}
            </div>

            <FoodDetailModal
                item={selected}
                date={date}
                initialMeal={activeMeal}
                onClose={() => setSelected(null)}
                onAdded={(name, m) => {
                    setSelected(null);
                    announce(`Added ${name} to ${MEAL_LABEL[m]}`);
                }}
            />
        </div>
    );
}

export default function AddFoodPage() {
    return (
        <Suspense>
            <AddFoodInner />
        </Suspense>
    );
}