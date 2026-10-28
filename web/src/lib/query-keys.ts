import type {
  ExerciseListParams,
  FoodSearchParams,
  NotificationListParams,
  WeightLogParams,
  WorkoutCategory,
} from "@/types";

/** Every useQuery in the app takes its key from here. */
export const keys = {
  me: ["me"] as const,
  profile: ["profile"] as const,
  targets: ["targets"] as const,

  diary: (date: string) => ["diary", date] as const,
  balance: (date: string) => ["balance", date] as const,
  trends: (days: number, end?: string) => ["trends", days, end ?? "today"] as const,

  foods: {
    search: (params: FoodSearchParams) => ["foods", "search", params] as const,
    detail: (fdcId: number) => ["foods", "detail", fdcId] as const,
  },

  exercises: {
    list: (params: ExerciseListParams) => ["exercises", "list", params] as const,
    meta: ["exercises", "meta"] as const,
    recommended: ["exercises", "recommended"] as const,
    detail: (slug: string) => ["exercises", "detail", slug] as const,
  },

  plans: {
    list: ["plans", "list"] as const,
    detail: (id: string) => ["plans", "detail", id] as const,
  },

  workouts: {
    list: (category?: WorkoutCategory) => ["workouts", "list", category ?? "all"] as const,
    detail: (id: string) => ["workouts", "detail", id] as const,
  },

  sessions: {
    active: ["sessions", "active"] as const,
    history: (page: number) => ["sessions", "history", page] as const,
    detail: (id: string) => ["sessions", "detail", id] as const,
  },

  records: ["records"] as const,

  notifications: {
    list: (params: NotificationListParams) => ["notifications", "list", params] as const,
    unreadCount: ["notifications", "unread-count"] as const,
    prefs: ["notifications", "prefs"] as const,
  },

  weightLogs: (params: WeightLogParams) => ["weight-logs", params] as const,
};