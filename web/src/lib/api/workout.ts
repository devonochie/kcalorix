import {api, isApiError} from "./client";
import type {
  ExerciseDetailResponse, ExerciseListParams, ExerciseMetaResponse, ExerciseRecordResponse,
  ExerciseSummaryResponse, FinishSessionRequest, LogSetRequest, PageParams, PageResponse,
  PlanRequest, PlanResponse, PlanSummaryResponse, RecommendationsResponse, SessionResponse, SessionSetResponse,
  SessionSummaryResponse, StartSessionRequest, UpdateSetRequest, UUID,
  WorkoutCategory, WorkoutDetailResponse, WorkoutSummaryResponse,
} from "@/types";

export const exercisesApi = {
  list: (params?: ExerciseListParams) =>
      api.get<PageResponse<ExerciseSummaryResponse>>("/exercises", { params }).then((r) => r.data),
  meta: () => api.get<ExerciseMetaResponse>("/exercises/meta").then((r) => r.data),
  /** Exercises ranked for the logged-in user (goal, level, equipment). */
  recommended: () =>
      api.get<RecommendationsResponse>("/exercises/recommended").then((r) => r.data),
  getBySlug: (slug: string) =>
      api.get<ExerciseDetailResponse>(`/exercises/${slug}`).then((r) => r.data),
};

export const plansApi = {
  list: () => api.get<PlanSummaryResponse[]>("/plans").then((r) => r.data),
  create: (body: PlanRequest) => api.post<PlanResponse>("/plans", body).then((r) => r.data),
  /** Builds a plan from the saved profile (goal, level, days per week, equipment). No-body. */
  generate: () => api.post<PlanResponse>("/plans/generate").then((r) => r.data),
  get: (id: UUID) => api.get<PlanResponse>(`/plans/${id}`).then((r) => r.data),
  update: (id: UUID, body: PlanRequest) =>
      api.put<PlanResponse>(`/plans/${id}`, body).then((r) => r.data),
  remove: (id: UUID) => api.delete<void>(`/plans/${id}`).then(() => undefined),
};

export const workoutsApi = {
  list: (category?: WorkoutCategory) =>
      api.get<WorkoutSummaryResponse[]>("/workouts", { params: { category } }).then((r) => r.data),
  get: (id: UUID) => api.get<WorkoutDetailResponse>(`/workouts/${id}`).then((r) => r.data),
};

export const sessionsApi = {
  /** Empty body starts a free (no plan) session */
  start: (body: StartSessionRequest = {}) =>
      api.post<SessionResponse>("/sessions", body).then((r) => r.data),
  history: (params?: PageParams) =>
      api.get<PageResponse<SessionSummaryResponse>>("/sessions", { params }).then((r) => r.data),
  /** Returns null when no session is running */
  getActive: async (): Promise<SessionResponse | null> => {
    try {
      const { data } = await api.get<SessionResponse | "">("/sessions/active");
      return data || null;
    }  catch (e) {
      if (isApiError(e) && e.status === 404) return null;
      throw e;
    }
  },
  get: (id: UUID) => api.get<SessionResponse>(`/sessions/${id}`).then((r) => r.data),
  logSet: (id: UUID, body: LogSetRequest) =>
      api.post<SessionSetResponse>(`/sessions/${id}/sets`, body).then((r) => r.data),
  updateSet: (id: UUID, setId: UUID, body: UpdateSetRequest) =>
      api.put<SessionSetResponse>(`/sessions/${id}/sets/${setId}`, body).then((r) => r.data),
  deleteSet: (id: UUID, setId: UUID) =>
      api.delete<void>(`/sessions/${id}/sets/${setId}`).then(() => undefined),
  completeWarmup: (id: UUID) =>
      api.post<SessionResponse>(`/sessions/${id}/warmup/complete`).then((r) => r.data),
  finish: (id: UUID, body?: FinishSessionRequest) =>
      api.post<SessionResponse>(`/sessions/${id}/finish`, body).then((r) => r.data),
  cancel: (id: UUID) => api.post<void>(`/sessions/${id}/cancel`).then(() => undefined),
};

export const recordsApi = {
  list: () => api.get<ExerciseRecordResponse[]>("/records").then((r) => r.data),
  get: (exerciseId: UUID) =>
      api.get<ExerciseRecordResponse>(`/records/${exerciseId}`).then((r) => r.data),
};