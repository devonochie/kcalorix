// Mirrors the Java enums in the Kcalorix backend (serialized as strings).

export enum Role { USER = "USER", ADMIN = "ADMIN" }
export enum Sex { MALE = "MALE", FEMALE = "FEMALE" }
export enum Goal { LOSE = "LOSE", MAINTAIN = "MAINTAIN", GAIN = "GAIN" }
export enum UnitSystem { METRIC = "METRIC", IMPERIAL = "IMPERIAL" }

export enum ActivityLevel {
  SEDENTARY = "SEDENTARY",
  LIGHT = "LIGHT",
  MODERATE = "MODERATE",
  VERY_ACTIVE = "VERY_ACTIVE",
  EXTRA_ACTIVE = "EXTRA_ACTIVE",
}

/** Multipliers used by the backend (ActivityLevel.getFactor()). */
export const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  [ActivityLevel.SEDENTARY]: 1.2,
  [ActivityLevel.LIGHT]: 1.375,
  [ActivityLevel.MODERATE]: 1.55,
  [ActivityLevel.VERY_ACTIVE]: 1.725,
  [ActivityLevel.EXTRA_ACTIVE]: 1.9,
};

export enum MealType {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  SNACK = "SNACK",
}

export enum Difficulty {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export enum Equipment {
  BODYWEIGHT = "BODYWEIGHT",
  DUMBBELL = "DUMBBELL",
  BARBELL = "BARBELL",
  KETTLEBELL = "KETTLEBELL",
  MACHINE = "MACHINE",
  CABLE = "CABLE",
  BAND = "BAND",
  OTHER = "OTHER",
}

export enum ExerciseCategory {
  STRENGTH = "STRENGTH",
  CARDIO = "CARDIO",
  FLEXIBILITY = "FLEXIBILITY",
  WARMUP = "WARMUP",
}

export enum MuscleGroup {
  CHEST = "CHEST",
  UPPER_BACK = "UPPER_BACK",
  LATS = "LATS",
  LOWER_BACK = "LOWER_BACK",
  SHOULDERS = "SHOULDERS",
  TRAPS = "TRAPS",
  BICEPS = "BICEPS",
  TRICEPS = "TRICEPS",
  FOREARMS = "FOREARMS",
  ABS = "ABS",
  OBLIQUES = "OBLIQUES",
  QUADS = "QUADS",
  HAMSTRINGS = "HAMSTRINGS",
  GLUTES = "GLUTES",
  CALVES = "CALVES",
  ADDUCTORS = "ADDUCTORS",
  FULL_BODY = "FULL_BODY",
}

export enum SessionStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum TrackingType {
  REPS_WEIGHT = "REPS_WEIGHT",
  REPS_ONLY = "REPS_ONLY",
  DURATION = "DURATION",
  DISTANCE_DURATION = "DISTANCE_DURATION",
}

export enum NotificationType { DAILY_BALANCE = "DAILY_BALANCE" }
export enum RecommendationType {
  EAT_MORE = "EAT_MORE",
  ON_TARGET = "ON_TARGET",
  BURN_OFF = "BURN_OFF",
}
export enum AuthTokenType {
  PASSWORD_RESET = "PASSWORD_RESET",
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
}

export enum ExperienceLevel {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export enum EquipmentAccess {
  GYM = "GYM",
  HOME_BASIC = "HOME_BASIC",
  NONE = "NONE",
}

export enum WorkoutCategory {
  FULL_BODY = "FULL_BODY",
  CHEST = "CHEST",
  BACK = "BACK",
  SHOULDERS = "SHOULDERS",
  ARMS = "ARMS",
  LEGS = "LEGS",
  GLUTES = "GLUTES",
  ABS_CORE = "ABS_CORE",
  CARDIO_HIIT = "CARDIO_HIIT",
}