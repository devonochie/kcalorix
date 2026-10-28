"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";
import { PageHeader } from "@/components/shell/AppShell";
import { ExerciseThumb } from "@/components/workout/ExerciseThumb";
import { useProfile } from "@/hooks/use-profile";
import { useExercise, useRecords } from "@/hooks/use-workout";
import { errorMessage } from "@/lib/errors";
import { enumLabel, mediaUrl, recordLines, youtubeEmbedUrl } from "@/lib/workout";
import { cardCls } from "@/components/ui/classes";
import { UnitSystem } from "@/types";

const tag = "rounded-full border bg-card px-3 py-1 text-[10px] uppercase tracking-widest";

function List({ title, items, ordered }: { title: string; items: string[]; ordered?: boolean }) {
  if (items.length === 0) return null;
  const Tag = ordered ? "ol" : "ul";
  return (
      <section className={cardCls}>
        <h2 className="font-display text-xl uppercase">{title}</h2>
        <Tag className={`mt-3 space-y-2 pl-5 text-sm ${ordered ? "list-decimal" : "list-disc"}`}>
          {items.map((t, i) => <li key={i}>{t}</li>)}
        </Tag>
      </section>
  );
}

export default function ExerciseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const q = useExercise(slug);
  const records = useRecords();
  const units = useProfile().data?.unitSystem ?? UnitSystem.METRIC;

  const back = (
      <Link href="/exercises" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Exercises
      </Link>
  );

  if (q.isLoading) {
    return (
        <div>
          {back}
          <div className="mt-6 aspect-video max-h-[420px] animate-pulse rounded-sm border bg-card" />
        </div>
    );
  }

  if (q.isError || !q.data) {
    return (
        <div>
          {back}
          <div className="mt-6 rounded-sm border bg-card p-6">
            <p className="text-sm text-destructive">{q.isError ? errorMessage(q.error) : "Exercise not found."}</p>
            <button type="button" onClick={() => void q.refetch()} className="mt-3 text-sm text-primary underline">Try again</button>
          </div>
        </div>
    );
  }

  const ex = q.data;
  const youtube = youtubeEmbedUrl(ex.videoPath);
  const video = youtube ? null : mediaUrl(ex.videoPath);
  const record = records.data?.find((r) => r.exerciseId === ex.id);
  const lines = record ? recordLines(record, units) : [];

  return (
      <div>
        <PageHeader kicker={enumLabel(ex.category)} title={ex.name} />
        <div className="mt-4">{back}</div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-sm border bg-card">
              {youtube ? (
                  <iframe
                      src={youtube}
                      title={ex.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="aspect-video max-h-[420px] w-full bg-black"
                  />
              ) : video ? (
                  <video
                      src={video}
                      poster={mediaUrl(ex.thumbnailPath) ?? undefined}
                      controls
                      playsInline
                      preload="metadata"
                      className="aspect-video max-h-[420px] w-full bg-black object-contain"
                  />
              ) : (
                  <ExerciseThumb path={ex.thumbnailPath} alt={ex.name} className="aspect-video max-h-[420px] w-full" />
              )}
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  <span className={tag}>{enumLabel(ex.primaryMuscle)}</span>
                  {ex.secondaryMuscles.map((m) => <span key={m} className={`${tag} text-muted-foreground`}>{enumLabel(m)}</span>)}
                  <span className={tag}>{enumLabel(ex.equipment)}</span>
                  <span className={tag}>{enumLabel(ex.difficulty)}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed">{ex.description}</p>
              </div>
            </section>

            <List title="How to" items={ex.steps} ordered />
            <List title="Tips" items={ex.tips} />
            <List title="Common mistakes" items={ex.commonMistakes} />
          </div>

          <div className="space-y-5">
            <section className="rounded-sm border border-primary/40 bg-primary/10 p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-background text-primary"><Trophy className="h-4 w-4" /></span>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Personal record</p>
                  <p className="font-bold">{lines.length > 0 ? "Your best" : "None yet"}</p>
                </div>
              </div>
              {lines.length > 0 ? (
                  <ul className="mt-4 space-y-1 text-sm">
                    {lines.map((l) => <li key={l}>{l}</li>)}
                  </ul>
              ) : (
                  <p className="mt-4 text-sm text-muted-foreground">Log this exercise in a workout to set your first record.</p>
              )}
            </section>

            <section className={cardCls}>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Details</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Tracked by</dt><dd className="font-bold">{enumLabel(ex.trackingType)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Intensity (MET)</dt><dd className="font-bold">{ex.metValue}</dd></div>
              </dl>
            </section>

            <Link href="/workouts" className="block rounded-full bg-primary py-3.5 text-center text-xs font-bold uppercase tracking-widest text-primary-foreground">
              Start a workout
            </Link>
          </div>
        </div>
      </div>
  );
}