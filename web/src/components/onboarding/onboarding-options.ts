import { ActivityLevel, EquipmentAccess, ExperienceLevel, Goal, Sex } from "@/types";

export type Opt<T> = { v: T; t: string; s: string };

export const SEX_OPTS: Opt<Sex>[] = [
    { v: Sex.MALE, t: "Male", s: "" },
    { v: Sex.FEMALE, t: "Female", s: "" },
];
export const GOAL_OPTS: Opt<Goal>[] = [
    { v: Goal.LOSE, t: "Lose weight", s: "A gentle calorie deficit" },
    { v: Goal.MAINTAIN, t: "Maintain weight", s: "Stay where you are" },
    { v: Goal.GAIN, t: "Build muscle", s: "A small surplus with more protein" },
];
export const ACTIVITY_OPTS: Opt<ActivityLevel>[] = [
    { v: ActivityLevel.SEDENTARY, t: "Mostly sitting", s: "Desk job, little exercise" },
    { v: ActivityLevel.LIGHT, t: "Lightly active", s: "Light exercise 1 to 3 days a week" },
    { v: ActivityLevel.MODERATE, t: "Moderately active", s: "Training 3 to 5 days a week" },
    { v: ActivityLevel.VERY_ACTIVE, t: "Very active", s: "Hard training 6 to 7 days a week" },
    { v: ActivityLevel.EXTRA_ACTIVE, t: "Extra active", s: "Physical job plus hard training" },
];
export const EXPERIENCE_OPTS: Opt<ExperienceLevel>[] = [
    { v: ExperienceLevel.BEGINNER, t: "Beginner", s: "New to lifting or coming back" },
    { v: ExperienceLevel.INTERMEDIATE, t: "Intermediate", s: "Training regularly for a year or more" },
    { v: ExperienceLevel.ADVANCED, t: "Advanced", s: "Several years of consistent training" },
];
export const EQUIPMENT_OPTS: Opt<EquipmentAccess>[] = [
    { v: EquipmentAccess.GYM, t: "Full gym", s: "Barbells, machines, cables" },
    { v: EquipmentAccess.HOME_BASIC, t: "Home, basic gear", s: "Dumbbells, bands, kettlebell" },
    { v: EquipmentAccess.NONE, t: "No equipment", s: "Bodyweight only" },
];
export const DAY_OPTS = [2, 3, 4, 5, 6];
export const PACES = [
    { kg: 0.25, t: "Gentle" },
    { kg: 0.5, t: "Steady" },
];

export type StepKey = "sex" | "goal" | "activity" | "training" | "body" | "pace";

export const TITLES: Record<StepKey, { q: string; sub: string }> = {
    sex: { q: "Who are we planning for?", sub: "This helps estimate how much energy you burn." },
    goal: { q: "What is your goal?", sub: "We use this to set your daily calories and macros." },
    activity: { q: "How active are you?", sub: "Think about a normal week." },
    training: { q: "How do you train?", sub: "We use this to build your workout plan." },
    body: { q: "Your body stats", sub: "Rough numbers are fine; you can change them later." },
    pace: { q: "Your target", sub: "Pick a goal weight and how fast to get there." },
};

/** The steps for a goal: "maintain" has no target step. */
export const stepsFor = (goal: Goal): StepKey[] =>
    goal === Goal.MAINTAIN
        ? ["sex", "goal", "activity", "training", "body"]
        : ["sex", "goal", "activity", "training", "body", "pace"];