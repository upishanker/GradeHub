import { apiGet } from "@/utils/api";
import type { Course } from "@/utils/types";

/**
 * SWR fetcher that loads courses and enriches each one with its computed grade.
 * `path` is a backend-relative path (e.g. "/api/courses?v=2").
 */
const courseAndGradeFetcher = async (path: string) => {
    const courses = await apiGet<Course[]>(path);

    return await Promise.all(
        courses.map(async (course) => {
            const grade = await apiGet<number>(`/api/courses/${course.id}/grade`).catch(() => null);
            return { ...course, grade };
        })
    );
};

export default courseAndGradeFetcher;
