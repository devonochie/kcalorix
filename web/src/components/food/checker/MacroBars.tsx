type Props = {
    totals: { p: number; c: number; f: number };
    targets: { proteinG: number; carbsG: number; fatG: number };
};

export function MacroBars({ totals, targets }: Props) {
    const bars = [
        ["Protein", totals.p, targets.proteinG],
        ["Carbs", totals.c, targets.carbsG],
        ["Fat", totals.f, targets.fatG],
    ] as const;

    return (
        <div className="mt-6 grid grid-cols-3 gap-4">
            {bars.map(([l, v, t]) => (
                <div key={l}>
                    <div className="flex justify-between text-xs">
                        <span className="font-medium">{l}</span>
                        <span className="text-muted-foreground">{v} g</span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${t > 0 ? Math.min(100, (v / t) * 100) : 0}%` }} />
                    </div>
                </div>
            ))}
        </div>
    );
}