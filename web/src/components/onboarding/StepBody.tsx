import { HeightInput, UnitToggle, WeightInput } from "@/components/profile/body-fields";
import { errorCls, fieldCls, labelCls } from "@/components/ui/classes";
import { switchUnits, type BodyForm } from "@/lib/body-form";

type Props = {
    body: BodyForm;
    onChange: (body: BodyForm) => void;
    /** Latest allowed birth date (today) as yyyy-mm-dd. */
    maxBirthDate: string | undefined;
    birthDateError: string | undefined;
    heightError: string | undefined;
    weightError: string | undefined;
};

export function StepBody({ body, onChange, maxBirthDate, birthDateError, heightError, weightError }: Props) {
    return (
        <div className="mt-6 space-y-5">
            <UnitToggle value={body.units} onChange={(u) => onChange(switchUnits(body, u))} />
            <label className="block">
                <span className={labelCls}>Date of birth</span>
                <input
                    type="date"
                    value={body.birthDate}
                    max={maxBirthDate}
                    onChange={(e) => onChange({ ...body, birthDate: e.target.value })}
                    className={fieldCls}
                />
                {birthDateError && <p className={errorCls}>{birthDateError}</p>}
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
                <HeightInput
                    units={body.units}
                    height={body.height}
                    heightIn={body.heightIn}
                    onChange={(v) => onChange({ ...body, ...v })}
                    error={heightError}
                />
                <WeightInput
                    label="Weight"
                    units={body.units}
                    value={body.weight}
                    onChange={(v) => onChange({ ...body, weight: v })}
                    error={weightError}
                />
            </div>
        </div>
    );
}