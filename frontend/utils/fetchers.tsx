const courseAndGradeFetcher = async (url: string) => {
    const token = localStorage.getItem("token");
    console.log("Fetching Courses");
    const response = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error("Failed to fetch courses");
    const courses = await response.json();

    return await Promise.all(
        courses.map(async (course: any) => {
            const gradeRes = await fetch(`http://localhost:8080/api/courses/${course.id}/grade`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const grade = gradeRes.ok ? await gradeRes.json() : null;
            console.log(course.id, grade);
            return {...course, grade};
        })
    );
}

export default courseAndGradeFetcher;