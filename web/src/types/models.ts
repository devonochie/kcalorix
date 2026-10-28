// Request/response shapes for the Kcalorix API.
// Type mapping: UUID -> string, BigDecimal -> number,
// LocalDate -> "YYYY-MM-DD", LocalTime -> "HH:mm:ss", Instant -> ISO-8601 string.

import {
  ActivityLevel, Difficulty, Equipment, EquipmentAccess, ExerciseCategory, ExperienceLevel, Goal, MealType,
  MuscleGroup, NotificationType, RecommendationType, Role, SessionStatus,
  Sex, TrackingType, UnitSystem, WorkoutCategory,
} from "./enums";

export type UUID = string;
export type LocalDate = string;
export type LocalTime = string;
export type Instant = string;

/* ---------- common ---------- */
export interface ApiError {
  timestamp: Instant;
  status: number;
  code: string;
  message: string;
  path: string;
  fieldErrors: Record<string, string> | null;
}
export interface MessageResponse { message: string }
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export interface PageParams { page?: number; size?: number }

/* ---------- auth ---------- */
export interface RegisterRequest { email: string; password: string; displayName: string }
export interface LoginRequest { email: string; password: string }
export interface VerifyEmailRequest { token: string }
export interface ForgotPasswordRequest { email: string }
export interface ResetPasswordRequest { token: string; newPassword: string }
export interface UserResponse {
  id: UUID;
  email: string;
  displayName: string;
  role: Role;
  onboardingCompleted: boolean;
  emailVerified: boolean;
}

/* ---------- account / profile / weight ---------- */
export interface DeleteAccountRequest { password: string }

export interface ProfileRequest {
  displayName: string;
  sex: Sex;
  birthDate: LocalDate;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  weeklyRateKg?: number | null; // 0.1 - 1.0
  unitSystem: UnitSystem;
  timezone: string;
  experienceLevel: ExperienceLevel;
  daysPerWeek: number; // 2 - 6
  equipmentAccess: EquipmentAccess;
}
// Older accounts have no training preferences until they save their profile once.
export interface ProfileResponse
    extends Omit<ProfileRequest, "weeklyRateKg" | "experienceLevel" | "daysPerWeek" | "equipmentAccess"> {
  weeklyRateKg: number | null;
  experienceLevel: ExperienceLevel | null;
  daysPerWeek: number | null;
  equipmentAccess: EquipmentAccess | null;
  onboardingCompleted: boolean;
}

export interface WeightLogRequest { date: LocalDate; weightKg: number }
export interface WeightLogResponse { date: LocalDate; weightKg: number }
export interface WeightLogParams { from?: LocalDate; to?: LocalDate }

export interface UserDataExport {
  exportedAt: Instant;
  account: { email: string; displayName: string; emailVerified: boolean; createdAt: Instant };
  profile: {
    sex: string; birthDate: LocalDate; heightCm: number; weightKg: number;
    targetWeightKg: number; activityLevel: string; goal: string;
    weeklyRateKg: number | null; unitSystem: string; timezone: string;
  };
  weightLogs: { date: LocalDate; weightKg: number }[];
  meals: {
    date: LocalDate; mealType: string; food: string; brand: string | null;
    grams: number; kcal: number; proteinG: number; carbsG: number; fatG: number;
  }[];
  workoutPlans: {
    name: string; description: string | null; active: boolean;
    days: {
      name: string; order: number;
      exercises: {
        exercise: string; sets: number; repsMin: number | null; repsMax: number | null;
        durationSeconds: number | null; restSeconds: number; notes: string | null;
      }[];
    }[];
  }[];
  workoutSessions: {
    plan: string | null; day: string | null; status: string; startedAt: Instant;
    endedAt: Instant | null; durationSeconds: number | null; bodyWeightKg: number | null;
    caloriesBurned: number | null; notes: string | null;
    sets: {
      exercise: string; setNumber: number; reps: number | null; weightKg: number | null;
      durationSeconds: number | null; distanceMeters: number | null; loggedAt: Instant;
    }[];
  }[];
  notificationPreferences: { enabled: boolean; nudgeTime: LocalTime };
  notifications: {
    type: string; title: string; message: string; forDate: LocalDate | null;
    createdAt: Instant; readAt: Instant | null;
  }[];
}

/* ---------- nutrition ---------- */
export interface FoodSearchParams { query?: string; page?: number; includeBranded?: boolean }
export interface FoodSearchItem {
  fdcId: number; description: string; brand: string | null; dataType: string;
  kcal: number; proteinG: number; carbsG: number; fatG: number;
}
export interface FoodPortionResponse { label: string; gramWeight: number }
export interface FoodDetailResponse {
  fdcId: number; description: string; brand: string | null; dataType: string;
  kcal: number; proteinG: number; carbsG: number; fatG: number;
  fiberG: number; sugarG: number; sodiumMg: number;
  portions: FoodPortionResponse[];
}

export interface NutrientTotals { kcal: number; proteinG: number; carbsG: number; fatG: number }
export interface MealEntryResponse {
  id: UUID; date: LocalDate; mealType: MealType; fdcId: number;
  foodName: string; brand: string | null; grams: number;
  kcal: number; proteinG: number; carbsG: number; fatG: number;
}
export interface MealGroupResponse {
  mealType: MealType; totals: NutrientTotals; entries: MealEntryResponse[];
}
export interface DiaryResponse { date: LocalDate; totals: NutrientTotals; meals: MealGroupResponse[] }

export interface AddMealEntryRequest {
  date: LocalDate; mealType: MealType; fdcId: number; grams: number; // grams 1-5000
}
export interface UpdateMealEntryRequest { mealType: MealType; grams: number }
export interface BatchMealItem { fdcId: number; grams: number }
export interface AddMealBatchRequest {
  date: LocalDate; mealType: MealType; items: BatchMealItem[]; // max 10
}

export interface RecognizedItem {
  name: string; estimatedGrams: number; confidence: string; matches: FoodSearchItem[];
}
export interface RecognitionResponse { items: RecognizedItem[] }

/* ---------- workout: exercises ---------- */
export interface ExerciseListParams extends PageParams {
  muscle?: MuscleGroup;
  category?: ExerciseCategory;
  equipment?: Equipment;
  difficulty?: Difficulty;
  q?: string;
}
export interface ExerciseSummaryResponse {
  id: UUID; slug: string; name: string; category: ExerciseCategory;
  primaryMuscle: MuscleGroup; equipment: Equipment; difficulty: Difficulty;
  thumbnailPath: string | null; hasAnimation: boolean;
}
export interface RecommendedExerciseResponse { exercise: ExerciseSummaryResponse; reason: string }
export interface RecommendationsResponse {
  goal: Goal; headline: string; items: RecommendedExerciseResponse[];
}
export interface ExerciseDetailResponse {
  id: UUID; slug: string; name: string; description: string;
  category: ExerciseCategory; trackingType: TrackingType;
  primaryMuscle: MuscleGroup; secondaryMuscles: MuscleGroup[];
  equipment: Equipment; difficulty: Difficulty; metValue: number;
  steps: string[]; tips: string[]; commonMistakes: string[];
  videoPath: string | null; thumbnailPath: string | null; animationKey: string | null;
}
export interface ExerciseMetaResponse {
  categories: string[]; muscles: string[]; equipment: string[]; difficulties: string[];
}

/* ---------- workout: plans ---------- */
export interface PlanExerciseRequest {
  exerciseId: UUID;
  targetSets: number;                 // 1-10
  targetRepsMin?: number | null;      // 1-100
  targetRepsMax?: number | null;      // 1-100
  targetDurationSeconds?: number | null; // 5-7200
  restSeconds?: number | null;        // 0-600
  notes?: string | null;              // max 300
}
export interface PlanDayRequest { name: string; exercises: PlanExerciseRequest[] } // max 30
export interface PlanRequest {
  name: string; description?: string | null; days: PlanDayRequest[]; // max 14
}
export interface PlanExerciseResponse {
  id: UUID; exercise: ExerciseSummaryResponse; position: number; targetSets: number;
  targetRepsMin: number | null; targetRepsMax: number | null;
  targetDurationSeconds: number | null; restSeconds: number; notes: string | null;
}
export interface PlanDayResponse {
  id: UUID; name: string; dayOrder: number; exercises: PlanExerciseResponse[];
}
export interface PlanResponse {
  id: UUID; name: string; description: string | null;
  days: PlanDayResponse[]; createdAt: Instant;
}

export interface WorkoutSummaryResponse {
  id: UUID; dayId: UUID; slug: string; name: string; description: string | null;
  category: WorkoutCategory; level: Difficulty; estimatedMinutes: number; exerciseCount: number;
}
export interface WorkoutDetailResponse {
  workout: WorkoutSummaryResponse; exercises: PlanExerciseResponse[];
}
export interface PlanSummaryResponse {
  id: UUID; name: string; description: string | null; dayCount: number; createdAt: Instant;
}

/* ---------- workout: sessions & records ---------- */
export interface StartSessionRequest { planId?: UUID | null; dayId?: UUID | null }
export interface LogSetRequest {
  exerciseId: UUID;
  reps?: number | null;             // 1-200
  weightKg?: number | null;         // 0-1000
  durationSeconds?: number | null;  // 1-14400
  distanceMeters?: number | null;   // 1-200000
}
export type UpdateSetRequest = Omit<LogSetRequest, "exerciseId">;
export interface FinishSessionRequest { notes?: string | null } // max 500

export interface SessionSetResponse {
  id: UUID; exerciseId: UUID; exerciseName: string; setNumber: number;
  reps: number | null; weightKg: number | null; durationSeconds: number | null;
  distanceMeters: number | null; loggedAt: Instant;
}
export interface SessionResponse {
  id: UUID; planId: UUID | null; planName: string | null; dayName: string | null;
  status: SessionStatus; startedAt: Instant; warmupCompletedAt: Instant | null; endedAt: Instant | null;
  durationSeconds: number | null; weightKgSnapshot: number | null;
  caloriesBurned: number | null; notes: string | null; sets: SessionSetResponse[];
}
export interface SessionSummaryResponse {
  id: UUID; planName: string | null; dayName: string | null; startedAt: Instant;
  durationSeconds: number | null; caloriesBurned: number | null; setCount: number;
}
export interface ExerciseRecordResponse {
  exerciseId: UUID; exerciseName: string; trackingType: TrackingType;
  bestWeightKg: number | null; bestOneRepMaxKg: number | null; maxReps: number | null;
  longestDurationSeconds: number | null; longestDistanceMeters: number | null;
}

/* ---------- insights ---------- */
export interface TargetsResponse {
  bmr: number; tdee: number; calorieTarget: number;
  proteinG: number; carbsG: number; fatG: number;
  weeklyRateKg: number | null; notes: string[];
}
export interface MacroProgress { consumedG: number; targetG: number }
export interface Recommendation { type: RecommendationType; kcal: number; message: string }
export interface DailyBalanceResponse {
  date: LocalDate; calorieTarget: number; eatenKcal: number; burnedKcal: number;
  creditedBurnKcal: number; netKcal: number; remainingKcal: number;
  workoutsCompleted: number; protein: MacroProgress; carbs: MacroProgress;
  fat: MacroProgress; recommendation: Recommendation;
}
export interface DayTrend {
  date: LocalDate; eatenKcal: number; burnedKcal: number; workoutsCompleted: number;
}
export interface TrendsParams { days?: number; end?: LocalDate }
export interface TrendsResponse {
  from: LocalDate; to: LocalDate; calorieTarget: number; days: DayTrend[];
  daysLogged: number; avgEatenKcal: number; avgBurnedKcal: number;
  weights: WeightLogResponse[]; weightChangeKg: number | null;
}

/* ---------- notifications ---------- */
export interface NotificationListParams extends PageParams { unreadOnly?: boolean }
export interface NotificationResponse {
  id: UUID; type: NotificationType; title: string; message: string;
  forDate: LocalDate | null; createdAt: Instant; read: boolean;
}
export interface PreferencesResponse { enabled: boolean; nudgeTime: LocalTime }
export interface UpdatePreferencesRequest { enabled: boolean; nudgeTime: LocalTime }
export interface UnreadCountResponse { count: number }