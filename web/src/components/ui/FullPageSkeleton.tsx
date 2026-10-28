import { BRAND } from "./Logo";

/** Branded splash shown while the app checks who is logged in. Fades in after 150 ms so quick loads never flash it. */
export function FullPageSkeleton({ light = false }: { light?: boolean }) {
  return (
      <div
          className={`grid min-h-dvh place-items-center text-foreground ${light ? "app-light bg-app" : "bg-background"}`}
          role="status"
          aria-label="Loading"
      >
        <div className="animate-fadein flex flex-col items-center gap-5" style={{ animationDelay: "150ms" }}>
        <span className="font-display text-5xl uppercase">
          {BRAND}
          <span className="animate-dotpulse text-primary">.</span>
        </span>
          <div className="h-0.5 w-28 overflow-hidden rounded-full bg-muted">
            <div className="animate-loadbar h-full w-2/5 rounded-full bg-primary" />
          </div>
        </div>
      </div>
  );
}