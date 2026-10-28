import Link from "next/link";
import { ExerciseThumb } from "./ExerciseThumb";
import { enumLabel } from "@/lib/workout";
import type { ExerciseSummaryResponse } from "@/types";

export function ExerciseCard({ exercise: e }: { exercise: ExerciseSummaryResponse }) {
  return (
    <Link href={`/exercises/${e.slug}`} className="block">
      <article className="overflow-hidden rounded-sm border bg-card transition-colors hover:border-primary">
        <div className="relative aspect-[3/2] overflow-hidden">
          <ExerciseThumb path={e.thumbnailPath} alt={e.name} className="h-full w-full" />
          <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] uppercase tracking-widest">
            {enumLabel(e.primaryMuscle)}
          </span>
        </div>
        <div className="p-4">
          <h2 className="font-display text-lg uppercase leading-tight">{e.name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {enumLabel(e.equipment)} · {enumLabel(e.difficulty)}
          </p>
        </div>
      </article>
    </Link>
  );
}
