"use client";

import { useState, type FormEvent } from "react";
import { errorCls, labelCls } from "@/components/ui/classes";
import {
  distanceLabel, needsDistance, needsDuration, needsReps, needsWeight, parseSetDraft, weightLabel,
  type SetDraft,
} from "@/lib/workout";
import type { TrackingType, UnitSystem, UpdateSetRequest } from "@/types";

const box =
    "w-full rounded-sm border bg-background py-3 text-center font-bold outline-none focus:border-primary";

/**
 * Inputs for one set. Which fields show depends on the exercise tracking type:
 * REPS_WEIGHT -> weight + reps, REPS_ONLY -> reps, DURATION -> time, DISTANCE_DURATION -> distance + time.
 * Remount it (change its `key`) to reset the fields.
 */
export function SetForm({
                          tracking, units, initial, submitLabel, busy, error, onSubmit,
                        }: {
  tracking: TrackingType;
  units: UnitSystem;
  initial: SetDraft;
  submitLabel: string;
  busy: boolean;
  error?: string | null;
  onSubmit: (body: UpdateSetRequest) => void;
}) {
  const [d, setD] = useState<SetDraft>(initial);
  const [localError, setLocalError] = useState<string | null>(null);
  const patch = (p: Partial<SetDraft>) => setD((x) => ({ ...x, ...p }));

  function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const r = parseSetDraft(tracking, d, units);
    if ("error" in r) {
      setLocalError(r.error);
      return;
    }
    setLocalError(null);
    onSubmit(r.body);
  }

  const shown = localError ?? error ?? null;

  return (
      <form onSubmit={submit} noValidate>
        <div className="flex flex-wrap items-end gap-3">
          {needsWeight(tracking) && (
              <label className="min-w-[5rem] flex-1">
                <span className={labelCls}>{weightLabel(units)}</span>
                <input value={d.weight} onChange={(e) => patch({ weight: e.target.value })} inputMode="decimal" className={box} />
              </label>
          )}
          {needsReps(tracking) && (
              <label className="min-w-[5rem] flex-1">
                <span className={labelCls}>Reps</span>
                <input value={d.reps} onChange={(e) => patch({ reps: e.target.value })} inputMode="numeric" className={box} />
              </label>
          )}
          {needsDistance(tracking) && (
              <label className="min-w-[5rem] flex-1">
                <span className={labelCls}>{distanceLabel(units)}</span>
                <input value={d.distance} onChange={(e) => patch({ distance: e.target.value })} inputMode="decimal" className={box} />
              </label>
          )}
          {needsDuration(tracking) && (
              <label className="min-w-[6rem] flex-1">
                <span className={labelCls}>Time (mm:ss)</span>
                <input value={d.time} onChange={(e) => patch({ time: e.target.value })} placeholder="00:45" className={box} />
              </label>
          )}
          <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-primary px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-transform enabled:active:scale-95 disabled:opacity-60"
          >
            {busy ? "Saving…" : submitLabel}
          </button>
        </div>
        {shown && <p role="alert" className={errorCls}>{shown}</p>}
      </form>
  );
}