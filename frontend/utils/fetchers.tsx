import { apiGet } from "@/utils/api";

/**
 * SWR fetcher that loads courses and enriches each one with its computed grade.
 * `path` is a backend-relative path (e.g. "/api/courses?v=2").
 */
const courseAndGradeFetcher = async (path: string) => {
    const courses = await apiGet<any[]>(path);

    return await Promise.all(
        courses.map(async (course: any) => {
            const grade = await apiGet(`/api/courses/${course.id}/grade`).catch(() => null);
            return { ...course, grade };
        })
    );
};

export default courseAndGradeFetcher;
