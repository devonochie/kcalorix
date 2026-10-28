import type { ComponentType, ReactNode } from "react";
import type { LucideProps } from "lucide-react";

/** Card used by every block on the profile page: soft lift + orange glow on hover. */
export const profileCardCls =
    "relative overflow-hidden rounded-sm border bg-card p-5 transition-shadow duration-300 hover:shadow-[0_22px_48px_-30px_color-mix(in_oklab,var(--primary)_60%,transparent)] sm:p-6";

/** Round icon + title (+ optional small text and a slot on the right) at the top of a card or form section. */
export function SectionHeading({
                                   icon: Icon, title, sub, children,
                               }: {
    icon: ComponentType<LucideProps>;
    title: string;
    sub?: string;
    children?: ReactNode;
}) {
    return (
        <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl uppercase leading-none">{title}</h2>
                {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
            </div>
            {children}
        </div>
    );
}