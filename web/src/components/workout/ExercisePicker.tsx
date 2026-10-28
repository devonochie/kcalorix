"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ExerciseThumb } from "./ExerciseThumb";
import { useExerciseList, useExerciseMeta, useRecommendedExercises } from "@/hooks/use-workout";
import { useDebounced } from "@/hooks/use-debounced";
import { exercisesApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import { errorMessage } from "@/lib/errors";
import { enumLabel } from "@/lib/workout";
import { fieldCls } from "@/components/ui/classes";
import type { ExerciseDetailResponse, MuscleGroup } from "@/types";

/**
 * Pick one exercise from the library. The list only has summaries (no tracking type),
 * so the chosen exercise is loaded in full before it is handed back.
 */
export function ExercisePicker({
                                 open, onClose, onPick,
                               }: {
  open: boolean;
  onClose: () => void;
  onPick: (exercise: ExerciseDetailResponse) => void;
}) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [muscle, setMuscle] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const q = useDebounced(text.trim(), 400);
  const meta = useExerciseMeta();
  const rec = useRecommendedExercises();
  const recItems = !q && !muscle ? (rec.data?.items ?? []).slice(0, 5) : [];
  const list = useExerciseList({
    q: q || undefined,
    muscle: (muscle || undefined) as MuscleGroup | undefined,
  });
  const items = list.data?.pages.flatMap((p) => p.content) ?? [];

  async function choose(slug: string, id: string) {
    setBusyId(id);
    setError(null);
    try {
      const detail = await qc.fetchQuery({
        queryKey: keys.exercises.detail(slug),
        queryFn: () => exercisesApi.getBySlug(slug),
        staleTime: 10 * 60_000,
      });
      onPick(detail);
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
      <Modal open={open} onClose={onClose} title="Add exercise">
        <label className="flex items-center gap-3 rounded-full border bg-background px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search exercises"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
        <select
            aria-label="Muscle group"
            value={muscle}
            onChange={(e) => setMuscle(e.target.value)}
            className={`${fieldCls} mt-3`}
        >
          <option value="">All muscles</option>
          {(meta.data?.muscles ?? []).map((m) => (
              <option key={m} value={m}>{enumLabel(m)}</option>
          ))}
        </select>

        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}

        {recItems.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Recommended for you</p>
              <div className="mt-2 space-y-1">
                {recItems.map(({ exercise: ex, reason }) => (
                    <button
                        key={ex.id}
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => void choose(ex.slug, ex.id)}
                        className="flex w-full items-center gap-3 rounded-sm bg-primary/5 p-2 text-left transition-colors hover:bg-primary/10 disabled:opacity-60"
                    >
                      <ExerciseThumb path={ex.thumbnailPath} alt="" className="h-12 w-14 shrink-0 rounded-sm" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold">{ex.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{reason}</div>
                      </div>
                      {busyId === ex.id && <span className="text-xs text-muted-foreground">Adding…</span>}
                    </button>
                ))}
              </div>
              <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">All exercises</p>
            </div>
        )}

        <div className="mt-4 space-y-1">
          {list.isLoading && <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>}
          {list.isError && (
              <p className="py-6 text-center text-sm text-destructive">
                {errorMessage(list.error)}{" "}
                <button type="button" onClick={() => void list.refetch()} className="text-primary underline">Try again</button>
              </p>
          )}
          {!list.isLoading && !list.isError && items.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No exercises match.</p>
          )}
          {items.map((ex) => (
              <button
                  key={ex.id}
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => void choose(ex.slug, ex.id)}
                  className="flex w-full items-center gap-3 rounded-sm p-2 text-left transition-colors hover:bg-muted disabled:opacity-60"
              >
                <ExerciseThumb path={ex.thumbnailPath} alt="" className="h-12 w-14 shrink-0 rounded-sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{ex.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {enumLabel(ex.primaryMuscle)} · {enumLabel(ex.equipment)}
                  </div>
                </div>
                {busyId === ex.id && <span className="text-xs text-muted-foreground">Adding…</span>}
              </button>
          ))}
        </div>

        {list.hasNextPage && (
            <button
                type="button"
                onClick={() => void list.fetchNextPage()}
                disabled={list.isFetchingNextPage}
                className="mt-3 w-full rounded-full border bg-card py-3 text-xs uppercase tracking-widest disabled:opacity-60"
            >
              {list.isFetchingNextPage ? "Loading…" : "Load more"}
            </button>
        )}
      </Modal>
  );
}