"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { errorCls, fieldCls, labelCls, pillBtnCls, pillPrimaryCls } from "@/components/ui/classes";
import { useLogWeight } from "@/hooks/use-profile";
import { errorMessage, fieldErrors } from "@/lib/errors";
import { displayToKg, parseNum, weightLabel } from "@/lib/workout";
import { UnitSystem } from "@/types";

export function LogWeightModal({
                                   open, onClose, units, today,
                               }: {
    open: boolean;
    onClose: () => void;
    units: UnitSystem;
    today: string;
}) {
    const log = useLogWeight();
    const [date, setDate] = useState(today);
    const [value, setValue] = useState("");
    const [showError, setShowError] = useState(false);

    const n = parseNum(value);
    const kg = n === null ? null : displayToKg(n, units);
    const server = fieldErrors(log.error);

    function close() {
        log.reset();
        setShowError(false);
        onClose();
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        if (kg === null || kg < 30 || kg > 300 || !date) {
            setShowError(true);
            return;
        }
        log.mutate(
            { date, weightKg: kg },
            {
                onSuccess: () => {
                    setValue("");
                    close();
                },
            },
        );
    }

    return (
        <Modal open={open} onClose={close} title="Log weight">
            <form onSubmit={submit} className="space-y-4">
                <label className="block">
                    <span className={labelCls}>Date</span>
                    <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className={fieldCls} />
                </label>
                <label className="block">
                    <span className={labelCls}>Weight ({weightLabel(units)})</span>
                    <input
                        inputMode="decimal"
                        autoFocus
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={units === UnitSystem.IMPERIAL ? "e.g. 168.5" : "e.g. 76.4"}
                        className={fieldCls}
                    />
                    {showError && (kg === null || kg < 30 || kg > 300) && (
                        <p className={errorCls}>Enter a weight between 30 and 300 kg.</p>
                    )}
                    {server["weightKg"] && <p className={errorCls}>{server["weightKg"]}</p>}
                </label>
                {log.error && (
                    <p role="alert" className={errorCls}>
                        {errorMessage(log.error)}
                    </p>
                )}
                <div className="flex gap-3">
                    <button type="submit" disabled={log.isPending} className={pillPrimaryCls}>
                        {log.isPending ? "Saving…" : "Save"}
                    </button>
                    <button type="button" onClick={close} className={pillBtnCls}>
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
}