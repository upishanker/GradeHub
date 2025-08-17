"use client"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {NavBar} from "@/app/navbar/Navbar";
import {useEffect, useState} from "react";
import {Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {Doughnut} from "react-chartjs-2";
import Link from "next/link";
import { Plus } from "lucide-react"
import useSWR from "swr";
import {ThemeProvider} from "@/components/theme-provider";
import {ModeToggle} from "@/components/ui/darkmodetoggle";

const fetcher = async (url: string) => {
    const token = localStorage.getItem("token");
    console.log("Fetching Courses");
    const response = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error("Failed to fetch courses");
    const courses = await response.json();

    const coursesWithGrades = await Promise.all(
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
    return coursesWithGrades;
}
const fetcher2 = async (url: string) => {
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

const toLetterGrade = (grade) => {
    let letterGrade = "N/A"
    if (grade >= 92) {
        letterGrade = "A"
    }
    else if (grade >= 90) {
        letterGrade = "A-"
    }
    else if (grade >= 87) {
        letterGrade = "B+"
    }
    else if (grade >= 82) {
        letterGrade = "B"
    }
    else if (grade >= 80) {
        letterGrade = "B-"
    }
    else if (grade >= 77) {
        letterGrade = "C+"
    }
    else if (grade >= 72) {
        letterGrade = "C"
    }
    else if (grade >= 70) {
        letterGrade = "C-"
    }
    else if (grade >= 67) {
        letterGrade = "D+"
    }
    else if (grade >= 62) {
        letterGrade = "D"
    }
    else if (grade >= 60) {
        letterGrade = "D-"
    }
    else if (grade < 60) {
        letterGrade = "F"
    }
    return letterGrade;
}
export default function Dashboard() {
    const { data: classes, error, isLoading } = useSWR("http://localhost:8080/api/courses?v=2", fetcher)
    if(error) {
        console.error("SWR Error:", error);
        return 'An error has occured'
    }
    const { data: assignmentsData, assignmentError}  = useSWR("http://localhost:8080/api/assignments/upcoming", fetcher2);
    const assignments = assignmentsData ?? [];
    if (assignmentError) {
        console.error(assignmentError);
        return 'An error has occurred';
    }
    const { data: gpa, gpaError } = useSWR("http://localhost:8080/api/users/gpa", fetcher2);
    if (gpaError) {
        return 'An error has occurred';
    }
    const data = {
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

    return (
        <>
        <NavBar />
            <h1 className="text-center text-5xl font-bold mt-25">Dashboard</h1>
            <div className="flex justify-around items-center min-h-screen relative">
                <div className="grid grid-cols-2 gap-5 w-1/3 auto-rows-fr">
                    {classes?.map((course) => (
                        <Card key={course.id}>
                            <CardHeader className="flex justify-between">
                                <h1>{course.name}</h1>
                                <div className="text-zinc-500">{course.semester}</div>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <h1>Grade: {course.grade ?? "N/A"}% ({toLetterGrade(course.grade)})</h1>
                            </CardContent>
                            <CardFooter className="flex justify-center">
                                <Button asChild>
                                    <Link href={"/course?id="+course.id}>
                                        Go To Course
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    <Button asChild className="h-50 rounded-0.5rem">
                        <Link href="/addcourse">
                            Add Course
                            <Plus />
                        </Link>
                    </Button>
                </div>
                <Card className="w-100 h-145 overflow-auto">
                    <CardHeader className="text-2xl font-semibold text-center">
                        Upcoming Assignments
                    </CardHeader>
                    {assignments?.map((assignment) => {
                        const courseName = classes?.find(c => c.id === assignment.courseId)?.name ?? "Unknown Course";
                        return (
                            <CardContent key={`${assignment.courseId}-${assignment.id}`}>
                                <Card className="h-25 w-85 mr-auto ml-auto -mb-2">
                                    <div className="flex justify-around">
                                        <div>
                                            <h1>{assignment.name}</h1>
                                            <h1 className="text-zinc-500">{courseName}</h1>
                                        </div>
                                        <div>
                                            <h1>{new Date(assignment.dueDate).toLocaleString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}</h1>
                                            <h1 className="text-right">{assignment.grade}</h1>
                                        </div>
                                    </div>
                                </Card>
                            </CardContent>
                        )
                    })}

                    <CardFooter>

                    </CardFooter>
                </Card>
                <div>
                    <Doughnut data={data} height={200} width={200} options={{ maintainAspectRatio: false, responsive: false, rotation: 180}} className="mr-auto ml-auto"/>
                    <h1 className="text-4xl text-center mt-5">GPA: {gpa}</h1>
                </div>
            </div>
        </>
    )
}