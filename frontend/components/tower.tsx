export default function Tower({ items }: { items: { name: string; weight: number }[] }) {
    // Sort heaviest → lightest
    const sorted = [...(items ?? [])].sort((a, b) => b.weight - a.weight);

    // `sorted[0]` is undefined for an empty list, which used to throw.
    if (sorted.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Nothing to show yet.
            </div>
        );
    }

    // Normalize weights to width percentages. Guard against a 0 / negative /
    // non-finite max so the width below can never be Infinity or NaN.
    const topWeight = sorted[0].weight;
    const maxWeight = Number.isFinite(topWeight) && topWeight > 0 ? topWeight : 0;

    return (
        <div className="flex flex-col-reverse items-center h-full">
            {sorted.map((item, i) => {
                const widthPercent =
                    maxWeight > 0 && Number.isFinite(item.weight)
                        ? Math.max(0, Math.min(100, (item.weight / maxWeight) * 100))
                        : 0;

                return (
                    <div
                        key={i}
                        className="bg-blue-500 text-white text-center py-2 rounded-md mb-2"
                        style={{ width: `${widthPercent}%` }}
                    >
                        {item.name} ({item.weight})
                    </div>
                );
            })}
        </div>
    );
}
