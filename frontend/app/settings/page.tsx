"use client";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {NavBar} from "@/app/navbar/Navbar";


const fetcher = async (url: string) => {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch");
    }
    return await response.json();
};

type GradeScale = {
    id?: number;
    letter: string;
    minPercent: number;
    gpaValue: number;
};

export default function SettingsPage() {
    const { data: scales, error, isLoading } = useSWR<GradeScale[]>(
        "http://localhost:8080/api/gradescale",
        fetcher
    );

    const [localScales, setLocalScales] = useState<GradeScale[] | null>(null);

    // if no local edits yet, use fetched data
    const workingScales = localScales ?? scales ?? [];

    const handleChange = (
        index: number,
        field: keyof GradeScale,
        value: string
    ) => {
        const updated = [...workingScales];
        if (field === "minPercent" || field === "gpaValue") {
            updated[index][field] = parseFloat(value);
        } else {
            updated[index][field] = value;
        }
        setLocalScales(updated);
    };

    const handleSave = async () => {
        const token = localStorage.getItem("token");
        await fetch("http://localhost:8080/api/gradescale", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(workingScales),
        });

        // reset local state & revalidate SWR cache
        setLocalScales(null);
        mutate("http://localhost:8080/api/gradescale");
        alert("Grading scale updated!");
    };

    if (isLoading) return <p>Loading grading scale…</p>;
    if (error) return <p className="text-red-500">Failed to load scale</p>;

    const isEmpty = !workingScales || workingScales.length === 0;

    return (
        <>
            <NavBar />
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6">Grading Scale Settings</h1>

                {isEmpty ? (
                    <div className="text-zinc-500">
                        No grading scale configured yet.
                        <div className="mt-4">
                            <Button
                                onClick={() => {
                                    const defaults = [
                                        { letter: "A", minPercent: 92, gpaValue: 4.0 },
                                        { letter: "A-", minPercent: 90, gpaValue: 3.75 },
                                        { letter: "B+", minPercent: 87, gpaValue: 3.3},
                                        { letter: "B", minPercent: 82, gpaValue: 3.0 },
                                        { letter: "B-", minPercent: 80, gpaValue: 2.7},
                                        { letter: "C+", minPercent: 77, gpaValue: 2.3},
                                        { letter: "C", minPercent: 72, gpaValue: 2.0},
                                        { letter: "C-", minPercent: 70, gpaValue: 1.7},
                                        { letter: "D+", minPercent: 67, gpaValue: 1.3},
                                        { letter: "D", minPercent: 62, gpaValue: 1.0 },
                                        { letter: "D-", minPercent: 60, gpaValue: 0.7},
                                        { letter: "F", minPercent: 0, gpaValue: 0.0 },
                                    ] as GradeScale[];
                                    setLocalScales(defaults);
                                }}
                            >
                                Load Default Scale
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {workingScales.map((scale, idx) => (
                                <div key={idx} className="flex gap-4 items-center">
                                    <input
                                        type="text"
                                        value={scale.letter}
                                        onChange={(e) => handleChange(idx, "letter", e.target.value)}
                                        className="border p-2 rounded w-16 text-center"
                                    />
                                    <input
                                        type="number"
                                        value={scale.minPercent}
                                        onChange={(e) => handleChange(idx, "minPercent", e.target.value)}
                                        className="border p-2 rounded w-24"
                                    />
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={scale.gpaValue}
                                        onChange={(e) => handleChange(idx, "gpaValue", e.target.value)}
                                        className="border p-2 rounded w-24"
                                    />
                                </div>
                            ))}
                        </div>
                        <Button
                            className="mt-4"
                            onClick={() => {
                                const next = (localScales ?? scales ?? []).slice();
                                next.push({ letter: "", minPercent: 0, gpaValue: 0 });
                                setLocalScales(next);
                            }}
                        >
                            Add Row
                        </Button>
                        <Button onClick={handleSave} className="mt-6">
                            Save Changes
                        </Button>
                    </>
                )}
            </div>
        </>
    );
}
