"use client";

import { UnitSystem } from "@/types";
import { fieldCls, labelCls, errorCls } from "@/components/ui/classes";
import { weightUnit } from "@/lib/units";

/** Metric / Imperial switch with a pill that slides to the chosen side. */
export function UnitToggle({ value, onChange }: { value: UnitSystem; onChange: (u: UnitSystem) => void }) {
  const imperial = value === UnitSystem.IMPERIAL;
  return (
      <div className="relative inline-grid grid-cols-2 rounded-full border bg-card p-1 text-xs uppercase tracking-widest">
      <span
          aria-hidden
          className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary shadow transition-transform duration-300 ease-out ${imperial ? "translate-x-full" : "translate-x-0"}`}
      />
        {[UnitSystem.METRIC, UnitSystem.IMPERIAL].map((u) => (
            <button
                key={u}
                type="button"
                onClick={() => onChange(u)}
                aria-pressed={value === u}
                className={`relative z-10 rounded-full px-4 py-2 transition-colors duration-300 ${value === u ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {u === UnitSystem.METRIC ? "Metric" : "Imperial"}
            </button>
        ))}
      </div>
  );
}

export function HeightInput({
                              units,
                              height,
                              heightIn,
                              onChange,
                              error,
                            }: {
  units: UnitSystem;
  height: string;
  heightIn: string;
  onChange: (v: { height?: string; heightIn?: string }) => void;
  error?: string;
}) {
  const imperial = units === UnitSystem.IMPERIAL;
  return (
      <label className="block">
        <span className={labelCls}>{imperial ? "Height (ft / in)" : "Height (cm)"}</span>
        {imperial ? (
            <div className="grid grid-cols-2 gap-2">
              <input
                  inputMode="numeric"
                  aria-label="Feet"
                  placeholder="ft"
                  value={height}
                  onChange={(e) => onChange({ height: e.target.value })}
                  className={fieldCls}
              />
              <input
                  inputMode="numeric"
                  aria-label="Inches"
                  placeholder="in"
                  value={heightIn}
                  onChange={(e) => onChange({ heightIn: e.target.value })}
                  className={fieldCls}
              />
            </div>
        ) : (
            <input inputMode="decimal" value={height} onChange={(e) => onChange({ height: e.target.value })} className={fieldCls} />
        )}
        {error && <p className={errorCls}>{error}</p>}
      </label>
  );
}

export function WeightInput({
                              label,
                              units,
                              value,
                              onChange,
                              error,
                            }: {
  label: string;
  units: UnitSystem;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
      <label className="block">
      <span className={labelCls}>
        {label} ({weightUnit(units)})
      </span>
        <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className={fieldCls} />
        {error && <p className={errorCls}>{error}</p>}
      </label>
  );
}