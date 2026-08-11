export type GradeScale = {
    letter: string;
    minPercent: number;  // cutoff for that letter grade
    gpaValue: number;    // GPA points for that letter grade
};

/**
 * Domain types mirroring the backend DTO response records.
 *
 * Java -> TS mapping notes:
 *   Long           -> number
 *   Double         -> number
 *   BigDecimal     -> number   (Jackson serializes as a JSON number)
 *   LocalDateTime  -> string   (ISO-8601, e.g. "2026-05-01T23:59:00")
 *   boolean        -> boolean
 *
 * Fields that the backend may leave unset are marked `| null`.
 */

/** `dto/course/Response` — GET /api/courses, GET /api/courses/{id} */
export interface Course {
    userId: number;
    id: number;
    name: string;
    goal: number | null;
    semester: string | null;
    creditHours: number | null;
    /** Computed percent grade (BigDecimal on the backend). */
    grade: number | null;
    letterGrade: string | null;
}

/** `dto/assignment/Response` — GET /api/assignments?courseId=, /api/assignments/upcoming */
export interface Assignment {
    courseId: number;
    /** Null for assignments that carry their own weight instead of a category. */
    categoryId: number | null;
    id: number;
    name: string;
    grade: number | null;
    weight: number | null;
    /** LocalDateTime serialized as an ISO-8601 string. */
    dueDate: string | null;
}

/** `dto/category/Response` — GET /api/categories?courseId= */
export interface Category {
    id: number;
    courseId: number;
    name: string;
    weight: number | null;
}

/** `dto/user/Response` — GET /api/users (profile), PATCH /api/users */
export interface User {
    id: number;
    username: string;
    email: string;
    /** e.g. "GOOGLE" for Google-linked accounts, null/"LOCAL" otherwise. */
    provider: string | null;
    passwordSet: boolean;
}

/** `dto/pastcourse/Response` — GET /api/pastcourses */
export interface PastCourse {
    userId: number;
    id: number;
    name: string;
    semester: string | null;
    creditHours: number | null;
    letterGrade: string | null;
}
