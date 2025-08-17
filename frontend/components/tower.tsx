export default function Tower({ items }: { items: { name: string; weight: number }[] }) {
    // Sort heaviest → lightest
    const sorted = [...items].sort((a, b) => b.weight - a.weight);

    // Normalize weights to width percentages
    const maxWeight = sorted[0].weight;

    return (
        <div className="flex flex-col-reverse items-center h-full">
            {sorted.map((item, i) => {
                const widthPercent = (item.weight / maxWeight) * 100;

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
