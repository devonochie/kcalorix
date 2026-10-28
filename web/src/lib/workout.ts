import {Equipment, MuscleGroup, TrackingType, UnitSystem} from "@/types";
import type { ExerciseRecordResponse, PlanExerciseResponse, SessionSetResponse, UpdateSetRequest } from "@/types";
import { kgToLb, lbToKg, round1 } from "@/lib/units";

/* ---------- labels ---------- */

/** "UPPER_BACK" -> "Upper back" */
export const enumLabel = (v: string) => {
  const s = v.toLowerCase().replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const sessionTitle = (s: { planName: string | null; dayName: string | null }) =>
    s.planName ? (s.dayName ? `${s.planName} · ${s.dayName}` : s.planName) : "Quick workout";

/* ---------- media ---------- */

// Exercise media paths come from the backend (thumbnailPath / videoPath).
// Full URLs are used as they are. Relative paths are read from NEXT_PUBLIC_MEDIA_BASE_URL
// (default: the same origin, so a file in /public works).
const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "").replace(/\/$/, "");

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${MEDIA_BASE}/${path.replace(/^\//, "")}`;
}

/** YouTube link (watch, youtu.be or shorts) -> embed link, or null if it is not a YouTube link. */
export function youtubeEmbedUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const m = path.match(/(?:youtube\.com\/(?:shorts\/|embed\/|watch\?(?:.*&)?v=)|youtu\.be\/)([\w-]{11})/i);
  return m ? `https://www.youtube.com/embed/${m[1]}?playsinline=1&rel=0` : null;
}

/* ---------- time ---------- */

/** 75 -> "01:15", 3725 -> "1:02:05" */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor(s / 60) % 60).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** 2700 -> "45 min", 3900 -> "1 h 05 min" */
export function formatDuration(totalSeconds: number | null | undefined): string {
  if (!totalSeconds) return "—";
  const m = Math.round(totalSeconds / 60);
  if (m < 1) return `${totalSeconds} s`;
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`;
}

/** "1:30" -> 90, "90" -> 90, "1:00:00" -> 3600. Returns null when it is not a time. */
export function parseClock(text: string): number | null {
  const t = text.trim();
  if (!t) return null;
  const parts = t.split(":");
  if (parts.length > 3) return null;
  const nums = parts.map((p) => (/^\d+$/.test(p) ? Number(p) : NaN));
  if (nums.some((n) => Number.isNaN(n))) return null;
  return nums.reduce((acc, n) => acc * 60 + n, 0);
}

export function parseNum(text: string): number | null {
  const t = text.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/* ---------- tracking types ---------- */

export const needsReps = (t: TrackingType) => t === TrackingType.REPS_WEIGHT || t === TrackingType.REPS_ONLY;
export const needsWeight = (t: TrackingType) => t === TrackingType.REPS_WEIGHT;
export const needsDuration = (t: TrackingType) => t === TrackingType.DURATION || t === TrackingType.DISTANCE_DURATION;
export const needsDistance = (t: TrackingType) => t === TrackingType.DISTANCE_DURATION;

/** The exercise list does not include the tracking type, so guess it from a logged set. */
export function inferTrackingType(set: SessionSetResponse): TrackingType {
  if (set.distanceMeters != null) return TrackingType.DISTANCE_DURATION;
  if (set.durationSeconds != null) return TrackingType.DURATION;
  if (set.weightKg != null) return TrackingType.REPS_WEIGHT;
  return TrackingType.REPS_ONLY;
}

/* ---------- units (the backend always stores kg and metres) ---------- */

const r2 = (n: number) => Math.round(n * 100) / 100;
const M_PER_MI = 1609.344;
const imperial = (u: UnitSystem) => u === UnitSystem.IMPERIAL;

export const weightLabel = (u: UnitSystem) => (imperial(u) ? "lb" : "kg");
export const distanceLabel = (u: UnitSystem) => (imperial(u) ? "mi" : "km");
export const kgToDisplay = (kg: number, u: UnitSystem) => (imperial(u) ? round1(kgToLb(kg)) : r2(kg));
export const displayToKg = (v: number, u: UnitSystem) => r2(imperial(u) ? lbToKg(v) : v);
export const metersToDisplay = (m: number, u: UnitSystem) => r2(imperial(u) ? m / M_PER_MI : m / 1000);
export const displayToMeters = (v: number, u: UnitSystem) => Math.round(imperial(u) ? v * M_PER_MI : v * 1000);

/* ---------- set input ---------- */

export type SetDraft = { weight: string; reps: string; time: string; distance: string };
export const emptyDraft: SetDraft = { weight: "", reps: "", time: "", distance: "" };

export function draftFromSet(set: SessionSetResponse | null | undefined, u: UnitSystem): SetDraft {
  if (!set) return emptyDraft;
  return {
    weight: set.weightKg != null ? String(kgToDisplay(set.weightKg, u)) : "",
    reps: set.reps != null ? String(set.reps) : "",
    time: set.durationSeconds != null ? formatClock(set.durationSeconds) : "",
    distance: set.distanceMeters != null ? String(metersToDisplay(set.distanceMeters, u)) : "",
  };
}

/** Turns what the person typed into a request body, or an error message. */
export function parseSetDraft(
    t: TrackingType,
    d: SetDraft,
    u: UnitSystem,
): { body: UpdateSetRequest } | { error: string } {
  const body: UpdateSetRequest = {};
  if (needsReps(t)) {
    const reps = parseNum(d.reps);
    if (reps === null || !Number.isInteger(reps) || reps < 1 || reps > 200) {
      return { error: "Reps must be a whole number from 1 to 200." };
    }
    body.reps = reps;
  }
  if (needsWeight(t)) {
    const w = parseNum(d.weight);
    if (w === null || w < 0) return { error: `Enter the weight in ${weightLabel(u)} (0 for bodyweight).` };
    const kg = displayToKg(w, u);
    if (kg > 1000) return { error: "That weight is too high." };
    body.weightKg = kg;
  }
  if (needsDuration(t)) {
    const s = parseClock(d.time);
    if (s === null || s < 1 || s > 14400) return { error: "Time must be between 0:01 and 4:00:00 (mm:ss)." };
    body.durationSeconds = s;
  }
  if (needsDistance(t)) {
    const v = parseNum(d.distance);
    const m = v === null ? null : displayToMeters(v, u);
    if (m === null || m < 1 || m > 200000) return { error: `Enter the distance in ${distanceLabel(u)}.` };
    body.distanceMeters = m;
  }
  return { body };
}

/* ---------- text for sets, targets and records ---------- */

export function describeSet(s: SessionSetResponse, u: UnitSystem): string {
  const parts: string[] = [];
  if (s.reps != null && s.weightKg != null) parts.push(`${s.reps} × ${kgToDisplay(s.weightKg, u)} ${weightLabel(u)}`);
  else if (s.reps != null) parts.push(`${s.reps} reps`);
  if (s.distanceMeters != null) parts.push(`${metersToDisplay(s.distanceMeters, u)} ${distanceLabel(u)}`);
  if (s.durationSeconds != null) parts.push(formatClock(s.durationSeconds));
  return parts.join(" · ") || "—";
}

export const setVolumeKg = (s: SessionSetResponse) =>
    s.reps != null && s.weightKg != null ? s.reps * s.weightKg : 0;

export function targetText(pe: PlanExerciseResponse | null): string {
  if (!pe) return "Free";
  if (pe.targetDurationSeconds != null) return `${pe.targetSets} × ${formatClock(pe.targetDurationSeconds)}`;
  if (pe.targetRepsMin != null && pe.targetRepsMax != null) {
    return pe.targetRepsMin === pe.targetRepsMax
        ? `${pe.targetSets} × ${pe.targetRepsMin}`
        : `${pe.targetSets} × ${pe.targetRepsMin}–${pe.targetRepsMax}`;
  }
  return `${pe.targetSets} sets`;
}

/** Every record value the exercise has, as short lines. */
export function recordLines(r: ExerciseRecordResponse, u: UnitSystem): string[] {
  const out: string[] = [];
  if (r.bestWeightKg != null) out.push(`Best weight ${kgToDisplay(r.bestWeightKg, u)} ${weightLabel(u)}`);
  if (r.bestOneRepMaxKg != null) out.push(`Est. 1RM ${kgToDisplay(r.bestOneRepMaxKg, u)} ${weightLabel(u)}`);
  if (r.maxReps != null) out.push(`Max reps ${r.maxReps}`);
  if (r.longestDurationSeconds != null) out.push(`Longest time ${formatClock(r.longestDurationSeconds)}`);
  if (r.longestDistanceMeters != null) {
    out.push(`Longest distance ${metersToDisplay(r.longestDistanceMeters, u)} ${distanceLabel(u)}`);
  }
  return out;
}


/* ---------- rest ---------- */

const BIG_MUSCLES = new Set<MuscleGroup>([
  MuscleGroup.QUADS, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES, MuscleGroup.CHEST,
  MuscleGroup.UPPER_BACK, MuscleGroup.LATS, MuscleGroup.LOWER_BACK, MuscleGroup.FULL_BODY,
]);

/** Rest (seconds) used when the plan gives none: heavy compounds rest longest, bodyweight and timed work shortest. */
export function defaultRestSeconds(ex: { trackingType: TrackingType; equipment: Equipment; primaryMuscle: MuscleGroup }): number {
  if (ex.trackingType === TrackingType.DURATION || ex.trackingType === TrackingType.DISTANCE_DURATION) return 45;
  if (ex.trackingType === TrackingType.REPS_ONLY) return 60;
  const heavyTool = ex.equipment === Equipment.BARBELL || ex.equipment === Equipment.KETTLEBELL;
  if (heavyTool && BIG_MUSCLES.has(ex.primaryMuscle)) return 150;
  if (BIG_MUSCLES.has(ex.primaryMuscle)) return 90;
  return 60;
}