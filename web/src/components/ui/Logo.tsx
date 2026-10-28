export const BRAND = "Kcalorix";

export function Logo({ className = "font-display text-2xl uppercase" }: { className?: string }) {
  return (
    <span className={className}>
      {BRAND}
      <span className="text-primary">.</span>
    </span>
  );
}
