import { ACTIVITY_FACTOR, ActivityLevel, Goal, Sex } from "@/types";

export interface TargetEstimate {
  calorieTarget: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  notes: string[];
}

/**
 * Live preview used while answering onboarding questions.
 * It follows the same formula as the backend's TargetCalculator,
 * so the saved numbers (GET /insights/targets) should match.
 */
export function estimateTargets(i: {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: ActivityLevel;
  goal: Goal;
  weeklyRateKg: number | null;
}): TargetEstimate {
  const notes: string[] = [];
  const bmr = 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age + (i.sex === Sex.MALE ? 5 : -161);
  const tdee = bmr * ACTIVITY_FACTOR[i.activity];
  const delta = i.goal === Goal.MAINTAIN || i.weeklyRateKg == null ? 0 : (i.weeklyRateKg * 7700) / 7;

  let target = tdee;
  if (i.goal === Goal.LOSE) {
    target = tdee - delta;
    const floor = Math.max(i.sex === Sex.MALE ? 1500 : 1200, 0.75 * tdee);
    if (target < floor) {
      target = floor;
      notes.push("Pace too aggressive: target raised to a safe minimum");
    }
  } else if (i.goal === Goal.GAIN) {
    target = tdee + delta;
    const cap = 1.2 * tdee;
    if (target > cap) {
      target = cap;
      notes.push("Surplus capped at 20% above maintenance");
    }
  }

  const proteinPerKg = i.goal === Goal.LOSE ? 2.0 : i.goal === Goal.MAINTAIN ? 1.6 : 1.8;
  const proteinG = i.weightKg * proteinPerKg;
  const fatKcal = 0.25 * target;
  const fatG = fatKcal / 9;
  let carbsG = (target - proteinG * 4 - fatKcal) / 4;
  if (carbsG < 0) {
    carbsG = 0;
    notes.push("Protein alone covers your calorie target");
  }

  return {
    calorieTarget: Math.round(target),
    proteinG: Math.round(proteinG),
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG),
    notes,
  };
}
