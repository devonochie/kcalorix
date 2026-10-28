import { UnitSystem } from "@/types";

const KG_PER_LB = 0.45359237;

export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const lbToKg = (lb: number) => lb * KG_PER_LB;
export const inchesToCm = (inches: number) => inches * 2.54;
export const round1 = (n: number) => Math.round(n * 10) / 10;

export function cmToFeetInches(cm: number) {
  const total = Math.round(cm / 2.54);
  return { feet: Math.floor(total / 12), inches: total % 12 };
}

export const weightUnit = (u: UnitSystem) => (u === UnitSystem.IMPERIAL ? "lb" : "kg");

/** "0.5 kg" or "1.1 lb" for a weight stored in kg. */
export function formatWeight(kg: number, u: UnitSystem) {
  return u === UnitSystem.IMPERIAL ? `${round1(kgToLb(kg))} lb` : `${round1(kg)} kg`;
}
