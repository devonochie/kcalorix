"use client";

import { useInfiniteQuery, useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { diaryApi, foodsApi, insightsApi, mealsApi, recognitionApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import { shiftIso, todayIn } from "@/lib/dates";
import { useProfile } from "@/hooks/use-profile";
import { useToday } from "@/hooks/use-today";
import type { AddMealBatchRequest, AddMealEntryRequest, UpdateMealEntryRequest } from "@/types";

/** Today's date in the person's own time zone ("yyyy-mm-dd"). null until it is known. */
export function useTodayIso(): string | null {
    const profile = useProfile();
    const now = useToday();
    const tz = profile.data?.timezone ?? (profile.isError ? Intl.DateTimeFormat().resolvedOptions().timeZone : null);
    if (!now || !tz) return null;
    return todayIn(tz, now);
}

export const useDiary = (date: string | null) =>
    useQuery({ queryKey: keys.diary(date ?? ""), queryFn: () => diaryApi.get(date!), enabled: !!date });

export const useBalance = (date: string | null) =>
    useQuery({ queryKey: keys.balance(date ?? ""), queryFn: () => insightsApi.balance(date!), enabled: !!date });

export const useTrends = (days: number, end: string | null) =>
    useQuery({
        queryKey: keys.trends(days, end ?? ""),
        queryFn: () => insightsApi.trends({ days, end: end! }),
        enabled: !!end,
    });

export function useFoodSearch(query: string, includeBranded: boolean) {
    return useInfiniteQuery({
        queryKey: keys.foods.search({ query, includeBranded }),
        queryFn: ({ pageParam }) => foodsApi.search({ query, page: pageParam, includeBranded }),
        initialPageParam: 0,
        getNextPageParam: (last) => (last.page + 1 < last.totalPages ? last.page + 1 : undefined),
        enabled: query.length >= 2,
        staleTime: 5 * 60_000,
    });
}

export const useFoodDetail = (fdcId: number | null) =>
    useQuery({
        queryKey: keys.foods.detail(fdcId ?? 0),
        queryFn: () => foodsApi.detail(fdcId!),
        enabled: fdcId !== null,
        staleTime: 10 * 60_000,
    });

/** After any food change, refresh everything that shows food totals. */
function useRefreshFood() {
    const qc = useQueryClient();
    return () => {
        void qc.invalidateQueries({ queryKey: ["diary"] });
        void qc.invalidateQueries({ queryKey: ["balance"] });
        void qc.invalidateQueries({ queryKey: ["trends"] });
    };
}

export function useAddMeal() {
    const refresh = useRefreshFood();
    return useMutation({ mutationFn: (b: AddMealEntryRequest) => mealsApi.add(b), onSuccess: refresh });
}

export function useAddMealBatch() {
    const refresh = useRefreshFood();
    return useMutation({ meta: { success: "Meal logged" }, mutationFn: (b: AddMealBatchRequest) => mealsApi.addBatch(b), onSuccess: refresh });
}

export function useUpdateMeal() {
    const refresh = useRefreshFood();
    return useMutation({
        meta: { success: "Entry updated" },
        mutationFn: (v: { id: string; body: UpdateMealEntryRequest }) => mealsApi.update(v.id, v.body),
        onSuccess: refresh,
    });
}


export const useDetectFood = () => useMutation({ mutationFn: (image: Blob) => recognitionApi.detect(image) });

export interface RecentFood {
    fdcId: number;
    name: string;
    brand: string | null;
    grams: number;
    kcal: number;
}

/** Foods logged in the last 3 days (built from the diary, no extra backend endpoint needed). */
export function useRecentFoods(today: string | null) {
    const dates = today ? [today, shiftIso(today, -1), shiftIso(today, -2)] : [];
    return useQueries({
        queries: dates.map((d) => ({ queryKey: keys.diary(d), queryFn: () => diaryApi.get(d) })),
        combine: (results) => {
            const seen = new Set<number>();
            const foods: RecentFood[] = [];
            for (const r of results) {
                for (const group of r.data?.meals ?? []) {
                    for (const e of group.entries) {
                        if (seen.has(e.fdcId)) continue;
                        seen.add(e.fdcId);
                        foods.push({ fdcId: e.fdcId, name: e.foodName, brand: e.brand, grams: e.grams, kcal: e.kcal });
                    }
                }
            }
            return { foods: foods.slice(0, 12), isLoading: results.some((r) => r.isLoading) };
        },
    });
}

export function useDeleteMeal() {
    const refresh = useRefreshFood();
    return useMutation({ mutationFn: (id: string) => mealsApi.remove(id), onSuccess: refresh });
}

/** Puts back an entry that was just deleted (the Undo button). */
export function useRestoreMeal() {
    const refresh = useRefreshFood();
    return useMutation({
        meta: { success: "Entry restored" },
        mutationFn: (b: AddMealEntryRequest) => mealsApi.add(b),
        onSuccess: refresh,
    });
}