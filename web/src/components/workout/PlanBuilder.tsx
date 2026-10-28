"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { PageHeader } from "@/components/shell/AppShell";
import { ExercisePicker } from "./ExercisePicker";
import { DayCard } from "./plan/DayCard";
import { MAX_DAYS, MAX_EXERCISES, fromPlan, newDay, newRow, toRequest, validate } from "./plan/plan-form";
import type { DayRow, ExRow } from "./plan/plan-form";
import { useSavePlan } from "@/hooks/use-workout";
import { errorMessage, fieldErrors } from "@/lib/errors";
import { cardCls, fieldCls, labelCls, pillBtnCls, pillPrimaryCls } from "@/components/ui/classes";
import type { ExerciseDetailResponse, PlanResponse } from "@/types";

export function PlanBuilder({ plan }: { plan?: PlanResponse }) {
  const router = useRouter();
  const save = useSavePlan(plan?.id);

  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [days, setDays] = useState<DayRow[]>(() => fromPlan(plan));
  const [pickDay, setPickDay] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const patchDay = (key: string, fn: (d: DayRow) => DayRow) =>
      setDays((all) => all.map((d) => (d.key === key ? fn(d) : d)));
  const patchEx = (dayKey: string, exKey: string, p: Partial<ExRow>) =>
      patchDay(dayKey, (d) => ({ ...d, exercises: d.exercises.map((e) => (e.key === exKey ? { ...e, ...p } : e)) }));

  function moveEx(dayKey: string, index: number, dir: -1 | 1) {
    patchDay(dayKey, (d) => {
      const to = index + dir;
      if (to < 0 || to >= d.exercises.length) return d;
      const next = [...d.exercises];
      [next[index], next[to]] = [next[to]!, next[index]!];
      return { ...d, exercises: next };
    });
  }

  function addExercise(ex: ExerciseDetailResponse) {
    if (!pickDay) return;
    const day = days.find((d) => d.key === pickDay);
    if (day && day.exercises.length >= MAX_EXERCISES) {
      setFormError(`A day can have at most ${MAX_EXERCISES} exercises.`);
      return;
    }
    setFormError(null);
    patchDay(pickDay, (d) => ({ ...d, exercises: [...d.exercises, newRow(ex)] }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (save.isPending) return;
    const problem = validate(name, days);
    setFormError(problem);
    if (problem) return;
    save.mutate(toRequest(name, description, days), { onSuccess: () => router.push("/workouts/my-plans") });
  }

  const serverFields = Object.entries(fieldErrors(save.error));

  return (
      <div>
        <PageHeader kicker="My plans" title={plan ? "Edit plan" : "New plan"} />
        <Link href="/workouts/my-plans" className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to plans
        </Link>

        <form onSubmit={submit} noValidate className="relative mt-6 max-w-3xl space-y-5">
          <section className={cardCls}>
            <label className="block">
              <span className={labelCls}>Plan name</span>
              <input className={fieldCls} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="Push / pull / legs" />
            </label>
            <label className="mt-4 block">
              <span className={labelCls}>Description (optional)</span>
              <textarea className={fieldCls} rows={2} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
          </section>

          <AnimatePresence initial={false} mode="popLayout">
            {days.map((d, di) => (
                <motion.div
                    key={d.key}
                    layout="position"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <DayCard
                      day={d}
                      index={di}
                      canRemove={days.length > 1}
                      onRename={(n) => patchDay(d.key, (x) => ({ ...x, name: n }))}
                      onRemove={() => setDays((all) => all.filter((x) => x.key !== d.key))}
                      onAddExercise={() => setPickDay(d.key)}
                      onChangeExercise={(exKey, patch) => patchEx(d.key, exKey, patch)}
                      onMoveExercise={(index, dir) => moveEx(d.key, index, dir)}
                      onRemoveExercise={(exKey) =>
                          patchDay(d.key, (x) => ({ ...x, exercises: x.exercises.filter((y) => y.key !== exKey) }))
                      }
                  />
                </motion.div>
            ))}
          </AnimatePresence>

          <button
              type="button"
              disabled={days.length >= MAX_DAYS}
              onClick={() => setDays((all) => [...all, newDay(`Day ${all.length + 1}`)])}
              className={`${pillBtnCls} flex items-center gap-2`}
          >
            <Plus className="h-4 w-4" /> Add day
          </button>

          {(formError || save.isError) && (
              <div role="alert" className="text-sm text-destructive">
                <p>{formError ?? errorMessage(save.error)}</p>
                {!formError && serverFields.length > 0 && (
                    <ul className="mt-1 list-disc pl-5">
                      {serverFields.map(([field, msg]) => (
                          <li key={field}>{field}: {msg}</li>
                      ))}
                    </ul>
                )}
              </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={save.isPending} className={pillPrimaryCls}>
              {save.isPending ? "Saving…" : plan ? "Save changes" : "Create plan"}
            </button>
            <Link href="/workouts/my-plans" className={pillBtnCls}>Cancel</Link>
          </div>
        </form>

        <ExercisePicker open={pickDay !== null} onClose={() => setPickDay(null)} onPick={addExercise} />
      </div>
  );
}