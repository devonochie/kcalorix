"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ExercisePicker } from "./ExercisePicker";
import { SetForm } from "./SetForm";
import { CancelModal } from "./session/CancelModal";
import { ExerciseList } from "./session/ExerciseList";
import { FinishCard } from "./session/FinishCard";
import { FinishModal } from "./session/FinishModal";
import { MediaPanel } from "./session/MediaPanel";
import { SetsPanel } from "./session/SetsPanel";
import { useSessionItems } from "./session/use-session-items";
import { useNow } from "@/hooks/use-now";
import { useProfile } from "@/hooks/use-profile";
import { useCancelSession, useDeleteSet, useFinishSession, useLogSet, useRecords, useUpdateSet } from "@/hooks/use-workout";
import { errorMessage } from "@/lib/errors";
import { findNewRecords, stashNewRecords } from "@/lib/records";
import { defaultRestSeconds, draftFromSet, formatClock, inferTrackingType, recordLines, sessionTitle } from "@/lib/workout";
import { UnitSystem } from "@/types";
import type { ExerciseDetailResponse, SessionResponse, SessionSetResponse } from "@/types";

export function SessionLive({ session }: { session: SessionResponse }) {
    const router = useRouter();
    const units = useProfile().data?.unitSystem ?? UnitSystem.METRIC;
    const records = useRecords();

    const logSet = useLogSet(session.id);
    const updateSet = useUpdateSet(session.id);
    const deleteSet = useDeleteSet(session.id);
    const finish = useFinishSession(session.id);
    const cancel = useCancelSession(session.id);

    const { items, plan, addExtra } = useSessionItems(session);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [picking, setPicking] = useState(false);
    const [editing, setEditing] = useState<SessionSetResponse | null>(null);
    const [finishing, setFinishing] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [notes, setNotes] = useState("");
    const [restEndsAt, setRestEndsAt] = useState<number | null>(null);

    const now = useNow();
    const elapsed = Math.max(0, (now - new Date(session.startedAt).getTime()) / 1000);
    const restLeft = restEndsAt ? Math.max(0, Math.ceil((restEndsAt - now) / 1000)) : 0;

    const current = items.find((i) => i.exerciseId === selectedId) ?? items[0] ?? null;
    const currentIndex = current ? items.indexOf(current) : -1;
    const currentSets = current ? session.sets.filter((s) => s.exerciseId === current.exerciseId) : [];
    const record = current ? records.data?.find((r) => r.exerciseId === current.exerciseId) : undefined;
    const recordText = record ? recordLines(record, units)[0] : undefined;
    const restTarget = current?.target?.restSeconds ?? (current?.detail ? defaultRestSeconds(current.detail) : null);
    const currentComplete = !!current?.target && currentSets.length >= current.target.targetSets;
    const nextId =
        items
            .slice(currentIndex + 1)
            .find((i) => !i.target || session.sets.filter((s) => s.exerciseId === i.exerciseId).length < i.target.targetSets)
            ?.exerciseId ?? null;

    // rest finished: buzz once, clear the timer, and move on if this exercise's planned sets are done
    useEffect(() => {
        if (restEndsAt !== null && restLeft === 0) {
            if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(200);
            setRestEndsAt(null);
            if (currentComplete && nextId) setSelectedId(nextId);
        }
    }, [restEndsAt, restLeft, currentComplete, nextId]);

    function adjustRest(deltaSeconds: number) {
        setRestEndsAt((t) => (t === null ? t : Math.max(Date.now() + 1000, t + deltaSeconds * 1000)));
    }

    function goNext() {
        setRestEndsAt(null);
        setSelectedId(nextId);
    }

    function addPicked(ex: ExerciseDetailResponse) {
        addExtra(ex);
        setSelectedId(ex.id);
    }

    return (
        <div>
            <Link href="/workouts" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Workouts
            </Link>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-primary">Workout in progress</p>
                    <h1 className="font-display text-4xl uppercase md:text-5xl">{sessionTitle(session)}</h1>
                </div>
                <div className="font-display text-4xl tabular-nums">{formatClock(elapsed)}</div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_380px]">
                <div className="space-y-5">
                    <MediaPanel
                        current={current}
                        index={currentIndex}
                        total={items.length}
                        setsLogged={currentSets.length}
                        restLeft={restLeft}
                        restTarget={restTarget}
                        showNext={nextId !== null && currentSets.length > 0}
                        onAdjustRest={adjustRest}
                        onSkipRest={() => setRestEndsAt(null)}
                        onNext={goNext}
                    />
                    <SetsPanel
                        current={current}
                        sets={currentSets}
                        units={units}
                        planLoading={plan.isLoading && !!session.planId}
                        logBusy={logSet.isPending}
                        logError={logSet.isError ? errorMessage(logSet.error) : null}
                        deleteBusy={deleteSet.isPending}
                        deleteError={deleteSet.isError ? errorMessage(deleteSet.error) : null}
                        onLog={(body) => {
                            if (!current) return;
                            logSet.mutate(
                                { exerciseId: current.exerciseId, ...body },
                                { onSuccess: () => setRestEndsAt(restTarget ? Date.now() + restTarget * 1000 : null) },
                            );
                        }}
                        onEdit={(s) => { updateSet.reset(); setEditing(s); }}
                        onDelete={(id) => deleteSet.mutate(id)}
                    />
                </div>

                <div className="space-y-5">
                    <ExerciseList
                        items={items}
                        sets={session.sets}
                        currentId={current?.exerciseId ?? null}
                        onSelect={setSelectedId}
                        onAdd={() => setPicking(true)}
                    />
                    <FinishCard
                        exerciseName={current?.name ?? null}
                        recordText={recordText}
                        elapsed={elapsed}
                        canFinish={session.sets.length > 0}
                        onFinish={() => { finish.reset(); setFinishing(true); }}
                        onCancel={() => { cancel.reset(); setCancelling(true); }}
                    />
                </div>
            </div>

            <ExercisePicker open={picking} onClose={() => setPicking(false)} onPick={addPicked} />

            <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing ? `Edit set ${editing.setNumber}` : "Edit set"}>
                {editing && (
                    <SetForm
                        key={editing.id}
                        tracking={items.find((i) => i.exerciseId === editing.exerciseId)?.tracking ?? inferTrackingType(editing)}
                        units={units}
                        initial={draftFromSet(editing, units)}
                        submitLabel="Save"
                        busy={updateSet.isPending}
                        error={updateSet.isError ? errorMessage(updateSet.error) : null}
                        onSubmit={(body) => updateSet.mutate({ setId: editing.id, body }, { onSuccess: () => setEditing(null) })}
                    />
                )}
            </Modal>

            <FinishModal
                open={finishing}
                onClose={() => setFinishing(false)}
                setsCount={session.sets.length}
                elapsed={elapsed}
                notes={notes}
                onNotesChange={setNotes}
                busy={finish.isPending}
                error={finish.isError ? errorMessage(finish.error) : null}
                onSubmit={() => {
                    // Check for new personal records now, while the old bests are still loaded.
                    stashNewRecords(session.id, findNewRecords(session.sets, records.data));
                    finish.mutate({ notes: notes.trim() || null });
                }}
            />

            <CancelModal
                open={cancelling}
                onClose={() => setCancelling(false)}
                busy={cancel.isPending}
                error={cancel.isError ? errorMessage(cancel.error) : null}
                onConfirm={() => cancel.mutate(undefined, { onSuccess: () => router.push("/workouts") })}
            />
        </div>
    );
}