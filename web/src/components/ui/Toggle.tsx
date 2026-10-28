export function Toggle({
                           on,
                           onChange,
                           title,
                           sub,
                           disabled,
                       }: {
    on: boolean;
    onChange: () => void;
    title: string;
    sub: string;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b py-4 last:border-0">
            <div className="min-w-0">
                <div className="text-sm font-medium">{title}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={title}
                disabled={disabled}
                onClick={onChange}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 enabled:active:scale-95 disabled:opacity-60 ${on ? "bg-primary" : "bg-foreground/15"}`}
            >
        <span
            className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-out ${on ? "translate-x-5" : "translate-x-0"}`}
        />
            </button>
        </div>
    );
}