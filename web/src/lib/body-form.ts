import { Goal, UnitSystem } from "@/types";
import { cmToFeetInches, inchesToCm, kgToLb, lbToKg, round1 } from "./units";

/**
 * Body measurements as the person types them (strings), in their chosen units.
 * metric:   height = cm,   weight = kg
 * imperial: height = feet, heightIn = inches, weight = lb
 */
export interface BodyForm {
  units: UnitSystem;
  birthDate: string; // yyyy-mm-dd
  height: string;
  heightIn: string;
  weight: string;
  targetWeight: string;
}

export const emptyBodyForm = (units: UnitSystem = UnitSystem.METRIC): BodyForm => ({
  units,
  birthDate: "",
  height: "",
  heightIn: "",
  weight: "",
  targetWeight: "",
});

const num = (s: string) => {
  const t = s.trim().replace(",", ".");
  const n = Number(t);
  return t !== "" && Number.isFinite(n) ? n : NaN;
};

/** Convert what was typed into the metric numbers the backend wants (NaN when empty or invalid). */
export function toMetric(f: BodyForm) {
  const imperial = f.units === UnitSystem.IMPERIAL;
  const inches = f.heightIn.trim() === "" ? 0 : num(f.heightIn);
  const heightCm = imperial ? inchesToCm(num(f.height) * 12 + inches) : num(f.height);
  const weightKg = imperial ? lbToKg(num(f.weight)) : num(f.weight);
  const targetWeightKg = imperial ? lbToKg(num(f.targetWeight)) : num(f.targetWeight);
  return { heightCm: round1(heightCm), weightKg: round1(weightKg), targetWeightKg: round1(targetWeightKg) };
}

const show = (n: number) => (Number.isFinite(n) ? String(n) : "");

/** Build form strings from metric numbers (used to fill the profile form). */
export function fromMetric(
  units: UnitSystem,
  v: { birthDate: string; heightCm: number; weightKg: number; targetWeightKg: number },
): BodyForm {
  if (units === UnitSystem.IMPERIAL) {
    const { feet, inches } = Number.isFinite(v.heightCm) ? cmToFeetInches(v.heightCm) : { feet: NaN, inches: NaN };
    return {
      units,
      birthDate: v.birthDate,
      height: show(feet),
      heightIn: show(inches),
      weight: show(round1(kgToLb(v.weightKg))),
      targetWeight: show(round1(kgToLb(v.targetWeightKg))),
    };
  }
  return {
    units,
    birthDate: v.birthDate,
    height: show(round1(v.heightCm)),
    heightIn: "",
    weight: show(round1(v.weightKg)),
    targetWeight: show(round1(v.targetWeightKg)),
  };
}

/** Change units and convert the numbers already typed. */
export function switchUnits(f: BodyForm, to: UnitSystem): BodyForm {
  if (f.units === to) return f;
  return fromMetric(to, { birthDate: f.birthDate, ...toMetric(f) });
}

/** yyyy-mm-dd in the browser's own time zone (for date input limits). */
export function toIsoDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function ageFromBirthDate(iso: string, today: Date | null): number | null {
  if (!today) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const check = new Date(y, mo - 1, d);
  if (check.getFullYear() !== y || check.getMonth() !== mo - 1 || check.getDate() !== d) return null;
  let age = today.getFullYear() - y;
  const monthDiff = today.getMonth() + 1 - mo;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) age--;
  return age;
}

export type BodyErrors = Partial<Record<"birthDate" | "height" | "weight" | "targetWeight", string>>;

/** Same limits as the backend: age 18-100, height 100-250 cm, weight 30-300 kg. */
export function validateBody(f: BodyForm, today: Date | null): BodyErrors {
  const errors: BodyErrors = {};
  const age = ageFromBirthDate(f.birthDate, today);
  if (age === null) errors.birthDate = "Enter your date of birth.";
  else if (age < 18 || age > 100) errors.birthDate = "You must be between 18 and 100.";

  const { heightCm, weightKg } = toMetric(f);
  if (!(heightCm >= 100 && heightCm <= 250)) {
    errors.height = f.units === UnitSystem.IMPERIAL ? "Enter a height between 3 ft 4 in and 8 ft 2 in." : "Height must be 100 to 250 cm.";
  }
  if (!(weightKg >= 30 && weightKg <= 300)) {
    errors.weight = f.units === UnitSystem.IMPERIAL ? "Weight must be 67 to 661 lb." : "Weight must be 30 to 300 kg.";
  }
  return errors;
}

/** Target weight rules: in range, and on the right side of current weight for the goal. */
export function validateTarget(f: BodyForm, goal: Goal): BodyErrors {
  const errors: BodyErrors = {};
  const { weightKg, targetWeightKg } = toMetric(f);
  if (!(targetWeightKg >= 30 && targetWeightKg <= 300)) {
    errors.targetWeight = f.units === UnitSystem.IMPERIAL ? "Target must be 67 to 661 lb." : "Target must be 30 to 300 kg.";
  } else if (goal === Goal.LOSE && targetWeightKg >= weightKg) {
    errors.targetWeight = "Target weight must be below your current weight to lose weight.";
  } else if (goal === Goal.GAIN && targetWeightKg <= weightKg) {
    errors.targetWeight = "Target weight must be above your current weight to gain weight.";
  }
  return errors;
}
