import { GradeScale } from "@/utils/types";

// Cached user GPA scale (letter -> gpaValue), from /api/gradescale
// Only the letter -> gpaValue half of GradeScale is relevant here.
export type GpaScaleRow = Pick<GradeScale, "letter" | "gpaValue">;
let userGpaScale: GpaScaleRow[] = [];

// Optional: cached course-specific letter->minPercent mapping.
// Keyed by courseId. Populate this after fetching /api/courses/{courseId}/gradescale.
type CourseLetterPercent = Record<string, number>;
const courseLetterPercentByCourseId: Record<string | number, CourseLetterPercent> = {};

export type CourseScaleRow = Pick<GradeScale, "letter" | "minPercent">;

/**
 * Single source of truth for the default percent -> letter thresholds.
 * Mirrors the backend `CourseGradeScale.createDefaultGradeScales(course)`
 * exactly (92 / 82 / 72 / 62 for the whole-letter cutoffs).
 *
 * The Settings page imports this for its "Load Default Scale" buttons so the
 * table only ever lives in one place.
 */
export const DEFAULT_COURSE_LETTER_SCALE: CourseScaleRow[] = [
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

/**
 * Single source of truth for the default letter -> GPA points table (standard
 * US 4.0 scale). Used as the fallback whenever the user has not configured a
 * custom GPA scale, and by the Settings page's "Load Default GPA Scale" button.
 */
export const DEFAULT_GPA_SCALE: GpaScaleRow[] = [
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

// Lookup form of DEFAULT_COURSE_LETTER_SCALE, derived so the two cannot drift.
const defaultLetterToPercent: Record<string, number> = Object.fromEntries(
    DEFAULT_COURSE_LETTER_SCALE.map((r) => [r.letter, r.minPercent])
);

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

/**
 * Resolves a letter grade to GPA points using, in order:
 *   1) The user's configured scale (populated by the Settings page via
 *      {@link setUserGpaScale}),
 *   2) The standard 4.0 table in {@link DEFAULT_GPA_SCALE}.
 *
 * The fallback matters because the cache is in-memory only: a user who lands
 * directly on /gpa without visiting /settings first has an empty cache, and
 * previously every course scored 0.0 grade points.
 */
export const letterToGpaPoints = (letter: string): number => {
    if (!letter) return 0;
    const match = userGpaScale.find((s) => s.letter === letter);
    if (match) return match.gpaValue;

    const fallback = DEFAULT_GPA_SCALE.find((s) => s.letter === letter);
    return fallback ? fallback.gpaValue : 0;
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