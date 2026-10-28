import Link from "next/link";

const base = "shrink-0 rounded-full px-5 py-2.5 text-xs uppercase tracking-widest transition-all duration-200";
const on = `${base} bg-foreground text-background shadow-md`;
const off = `${base} border bg-card text-muted-foreground hover:-translate-y-0.5 hover:border-primary/60 hover:text-foreground hover:shadow-sm active:scale-95`;

const TABS = [
    { key: "workouts", label: "Workouts", href: "/workouts" },
    { key: "plans", label: "My plans", href: "/workouts/my-plans" },
] as const;

export function WorkoutTabs({ active }: { active: (typeof TABS)[number]["key"] }) {
    return (
        <div className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 py-1 md:mx-0 md:px-0">
            {TABS.map((t) =>
                t.key === active ? (
                    <span key={t.key} aria-current="page" className={on}>{t.label}</span>
                ) : (
                    <Link key={t.key} href={t.href} className={off}>{t.label}</Link>
                ),
            )}
        </div>
    );
}