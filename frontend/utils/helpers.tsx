import { GradeScale } from "@/utils/types";

// Cached user GPA scale (letter -> gpaValue), from /api/gradescale
// Only the letter -> gpaValue half of GradeScale is relevant here.
export type GpaScaleRow = Pick<GradeScale, "letter" | "gpaValue">;
let userGpaScale: GpaScaleRow[] = [];

// Optional: cached course-specific letter->minPercent mapping.
// Keyed by courseId. Populate this after fetching /api/courses/{courseId}/gradescale.
type CourseLetterPercent = Record<string, number>;
const courseLetterPercentByCourseId: Record<string | number, CourseLetterPercent> = {};

// Default percent thresholds matching backend default CourseGradeScale.createDefaultGradeScales(course)
const defaultLetterToPercent: Record<string, number> = {
    "A": 93,
    "A-": 90,
    "B+": 87,
    "B": 83,
    "B-": 80,
    "C+": 77,
    "C": 73,
    "C-": 70,
    "D+": 67,
    "D": 63,
    "D-": 60,
    "F": 0,
};

export const setUserGpaScale = (newScale: GpaScaleRow[]) => {
    userGpaScale = newScale || [];
};

// Call this after fetching a course’s grade scale from the backend:
export const setCourseLetterPercentScale = (
    courseId: string | number,
    rows: { letter: string; minPercent: number }[]
) => {
    const map: CourseLetterPercent = {};
    for (const r of rows) {
        map[r.letter] = r.minPercent;
    }
    courseLetterPercentByCourseId[courseId] = map;
};

export const letterToGpaPoints = (letter: string): number => {
    if (!letter) return 0;
    const match = userGpaScale.find((s) => s.letter === letter);
    return match ? match.gpaValue : 0;
};

// Resolve a letter to a percent using, in order:
// 1) A course-specific scale if provided,
// 2) The default mapping that mirrors backend defaults.
export const letterToPercent = (
    letter: string,
    options?: { courseId?: string | number }
): number => {
    if (!letter) return 0;

    if (options?.courseId != null) {
        const courseMap = courseLetterPercentByCourseId[options.courseId];
        if (courseMap && typeof courseMap[letter] === "number") {
            return courseMap[letter];
        }
    }

    // Fall back to default mapping that matches backend default CourseGradeScale
    return typeof defaultLetterToPercent[letter] === "number"
        ? defaultLetterToPercent[letter]
        : 0;
};

// Converts either a numeric input or a letter grade to a numeric percent for backend.
// Pass courseId when available to honor course-specific scales.
export const toNumberGrade = (
    value: string | number,
    options?: { courseId?: string | number }
): number => {
    if (value === null || value === undefined) return 0;

    // If already a number, clamp to [0, 100] and return
    if (typeof value === "number" && !Number.isNaN(value)) {
        return Math.max(0, Math.min(100, value));
    }

    if (typeof value === "string") {
        // If it's a numeric string, parse it
        const numeric = Number(value);
        if (!Number.isNaN(numeric)) {
            return Math.max(0, Math.min(100, numeric));
        }
        // Otherwise treat as letter
        return letterToPercent(value, { courseId: options?.courseId });
    }

    return 0;
};