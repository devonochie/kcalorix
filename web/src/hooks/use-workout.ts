"use client";

import {
  keepPreviousData, useInfiniteQuery, useMutation, useQueries, useQuery, useQueryClient,
} from "@tanstack/react-query";
import { exercisesApi, plansApi, recordsApi, sessionsApi, workoutsApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import type {
  ExerciseDetailResponse, ExerciseListParams, FinishSessionRequest, LogSetRequest, PlanRequest,
  SessionResponse, StartSessionRequest, UpdateSetRequest, WorkoutCategory,
} from "@/types";

/* ---------- exercises ---------- */

export const useExerciseMeta = () =>
    useQuery({ queryKey: keys.exercises.meta, queryFn: () => exercisesApi.meta(), staleTime: 60 * 60_000 });

/** Always refetched on mount so it follows goal changes made in the profile. */
export const useRecommendedExercises = () =>
    useQuery({ queryKey: keys.exercises.recommended, queryFn: () => exercisesApi.recommended(), staleTime: 0 });

export function useExerciseList(params: Omit<ExerciseListParams, "page">) {
  return useInfiniteQuery({
    queryKey: keys.exercises.list(params),
    queryFn: ({ pageParam }) => exercisesApi.list({ ...params, page: pageParam, size: 24 }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.page + 1 < last.totalPages ? last.page + 1 : undefined),
    staleTime: 5 * 60_000,
  });
}

export const useExercise = (slug: string | null) =>
    useQuery({
      queryKey: keys.exercises.detail(slug ?? ""),
      queryFn: () => exercisesApi.getBySlug(slug!),
      enabled: !!slug,
      staleTime: 10 * 60_000,
    });

/** Loads several exercise details at once. Returns a map: slug -> detail (only the ones already loaded). */
export function useExerciseDetails(slugs: string[]) {
  const results = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: keys.exercises.detail(slug),
      queryFn: () => exercisesApi.getBySlug(slug),
      staleTime: 10 * 60_000,
    })),
  });
  const map = new Map<string, ExerciseDetailResponse>();
  for (const r of results) if (r.data) map.set(r.data.slug, r.data);
  return map;
}

/* ---------- plans ---------- */

export const usePlans = () => useQuery({ queryKey: keys.plans.list, queryFn: () => plansApi.list() });

export const usePlan = (id: string | null) =>
    useQuery({ queryKey: keys.plans.detail(id ?? ""), queryFn: () => plansApi.get(id!), enabled: !!id });

/** Pass an id to update a plan, nothing to create a new one. */
export function useSavePlan(id?: string) {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Plan saved" },
    mutationFn: (body: PlanRequest) => (id ? plansApi.update(id, body) : plansApi.create(body)),
    onSuccess: (plan) => {
      // Refetch instead of caching the response: the save response can have empty day ids.
      void qc.invalidateQueries({ queryKey: keys.plans.detail(plan.id) });
      void qc.invalidateQueries({ queryKey: keys.plans.list });
    },
  });
}

export function useGeneratePlan() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Plan generated" },
    mutationFn: () => plansApi.generate(),
    onSuccess: (plan) => {
      void qc.invalidateQueries({ queryKey: keys.plans.detail(plan.id) });
      void qc.invalidateQueries({ queryKey: keys.plans.list });
    },
  });
}
export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Plan deleted" },
    mutationFn: (id: string) => plansApi.remove(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: keys.plans.detail(id) });
      void qc.invalidateQueries({ queryKey: keys.plans.list });
    },
  });
}

/* ---------- ready-made workouts ---------- */

export const useWorkouts = (category?: WorkoutCategory) =>
    useQuery({
      queryKey: keys.workouts.list(category),
      queryFn: () => workoutsApi.list(category),
      staleTime: 10 * 60_000,
    });

export const useWorkout = (id: string | null) =>
    useQuery({
      queryKey: keys.workouts.detail(id ?? ""),
      queryFn: () => workoutsApi.get(id!),
      enabled: !!id,
      staleTime: 10 * 60_000,
    });

/* ---------- sessions ---------- */

export const useActiveSession = () =>
    useQuery({ queryKey: keys.sessions.active, queryFn: () => sessionsApi.getActive(), staleTime: 10_000 });

export const useSession = (id: string | null) =>
    useQuery({ queryKey: keys.sessions.detail(id ?? ""), queryFn: () => sessionsApi.get(id!), enabled: !!id });

export const useSessionHistory = (page: number) =>
    useQuery({
      queryKey: keys.sessions.history(page),
      queryFn: () => sessionsApi.history({ page, size: 10 }),
      placeholderData: keepPreviousData,
    });

/** Edits the cached session (detail + active) without waiting for a refetch. */
function useEditSessionCache() {
  const qc = useQueryClient();
  return (sessionId: string, edit: (s: SessionResponse) => SessionResponse) => {
    qc.setQueryData<SessionResponse>(keys.sessions.detail(sessionId), (old) => (old ? edit(old) : old));
    qc.setQueryData<SessionResponse | null>(keys.sessions.active, (old) =>
        old && old.id === sessionId ? edit(old) : old,
    );
  };
}

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StartSessionRequest) => sessionsApi.start(body),
    onSuccess: (s) => {
      qc.setQueryData(keys.sessions.detail(s.id), s);
      qc.setQueryData(keys.sessions.active, s);
    },
  });
}

export function useLogSet(sessionId: string) {
  const edit = useEditSessionCache();
  return useMutation({
    meta: { success: "Set logged" },
    mutationFn: (body: LogSetRequest) => sessionsApi.logSet(sessionId, body),
    onSuccess: (set) => edit(sessionId, (s) => ({ ...s, sets: [...s.sets, set] })),
  });
}

export function useCompleteWarmup(sessionId: string) {
  const edit = useEditSessionCache();
  return useMutation({
    mutationFn: () => sessionsApi.completeWarmup(sessionId),
    onSuccess: (s) => edit(sessionId, () => s),
  });
}

export function useUpdateSet(sessionId: string) {
  const edit = useEditSessionCache();
  return useMutation({
    meta: { success: "Set updated" },
    mutationFn: ({ setId, body }: { setId: string; body: UpdateSetRequest }) =>
        sessionsApi.updateSet(sessionId, setId, body),
    onSuccess: (set) =>
        edit(sessionId, (s) => ({ ...s, sets: s.sets.map((x) => (x.id === set.id ? set : x)) })),
  });
}

export function useDeleteSet(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Set removed" },
    mutationFn: (setId: string) => sessionsApi.deleteSet(sessionId, setId),
    // The backend renumbers the remaining sets, so reload the session.
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.sessions.detail(sessionId) });
      void qc.invalidateQueries({ queryKey: keys.sessions.active });
    },
  });
}

export function useFinishSession(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Workout complete" },
    mutationFn: (body: FinishSessionRequest) => sessionsApi.finish(sessionId, body),
    onSuccess: (s) => {
      qc.setQueryData(keys.sessions.detail(sessionId), s);
      qc.setQueryData(keys.sessions.active, null);
      void qc.invalidateQueries({ queryKey: ["sessions", "history"] });
      void qc.invalidateQueries({ queryKey: keys.records });
      // Calories burned change the daily balance.
      void qc.invalidateQueries({ queryKey: ["balance"] });
      void qc.invalidateQueries({ queryKey: ["trends"] });
    },
  });
}

export function useCancelSession(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Workout cancelled" },
    mutationFn: () => sessionsApi.cancel(sessionId),
    onSuccess: () => {
      qc.setQueryData(keys.sessions.active, null);
      qc.removeQueries({ queryKey: keys.sessions.detail(sessionId) });
      void qc.invalidateQueries({ queryKey: ["sessions", "history"] });
    },
  });
}

/* ---------- records ---------- */

export const useRecords = () =>
    useQuery({ queryKey: keys.records, queryFn: () => recordsApi.list(), staleTime: 60_000 });