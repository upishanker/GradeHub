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
    DEFAULT_COURSE_LETTER_SCALE,
    DEFAULT_GPA_SCALE,
} from "@/utils/helpers";
import toast from "react-hot-toast";
import Link from "next/link";
import {Plus, Trash2} from "lucide-react";
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

    const removeCourseScaleRow = (courseId: number, idx: number) => {
        const current = courseScales[courseId] ?? [];
        const updated = current.filter((_, i) => i !== idx);
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
        // Single source of truth lives in utils/helpers; copy the rows so the
        // shared constant is never mutated by the editor below.
        const defaults: CourseLetterRow[] = DEFAULT_COURSE_LETTER_SCALE.map((r) => ({
            ...r,
        }));
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

    const removeGpaRow = (idx: number) => {
        setLocalGpa(workingGpa.filter((_, i) => i !== idx));
    };

    const loadDefaultGpaScale = () => {
        // Same shared table as utils/helpers uses for its fallback.
        setLocalGpa(DEFAULT_GPA_SCALE.map((r) => ({ ...r })));
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
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            aria-label={`Remove ${row.letter || "row"}`}
                                                                            className="text-destructive"
                                                                            onClick={() =>
                                                                                removeCourseScaleRow(c.id, idx)
                                                                            }
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
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
                                    <Button onClick={loadDefaultGpaScale}>
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
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Remove ${row.letter || "row"}`}
                                                className="text-destructive"
                                                onClick={() => removeGpaRow(idx)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 mt-3">
                                    <Button variant="outline" onClick={addGpaRow}>
                                        Add Row
                                    </Button>
                                    <Button onClick={saveGpaScale}>Save GPA Scale</Button>
                                    <Button variant="secondary" onClick={loadDefaultGpaScale}>
                                        Load Defaults
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}