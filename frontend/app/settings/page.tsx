"use client";
import React, { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { NavBar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// NEW: import helper sync functions
import {
    setUserGpaScale,
    setCourseLetterPercentScale,
} from "@/utils/helpers";
import toast from "react-hot-toast";
import Link from "next/link";
import {Plus} from "lucide-react";
import {apiFetcher, apiGet, apiPut} from "@/utils/api";

type Course = {
    id: number;
    name: string;
    semester?: string;
};

type CourseLetterRow = {
    id?: number;
    letter: string;
    minPercent: number;
};

type UserGpaRow = {
    id?: number;
    letter: string;
    gpaValue: number;
};

const fetcher = apiFetcher;

export default function SettingsPage() {
    const { data: courses } = useSWR<Course[]>(
        "/api/courses",
        fetcher
    );

    // User-level GPA scale (letter -> GPA)
    const { data: gpaScale } = useSWR<UserGpaRow[]>(
        "/api/gradescale",
        fetcher
    );

    // Keep helpers in sync when SWR GPA scale changes
    useEffect(() => {
        if (gpaScale) {
            setUserGpaScale(gpaScale);
        }
    }, [gpaScale]);

    // Local editable state for GPA scale
    const [localGpa, setLocalGpa] = useState<UserGpaRow[] | null>(null);
    const workingGpa = localGpa ?? gpaScale ?? [];

    // Track expanded courses and their local editable letter scales
    const [expandedCourseIds, setExpandedCourseIds] = useState<
        Record<number, boolean>
    >({});
    const [courseScales, setCourseScales] = useState<
        Record<number, CourseLetterRow[]>
    >({});
    const [courseScalesDirty, setCourseScalesDirty] = useState<
        Record<number, boolean>
    >({});

    const toggleCourse = async (courseId: number) => {
        const next = {
            ...expandedCourseIds,
            [courseId]: !expandedCourseIds[courseId],
        };
        setExpandedCourseIds(next);

        // On expand, load scale if not loaded
        if (!expandedCourseIds[courseId] && !courseScales[courseId]) {
            const data: CourseLetterRow[] = await apiGet<CourseLetterRow[]>(
                `/api/courses/${courseId}/gradescale`
            ).catch(() => []);
            setCourseScales((prev) => ({ ...prev, [courseId]: data }));

            // Sync helpers with fetched per-course scale
            setCourseLetterPercentScale(courseId, data);
        }
    };

    const updateCourseScaleField = (
        courseId: number,
        idx: number,
        field: keyof CourseLetterRow,
        value: string
    ) => {
        const current = courseScales[courseId] ?? [];
        const updated = current.slice();
        if (field === "minPercent") {
            updated[idx] = { ...updated[idx], minPercent: parseFloat(value) };
        } else if (field === "letter") {
            updated[idx] = { ...updated[idx], letter: value };
        }
        setCourseScales((prev) => ({ ...prev, [courseId]: updated }));
        setCourseScalesDirty((prev) => ({ ...prev, [courseId]: true }));
    };

    const addCourseScaleRow = (courseId: number) => {
        const current = courseScales[courseId] ?? [];
        const updated = current.concat([{ letter: "", minPercent: 0 }]);
        setCourseScales((prev) => ({ ...prev, [courseId]: updated }));
        setCourseScalesDirty((prev) => ({ ...prev, [courseId]: true }));
    };

    const saveCourseScale = async (courseId: number) => {
        const rows = courseScales[courseId] ?? [];
        try {
            await apiPut(`/api/courses/${courseId}/gradescale`, rows);
        } catch (err) {
            console.error(err);
            toast.error("Failed to save course scale");
            return;
        }

        // Sync helpers immediately with the just-saved rows
        setCourseLetterPercentScale(courseId, rows);

        setCourseScalesDirty((prev) => ({ ...prev, [courseId]: false }));
        toast.success("Course scale saved.");
    };

    const loadDefaultCourseScale = (courseId: number) => {
        const defaults: CourseLetterRow[] = [
            { letter: "A", minPercent: 92 },
            { letter: "A-", minPercent: 90 },
            { letter: "B+", minPercent: 87 },
            { letter: "B", minPercent: 82 },
            { letter: "B-", minPercent: 80 },
            { letter: "C+", minPercent: 77 },
            { letter: "C", minPercent: 72 },
            { letter: "C-", minPercent: 70 },
            { letter: "D+", minPercent: 67 },
            { letter: "D", minPercent: 62 },
            { letter: "D-", minPercent: 60 },
            { letter: "F", minPercent: 0 },
        ];
        setCourseScales((prev) => ({ ...prev, [courseId]: defaults }));
        setCourseScalesDirty((prev) => ({ ...prev, [courseId]: true }));

        // Sync helpers immediately with defaults the user sees
        setCourseLetterPercentScale(courseId, defaults);
    };

    // GPA scale handlers
    const changeGpaField = (
        idx: number,
        field: keyof UserGpaRow,
        value: string
    ) => {
        const working = workingGpa.slice();
        if (field === "gpaValue") {
            working[idx] = { ...working[idx], gpaValue: parseFloat(value) };
        } else if (field === "letter") {
            working[idx] = { ...working[idx], letter: value };
        }
        setLocalGpa(working);
    };

    const addGpaRow = () => {
        const working = (localGpa ?? gpaScale ?? []).slice();
        working.push({ letter: "", gpaValue: 0 });
        setLocalGpa(working);
    };

    const saveGpaScale = async () => {
        try {
            await apiPut("/api/gradescale", workingGpa);
        } catch (err) {
            console.error(err);
            toast.error("Failed to save GPA scale");
            return;
        }

        // Update helpers immediately with the just-saved values
        setUserGpaScale(workingGpa);

        setLocalGpa(null);
        mutate("/api/gradescale");
        toast.success("GPA scale saved!");
    };

    return (
        <>
            <NavBar />
            <div className="max-w-5xl mx-auto p-6 space-y-10">
                <h1 className="text-3xl font-bold">Grading Scale Settings</h1>

                {/* Section: Per-course letter scales */}
                <Card>
                    <CardHeader>
                        <CardTitle>Per-Course Letter Scale (Percent → Letter)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!courses || courses.length === 0 ? (
                            <>
                                <p className="text-zinc-500">No courses; try adding one!</p>
                                <Button asChild className="h-10 rounded-0.5rem mt-4">
                                    <Link href="/addcourse">
                                        Add Course
                                        <Plus/>
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <div className="space-y-4">
                                {courses.map((c) => {
                                    const isOpen = !!expandedCourseIds[c.id];
                                    const rows = courseScales[c.id];
                                    return (
                                        <div key={c.id} className="border rounded">
                                            <button
                                                className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-zinc-50"
                                                onClick={() => toggleCourse(c.id)}
                                            >
                        <span className="font-medium">
                          {c.name} {c.semester ? `· ${c.semester}` : ""}
                        </span>
                                                <span className="text-sm text-zinc-500">
                          {isOpen ? "Hide" : "Edit"}
                        </span>
                                            </button>

                                            {isOpen && (
                                                <div className="px-4 pb-4 space-y-3">
                                                    {!rows ? (
                                                        <p className="text-zinc-500">Loading scale…</p>
                                                    ) : rows.length === 0 ? (
                                                        <div className="text-zinc-500">
                                                            No scale configured for this course.
                                                            <div className="mt-3">
                                                                <Button
                                                                    onClick={() => loadDefaultCourseScale(c.id)}
                                                                >
                                                                    Load Default Scale
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="space-y-2">
                                                                {rows.map((row, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex gap-3 items-center"
                                                                    >
                                                                        <Label className="w-28">Letter</Label>
                                                                        <Input
                                                                            className="w-28"
                                                                            value={row.letter}
                                                                            onChange={(e) =>
                                                                                updateCourseScaleField(
                                                                                    c.id,
                                                                                    idx,
                                                                                    "letter",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        />
                                                                        <Label className="w-36">Min %</Label>
                                                                        <Input
                                                                            type="number"
                                                                            className="w-36"
                                                                            value={row.minPercent}
                                                                            onChange={(e) =>
                                                                                updateCourseScaleField(
                                                                                    c.id,
                                                                                    idx,
                                                                                    "minPercent",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="flex gap-3 mt-3">
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => addCourseScaleRow(c.id)}
                                                                >
                                                                    Add Row
                                                                </Button>
                                                                <Button
                                                                    onClick={() => saveCourseScale(c.id)}
                                                                    disabled={!courseScalesDirty[c.id]}
                                                                >
                                                                    Save Course Scale
                                                                </Button>
                                                                <Button
                                                                    variant="secondary"
                                                                    onClick={() => loadDefaultCourseScale(c.id)}
                                                                >
                                                                    Load Defaults
                                                                </Button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Section: User GPA scale */}
                <Card>
                    <CardHeader>
                        <CardTitle>User GPA Scale (Letter → GPA)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!workingGpa || workingGpa.length === 0 ? (
                            <div className="text-zinc-500">
                                No GPA scale configured.
                                <div className="mt-3">
                                    <Button
                                        onClick={() => {
                                            const defaults: UserGpaRow[] = [
                                                { letter: "A", gpaValue: 4.0 },
                                                { letter: "A-", gpaValue: 3.7 },
                                                { letter: "B+", gpaValue: 3.3 },
                                                { letter: "B", gpaValue: 3.0 },
                                                { letter: "B-", gpaValue: 2.7 },
                                                { letter: "C+", gpaValue: 2.3 },
                                                { letter: "C", gpaValue: 2.0 },
                                                { letter: "C-", gpaValue: 1.7 },
                                                { letter: "D+", gpaValue: 1.3 },
                                                { letter: "D", gpaValue: 1.0 },
                                                { letter: "D-", gpaValue: 0.7 },
                                                { letter: "F", gpaValue: 0.0 },
                                            ];
                                            setLocalGpa(defaults);
                                        }}
                                    >
                                        Load Default GPA Scale
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {workingGpa.map((row, idx) => (
                                        <div key={idx} className="flex gap-3 items-center">
                                            <Label className="w-28">Letter</Label>
                                            <Input
                                                className="w-28"
                                                value={row.letter}
                                                onChange={(e) => changeGpaField(idx, "letter", e.target.value)}
                                            />
                                            <Label className="w-36">GPA</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                className="w-36"
                                                value={row.gpaValue}
                                                onChange={(e) => changeGpaField(idx, "gpaValue", e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 mt-3">
                                    <Button variant="outline" onClick={addGpaRow}>
                                        Add Row
                                    </Button>
                                    <Button onClick={saveGpaScale}>Save GPA Scale</Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}