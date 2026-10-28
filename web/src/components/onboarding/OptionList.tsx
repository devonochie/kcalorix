import { ChoiceCard } from "./ChoiceCard";
import type { Opt } from "./onboarding-options";

type Props<T extends string> = { opts: Opt<T>[]; value: T; onPick: (v: T) => void };

export function OptionList<T extends string>({ opts, value, onPick }: Props<T>) {
    return (
        <div className="mt-6 space-y-3">
            {opts.map((o) => (
                <ChoiceCard key={o.v} on={value === o.v} title={o.t} sub={o.s} onClick={() => onPick(o.v)} />
            ))}
        </div>
    );
}