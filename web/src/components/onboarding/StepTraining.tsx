import { labelCls } from "@/components/ui/classes";
import type { EquipmentAccess, ExperienceLevel } from "@/types";
import { DAY_OPTS, EQUIPMENT_OPTS, EXPERIENCE_OPTS } from "./onboarding-options";
import { OptionList } from "./OptionList";

type Props = {
    experience: ExperienceLevel;
    onExperience: (v: ExperienceLevel) => void;
    daysPerWeek: number;
    onDays: (d: number) => void;
    equipment: EquipmentAccess;
    onEquipment: (v: EquipmentAccess) => void;
};

export function StepTraining({ experience, onExperience, daysPerWeek, onDays, equipment, onEquipment }: Props) {
    return (
        <div className="mt-6 space-y-8">
            <div>
                <span className={labelCls}>Experience</span>
                <OptionList opts={EXPERIENCE_OPTS} value={experience} onPick={onExperience} />
            </div>
            <div>
                <span className={labelCls}>Training days per week</span>
                <div className="flex gap-2">
                    {DAY_OPTS.map((d) => (
                        <button
                            key={d}
                            type="button"
                            onClick={() => onDays(d)}
                            aria-pressed={daysPerWeek === d}
                            className={`h-12 flex-1 rounded-sm border text-sm font-medium transition-colors ${daysPerWeek === d ? "border-primary bg-primary/10" : "bg-card"}`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <span className={labelCls}>Equipment</span>
                <OptionList opts={EQUIPMENT_OPTS} value={equipment} onPick={onEquipment} />
            </div>
        </div>
    );
}