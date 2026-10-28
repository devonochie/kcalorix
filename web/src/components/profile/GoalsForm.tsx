"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Dumbbell, Globe, Ruler, Save, Target, UserRound } from "lucide-react";
import { HeightInput, UnitToggle, WeightInput } from "./body-fields";
import { errorCls, fieldCls, labelCls, primaryBtnCls } from "@/components/ui/classes";
import { useUpdateProfile } from "@/hooks/use-profile";
import { useToday } from "@/hooks/use-today";
import {
    fromMetric,
    switchUnits,
    toIsoDate,
    toMetric,
    validateBody,
    validateTarget,
    type BodyForm,
} from "@/lib/body-form";
import { errorMessage, fieldErrors } from "@/lib/errors";
import { ActivityLevel, EquipmentAccess, ExperienceLevel, Goal, Sex, type ProfileResponse } from "@/types";
import { profileCardCls, SectionHeading } from "./profile-ui";

const GOALS: [Goal, string][] = [
    [Goal.LOSE, "Lose weight"],
    [Goal.MAINTAIN, "Maintain weight"],
    [Goal.GAIN, "Build muscle"],
];
const ACTIVITIES: [ActivityLevel, string][] = [
    [ActivityLevel.SEDENTARY, "Mostly sitting"],
    [ActivityLevel.LIGHT, "Lightly active"],
    [ActivityLevel.MODERATE, "Moderately active"],
    [ActivityLevel.VERY_ACTIVE, "Very active"],
    [ActivityLevel.EXTRA_ACTIVE, "Extra active"],
];
const EXPERIENCES: [ExperienceLevel, string][] = [
    [ExperienceLevel.BEGINNER, "Beginner"],
    [ExperienceLevel.INTERMEDIATE, "Intermediate"],
    [ExperienceLevel.ADVANCED, "Advanced"],
];
const EQUIPMENTS: [EquipmentAccess, string][] = [
    [EquipmentAccess.GYM, "Full gym"],
    [EquipmentAccess.HOME_BASIC, "Home, basic gear"],
    [EquipmentAccess.NONE, "No equipment"],
];
const DAY_OPTS = [2, 3, 4, 5, 6];
const RATES = [0.1, 0.25, 0.5];

function timezones(): string[] {
    try {
        const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
        return intl.supportedValuesOf?.("timeZone") ?? [];
    } catch {
        return [];
    }
}

/** One block of the form: heading on top, fields in a 1-column (phone) / 2-column grid. */
function Group({
                   icon, title, sub, right, children,
               }: {
    icon: typeof UserRound;
    title: string;
    sub?: string;
    right?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="animate-fadeup border-t pt-6 first:border-0 first:pt-0">
            <SectionHeading icon={icon} title={title} sub={sub}>{right}</SectionHeading>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
        </div>
    );
}

export function GoalsForm({ profile }: { profile: ProfileResponse }) {
    const save = useUpdateProfile();
    const today = useToday();
    const [displayName, setDisplayName] = useState(profile.displayName ?? "");
    const [sex, setSex] = useState<Sex>(profile.sex);
    const [goal, setGoal] = useState<Goal>(profile.goal);
    const [activity, setActivity] = useState<ActivityLevel>(profile.activityLevel);
    const [rate, setRate] = useState<number>(profile.weeklyRateKg ?? (profile.goal === Goal.GAIN ? 0.25 : 0.5));
    const [timezone, setTimezone] = useState(profile.timezone);
    const [experience, setExperience] = useState<ExperienceLevel>(profile.experienceLevel ?? ExperienceLevel.BEGINNER);
    const [daysPerWeek, setDaysPerWeek] = useState<number>(profile.daysPerWeek ?? 3);
    const [equipment, setEquipment] = useState<EquipmentAccess>(profile.equipmentAccess ?? EquipmentAccess.GYM);
    const [body, setBody] = useState<BodyForm>(() =>
        fromMetric(profile.unitSystem, {
            birthDate: profile.birthDate,
            heightCm: Number(profile.heightCm),
            weightKg: Number(profile.weightKg),
            targetWeightKg: Number(profile.targetWeightKg),
        }),
    );
    const [showErrors, setShowErrors] = useState(false);

    const maintain = goal === Goal.MAINTAIN;
    const errors = { ...validateBody(body, today), ...(maintain ? {} : validateTarget(body, goal)) };
    const shown = showErrors ? errors : {};
    const server = fieldErrors(save.error);

    function submit(e: FormEvent) {
        e.preventDefault();
        if (Object.keys(errors).length > 0 || displayName.trim() === "") {
            setShowErrors(true);
            return;
        }
        const m = toMetric(body);
        save.mutate(
            {
                displayName: displayName.trim(),
                sex,
                birthDate: body.birthDate,
                heightCm: m.heightCm,
                weightKg: m.weightKg,
                targetWeightKg: maintain ? m.weightKg : m.targetWeightKg,
                activityLevel: activity,
                goal,
                weeklyRateKg: maintain ? null : rate,
                unitSystem: body.units,
                timezone: timezone.trim() || "UTC",
                experienceLevel: experience,
                daysPerWeek,
                equipmentAccess: equipment,
            },
        );
    }

    return (
        <form onSubmit={submit} className={`${profileCardCls} space-y-6`}>
            {/* ---------- about you ---------- */}
            <Group icon={UserRound} title="About you" sub="The basics we use to personalise things">
                <label className="block sm:col-span-2">
                    <span className={labelCls}>Name</span>
                    <input
                        className={fieldCls}
                        maxLength={60}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                    {showErrors && displayName.trim() === "" && <p className={errorCls}>Enter your name.</p>}
                    {server["displayName"] && <p className={errorCls}>{server["displayName"]}</p>}
                </label>
                <label className="block">
                    <span className={labelCls}>Sex</span>
                    <select className={fieldCls} value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
                        <option value={Sex.MALE}>Male</option>
                        <option value={Sex.FEMALE}>Female</option>
                    </select>
                </label>
                <label className="block">
                    <span className={labelCls}>Date of birth</span>
                    <input
                        type="date"
                        className={fieldCls}
                        value={body.birthDate}
                        max={today ? toIsoDate(today) : undefined}
                        onChange={(e) => setBody({ ...body, birthDate: e.target.value })}
                    />
                    {shown.birthDate && <p className={errorCls}>{shown.birthDate}</p>}
                </label>
                <label className="block sm:col-span-2">
                    <span className={`${labelCls} flex items-center gap-1.5`}>
                        <Globe className="h-3.5 w-3.5" /> Time zone
                    </span>
                    <input
                        className={fieldCls}
                        list="timezones"
                        maxLength={60}
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                    />
                    <datalist id="timezones">
                        {timezones().map((z) => (
                            <option key={z} value={z} />
                        ))}
                    </datalist>
                </label>
            </Group>

            {/* ---------- body ---------- */}
            <Group
                icon={Ruler}
                title="Body"
                sub="Used to work out your daily energy"
                right={<UnitToggle value={body.units} onChange={(u) => setBody(switchUnits(body, u))} />}
            >
                <HeightInput
                    units={body.units}
                    height={body.height}
                    heightIn={body.heightIn}
                    onChange={(v) => setBody({ ...body, ...v })}
                    error={shown.height}
                />
                <WeightInput
                    label="Weight"
                    units={body.units}
                    value={body.weight}
                    onChange={(v) => setBody({ ...body, weight: v })}
                    error={shown.weight}
                />
            </Group>

            {/* ---------- goal ---------- */}
            <Group icon={Target} title="Your goal" sub="Where you want to get to, and how fast">
                <label className="block">
                    <span className={labelCls}>Goal</span>
                    <select
                        className={fieldCls}
                        value={goal}
                        onChange={(e) => {
                            const g = e.target.value as Goal;
                            setGoal(g);
                            setRate(g === Goal.GAIN ? 0.25 : 0.5);
                        }}
                    >
                        {GOALS.map(([v, t]) => (
                            <option key={v} value={v}>
                                {t}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="block">
                    <span className={labelCls}>Activity level</span>
                    <select className={fieldCls} value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>
                        {ACTIVITIES.map(([v, t]) => (
                            <option key={v} value={v}>
                                {t}
                            </option>
                        ))}
                    </select>
                </label>
                {!maintain && (
                    <>
                        <WeightInput
                            label="Target weight"
                            units={body.units}
                            value={body.targetWeight}
                            onChange={(v) => setBody({ ...body, targetWeight: v })}
                            error={shown.targetWeight}
                        />
                        <label className="block">
                            <span className={labelCls}>Weekly pace (kg)</span>
                            <select className={fieldCls} value={rate} onChange={(e) => setRate(Number(e.target.value))}>
                                {RATES.map((r) => (
                                    <option key={r} value={r}>
                                        {r} kg per week
                                    </option>
                                ))}
                            </select>
                            {server["weeklyRateKg"] && <p className={errorCls}>{server["weeklyRateKg"]}</p>}
                        </label>
                    </>
                )}
            </Group>

            {/* ---------- training ---------- */}
            <Group icon={Dumbbell} title="Training" sub="Used when we build a workout plan for you">
                <label className="block">
                    <span className={labelCls}>Training experience</span>
                    <select className={fieldCls} value={experience} onChange={(e) => setExperience(e.target.value as ExperienceLevel)}>
                        {EXPERIENCES.map(([v, t]) => (
                            <option key={v} value={v}>
                                {t}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="block">
                    <span className={labelCls}>Training days per week</span>
                    <select className={fieldCls} value={daysPerWeek} onChange={(e) => setDaysPerWeek(Number(e.target.value))}>
                        {DAY_OPTS.map((d) => (
                            <option key={d} value={d}>
                                {d} days
                            </option>
                        ))}
                    </select>
                </label>
                <label className="block sm:col-span-2">
                    <span className={labelCls}>Equipment</span>
                    <select className={fieldCls} value={equipment} onChange={(e) => setEquipment(e.target.value as EquipmentAccess)}>
                        {EQUIPMENTS.map(([v, t]) => (
                            <option key={v} value={v}>
                                {t}
                            </option>
                        ))}
                    </select>
                </label>
            </Group>

            {save.error && (
                <p role="alert" className={errorCls}>
                    {errorMessage(save.error)}
                </p>
            )}
            <button
                type="submit"
                disabled={save.isPending}
                className={`${primaryBtnCls} inline-flex w-full items-center justify-center gap-2 sm:w-auto`}
            >
                <Save className={`h-4 w-4 ${save.isPending ? "animate-pulse" : ""}`} />
                {save.isPending ? "Saving…" : "Save changes"}
            </button>
        </form>
    );
}