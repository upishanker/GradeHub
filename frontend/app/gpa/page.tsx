"use client"
import useSWR from "swr";
import {Chart as ChartJS, ArcElement, Legend } from "chart.js";
import {Doughnut} from "react-chartjs-2";
import {NavBar} from "@/components/Navbar";
import {Card, CardHeader, CardContent, CardFooter} from "@/components/ui/card";
import courseAndGradeFetcher from "@/utils/fetchers"


const gpaFetcher = async (url: string) => {
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

export default function Gpa() {

    const { data: gpa, error: gpaError } = useSWR("http://localhost:8080/api/users/gpa", gpaFetcher);
    const { data: courses, error, isLoading } = useSWR("http://localhost:8080/api/courses?v=2", courseAndGradeFetcher)
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
    // Helper function to convert letter grade to GPA points
    const letterToGpaPoints = (letterGrade: string): number => {
        const gradeMap: { [key: string]: number } = {
            'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'D-': 0.7, 'F': 0.0
        };
        return gradeMap[letterGrade] || 0.0;
    };

    const totals = courses?.reduce((acc, course) => {
        if (course.creditHours && course.creditHours > 0 && course.letterGrade) {
            const gradePoints = letterToGpaPoints(course.letterGrade);
            const totalGradePoints = gradePoints * course.creditHours;
            return {
                totalGradePoints: acc.totalGradePoints + totalGradePoints,
                totalCreditHours: acc.totalCreditHours + course.creditHours
            };
        }
        return acc;
    }, { totalGradePoints: 0, totalCreditHours: 0 }) || { totalGradePoints: 0, totalCreditHours: 0 };
    return (
        <div>
            <NavBar />
            <div className="flex justify-around mt-50">
                <div>
                    <Doughnut data={gpaData} height={200} width={200}
                              options={{maintainAspectRatio: false, responsive: false, rotation: 180}}
                    />
                    <h1 className="text-4xl text-center mt-5">GPA: {gpa}</h1>
                </div>
                <Card className="w-100 h-145 overflow-auto">
                    <CardHeader className="text-2xl font-semibold text-center">GPA Details</CardHeader>
                    <CardContent>
                        {courses?.map((course) => (
                            <Card key={course.id} className="mb-3">
                                <CardHeader className="flex justify-between">
                                    <h1>{course.name}</h1>
                                    <div className="text-zinc-500">{course.semester}</div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between">
                                        <h1>Credit Hours: {course.creditHours ?? "N/A"}</h1>
                                        <h1>Grade: {course.letterGrade ?? "N/A"}</h1>
                                    </div>
                                    <h1 className="mt-2 text-center">Grade Points: {course.letterGrade ? (letterToGpaPoints(course.letterGrade) * course.creditHours).toFixed(2) : "N/A"}</h1>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                    <CardFooter className="flex justify-between text-center gap-3">
                        <h1 className="bg-neutral-700 rounded-full p-3">Total Grade Points: {totals.totalGradePoints}</h1>
                        <h1 className="bg-neutral-700 rounded-full p-3">Total Credit Hours: {totals.totalCreditHours}</h1>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}