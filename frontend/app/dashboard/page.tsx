"use client"
import {Card, CardContent, CardFooter, CardHeader,} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {NavBar} from "@/app/navbar/Navbar";
import {ArcElement, Chart as ChartJS, Legend} from "chart.js";
import {Doughnut} from "react-chartjs-2";
import Link from "next/link";
import {Plus} from "lucide-react"
import useSWR from "swr";
import BlankState from "@/components/blank-state";
// Removed courseAndGradeFetcher import - using simple fetcher instead

const fetcher = async (url: string) => {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch");
    }
    return await response.json();
};


ChartJS.register(ArcElement, Legend)

export default function Dashboard() {
    const { data: courses, error, isLoading } = useSWR("http://localhost:8080/api/courses?v=2", fetcher)
    if(error) {
        console.error("SWR Error:", error);
        return 'An error has occured'
    }
    const {data: pastCourses, error: pastCourseError} = useSWR("http://localhost:8080/api/pastcourses", fetcher)
    const { data: assignmentsData, error: assignmentError}  = useSWR("http://localhost:8080/api/assignments/upcoming", fetcher);
    const assignments = assignmentsData ?? [];
    if (assignmentError) {
        console.error(assignmentError);
        return 'An error has occurred';
    }
    const { data: gpa, error: gpaError } = useSWR("http://localhost:8080/api/users/gpa", fetcher);
    if (gpaError) {
        return 'An error has occurred';
    }
    const gpaData = {
        datasets: [
            {
                data: [gpa, 4 - gpa],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.2)',
                    'rgba(128, 128, 128, 0.2)'
                ],
                borderWidth: 1,
            },
        ],
    }
    if(isLoading)  {
        return 'Loading...';
    }
    if (!courses || courses.length === 0) {
        return <div><BlankState></BlankState></div>;
    }
    return (
        <>
            <NavBar/><h1 className="text-center text-5xl font-bold mt-25">Dashboard</h1>
            <div className="flex justify-around items-center min-h-screen relative">
                <div className="grid grid-cols-2 gap-5 w-1/3 auto-rows-fr">
                    {courses?.map((course) => (
                        <Card key={course.id}>
                            <CardHeader className="flex justify-between">
                                <h1>{course.name}</h1>
                                <div className="text-zinc-500">{course.semester}</div>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <h1>Grade: {course.grade ?? "N/A"}% ({course.letterGrade ?? "N/A"})</h1>
                            </CardContent>
                            <CardFooter className="flex justify-center">
                                <Button asChild>
                                    <Link href={"/course?id=" + course.id}>
                                        Go To Course
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    <Button asChild className="h-50 rounded-0.5rem">
                        <Link href="/addcourse">
                            Add Course
                            <Plus/>
                        </Link>
                    </Button>
                </div>
                <Card className="w-100 h-145 overflow-auto">
                    <CardHeader className="text-2xl font-semibold text-center">
                        Upcoming Assignments
                    </CardHeader>

                    {(!assignments || assignments.length === 0) ? (
                        <CardContent className="text-center text-zinc-500">
                            No upcoming assignments 🎉
                        </CardContent>
                    ) : (
                        assignments.map((assignment) => {
                            const courseName =
                                courses?.find((c) => c.id === assignment.courseId)?.name ??
                                "Unknown Course";

                            return (
                                <CardContent key={`${assignment.courseId}-${assignment.id}`}>
                                    <Card className="h-25 w-85 mr-auto ml-auto -mb-2">
                                        <div className="flex justify-around">
                                            <div>
                                                <h1>{assignment.name}</h1>
                                                <h1 className="text-zinc-500">{courseName}</h1>
                                            </div>
                                            <div>
                                                <h1>
                                                    {new Date(assignment.dueDate).toLocaleString(undefined, {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </h1>
                                                <h1 className="text-right">{assignment.grade}</h1>
                                            </div>
                                        </div>
                                    </Card>
                                </CardContent>
                            );
                        })
                    )}

                    <CardFooter />
                </Card>
                <div className="flex flex-col">
                    <Link href="/gpa"><Doughnut data={gpaData} height={200} width={200}
                                                options={{maintainAspectRatio: false, responsive: false, rotation: 180}}
                                                className="mr-auto ml-auto transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:cursor-pointer"
                    /></Link>
                    <h1 className="text-4xl text-center mt-5">GPA: {gpa}</h1>
                    <Button asChild className="mt-5">
                        <Link href={"/gpa"}>
                            GPA Details
                        </Link>
                    </Button>
                </div>
            </div>
            <div>
                <h1 className="text-center text-3xl font-bold mb-3">Past Courses</h1>
                {pastCourses?.map((pastCourse) => (
                    <Card className="w-full max-w-xl mx-auto" key={pastCourse.id}>
                        <CardHeader className="flex justify-between">
                            <h1>{pastCourse.name}</h1>
                            <div className="text-zinc-500">{pastCourse.semester}</div>
                        </CardHeader>
                        <CardContent className="flex justify-around">
                            <h1>Credit Hours: {pastCourse.creditHours}</h1>
                            <h1>Letter Grade: {pastCourse.letterGrade}</h1>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="mx-auto"
                                variant="destructive"
                                onClick={() =>
                                    fetch(`http://localhost:8080/api/pastcourses/${parseInt(pastCourse.id)}`, {
                                        method: 'DELETE',
                                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                    })
                                }
                            >
                                Delete Course
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                <div className="w-full max-w-xl mx-auto mt-4 mb-30">
                    <Button asChild className="w-full rounded-[0.5rem]">
                        <Link href="/addpastcourse">
                            Add Past Course
                            <Plus />
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    )
}