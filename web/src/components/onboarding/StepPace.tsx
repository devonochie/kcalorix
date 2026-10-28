import { WeightInput } from "@/components/profile/body-fields";
import type { BodyForm } from "@/lib/body-form";
import { formatWeight } from "@/lib/units";
import type { UnitSystem } from "@/types";
import { ChoiceCard } from "./ChoiceCard";
import { PACES } from "./onboarding-options";

type Props = {
    body: BodyForm;
    onChange: (body: BodyForm) => void;
    rate: number;
    onRate: (kgPerWeek: number) => void;
    targetWeightError: string | undefined;
};

export function StepPace({ body, onChange, rate, onRate, targetWeightError }: Props) {
    return (
        <div className="mt-6 space-y-5">
            <WeightInput
                label="Target weight"
                units={body.units}
                value={body.targetWeight}
                onChange={(v) => onChange({ ...body, targetWeight: v })}
                error={targetWeightError}
            />
            <div className="space-y-3">
                {PACES.map((p) => (
                    <ChoiceCard
                        key={p.kg}
                        on={rate === p.kg}
                        title={p.t}
                        sub={`About ${formatWeight(p.kg, body.units as UnitSystem)} per week`}
                        onClick={() => onRate(p.kg)}
                    />
                ))}
            </div>
        </div>
    );
}