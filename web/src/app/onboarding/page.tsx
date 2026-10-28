"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-profile";
import { useToday } from "@/hooks/use-today";
import { FullPageSkeleton } from "@/components/ui/FullPageSkeleton";
import { Logo } from "@/components/ui/Logo";
import { OptionList } from "@/components/onboarding/OptionList";
import { StepBody } from "@/components/onboarding/StepBody";
import { StepPace } from "@/components/onboarding/StepPace";
import { StepTraining } from "@/components/onboarding/StepTraining";
import { TargetPreview } from "@/components/onboarding/TargetPreview";
import { ACTIVITY_OPTS, GOAL_OPTS, SEX_OPTS, TITLES, stepsFor } from "@/components/onboarding/onboarding-options";
import { pillBtnCls, pillPrimaryCls } from "@/components/ui/classes";
import { ActivityLevel, EquipmentAccess, ExperienceLevel, Goal, Sex, type ProfileRequest } from "@/types";
import {
  ageFromBirthDate,
  emptyBodyForm,
  toIsoDate,
  toMetric,
  validateBody,
  validateTarget,
  type BodyForm,
} from "@/lib/body-form";
import { estimateTargets } from "@/lib/targets";
import { errorMessage, fieldErrors } from "@/lib/errors";

export default function OnboardingPage() {
  const { user, isLoading } = useMe();
  const router = useRouter();
  const save = useUpdateProfile();
  const today = useToday();

  const [step, setStep] = useState(0);
  const [sex, setSex] = useState<Sex>(Sex.MALE);
  const [goal, setGoal] = useState<Goal>(Goal.LOSE);
  const [activity, setActivity] = useState<ActivityLevel>(ActivityLevel.MODERATE);
  const [experience, setExperience] = useState<ExperienceLevel>(ExperienceLevel.BEGINNER);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [equipment, setEquipment] = useState<EquipmentAccess>(EquipmentAccess.GYM);
  const [rate, setRate] = useState(0.5);
  const [body, setBody] = useState<BodyForm>(() => emptyBodyForm());
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
    else if (user.onboardingCompleted && !save.isPending && !save.isSuccess) router.replace("/today");
  }, [user, isLoading, save.isPending, save.isSuccess, router]);

  const steps = useMemo(() => stepsFor(goal), [goal]);
  const key = steps[Math.min(step, steps.length - 1)]!;
  const isLast = step >= steps.length - 1;

  const bodyErrors = key === "body" ? validateBody(body, today) : {};
  const targetErrors = key === "pace" ? validateTarget(body, goal) : {};
  const errors = { ...bodyErrors, ...targetErrors };
  const hasErrors = Object.keys(errors).length > 0;

  // Live preview (same formula as the backend). Falls back to typical numbers until filled in.
  const m = toMetric(body);
  const age = ageFromBirthDate(body.birthDate, today);
  const estimate = estimateTargets({
    sex,
    age: age !== null && age >= 18 && age <= 100 ? age : 30,
    weightKg: m.weightKg >= 30 && m.weightKg <= 300 ? m.weightKg : 70,
    heightCm: m.heightCm >= 100 && m.heightCm <= 250 ? m.heightCm : 170,
    activity,
    goal,
    weeklyRateKg: goal === Goal.MAINTAIN ? null : rate,
  });

  function pickGoal(g: Goal) {
    setGoal(g);
    setRate(g === Goal.GAIN ? 0.25 : 0.5); // backend defaults
  }

  function next() {
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    if (!user) return;
    const payload: ProfileRequest = {
      displayName: user.displayName || user.email.split("@")[0]!,
      sex,
      birthDate: body.birthDate,
      heightCm: m.heightCm,
      weightKg: m.weightKg,
      targetWeightKg: goal === Goal.MAINTAIN ? m.weightKg : m.targetWeightKg,
      activityLevel: activity,
      goal,
      weeklyRateKg: goal === Goal.MAINTAIN ? null : rate,
      unitSystem: body.units,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      experienceLevel: experience,
      daysPerWeek,
      equipmentAccess: equipment,
    };
    save.mutate(payload, { onSuccess: () => router.replace("/today") });
  }

  if (isLoading || !user || (user.onboardingCompleted && !save.isSuccess && !save.isPending)) {
    return <FullPageSkeleton light />;
  }

  const serverFields = fieldErrors(save.error);
  const show = showErrors ? errors : {};

  return (
      <div className="app-light bg-app min-h-dvh px-5 py-8 text-foreground md:px-10">
        <Link href="/">
          <Logo />
        </Link>
        <div className="mx-auto mt-12 grid max-w-5xl items-start gap-8 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Step {step + 1} of {steps.length}
            </p>
            <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
              {steps.map((s, i) => (
                  <div key={s} className={`h-1 ${i <= step ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
            <h1 className="mt-8 font-display text-4xl uppercase md:text-5xl">{TITLES[key].q}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{TITLES[key].sub}</p>

            {key === "sex" && <OptionList opts={SEX_OPTS} value={sex} onPick={setSex} />}
            {key === "goal" && <OptionList opts={GOAL_OPTS} value={goal} onPick={pickGoal} />}
            {key === "activity" && <OptionList opts={ACTIVITY_OPTS} value={activity} onPick={setActivity} />}
            {key === "training" && (
                <StepTraining
                    experience={experience}
                    onExperience={setExperience}
                    daysPerWeek={daysPerWeek}
                    onDays={setDaysPerWeek}
                    equipment={equipment}
                    onEquipment={setEquipment}
                />
            )}
            {key === "body" && (
                <StepBody
                    body={body}
                    onChange={setBody}
                    maxBirthDate={today ? toIsoDate(today) : undefined}
                    birthDateError={show.birthDate}
                    heightError={show.height}
                    weightError={show.weight}
                />
            )}
            {key === "pace" && (
                <StepPace body={body} onChange={setBody} rate={rate} onRate={setRate} targetWeightError={show.targetWeight} />
            )}

            {save.error && (
                <div role="alert" className="mt-5 text-sm text-destructive">
                  <p>{errorMessage(save.error)}</p>
                  {Object.values(serverFields).map((m2) => (
                      <p key={m2}>{m2}</p>
                  ))}
                </div>
            )}

            <div className="mt-6 flex gap-3">
              {step > 0 && (
                  <button type="button" onClick={() => setStep(step - 1)} disabled={save.isPending} className={pillBtnCls}>
                    Back
                  </button>
              )}
              <button type="button" onClick={next} disabled={save.isPending} className={pillPrimaryCls}>
                {save.isPending ? "Saving…" : isLast ? "Finish" : "Continue"}
              </button>
            </div>
          </div>

          <TargetPreview estimate={estimate} />
        </div>
      </div>
  );
}