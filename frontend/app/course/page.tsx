"use client"
import {NavBar} from "@/app/navbar/Navbar";
import {useEffect, useState} from "react";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Plus} from "lucide-react";
import useSWR, {mutate} from "swr";
import {useSearchParams, useRouter} from "next/navigation";
import {FaPencilAlt, FaSave} from "react-icons/fa";

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




export default function Course() {
    const params = useSearchParams();
    const router = useRouter();
    const search = params.get('id')
    const { data, error } = useSWR("http://localhost:8080/api/assignments?courseId=" + search, fetcher)
    const { data: courseData, error: courseError} = useSWR('http://localhost:8080/api/courses/' + search, fetcher);
    const { data: categoryData, error: categoryError} =  useSWR('http://localhost:8080/api/categories?courseId=' + search, fetcher);

    if(error || courseError || categoryError) return 'An error has occured'
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(courseData?.name ?? "");
    const [goal, setGoal] = useState(courseData?.email ?? "");
    const [semester, setSemester] = useState(courseData?.email ?? "");
    const [creditHours, setCreditHours] = useState(courseData?.email ?? "");

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setName(courseData?.name ?? "");
            setGoal(courseData?.goal ?? "");
            setSemester(courseData?.semester ?? "");
            setCreditHours(courseData?.creditHours ?? "");
        }
    };
    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch('http://localhost:8080/api/courses/' + search, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name, goal, semester,  creditHours })
            })
            if(!res.ok) {
                console.error(await res.text());
                alert("Failed to update");
                return;
            }
            alert("Course update successfully!");
            setIsEditing(false);
            mutate("http://localhost:8080/api/courses/" + search)
        }
        catch (err) {
            console.error(err);
        }
    }
    return (
        <div>
            <NavBar></NavBar>
            <div className="flex items-center">
                <Card className="w-100 ml-4 h-100">
                    <CardHeader className="flex justify-between items-center">
                        <p className="text-3xl">Course Information</p>
                        <>
                            {isEditing ? (
                                <button onClick={handleSave}>
                                    <FaSave />
                                </button>
                            ) : (
                                <button onClick={handleEditToggle}>
                                    <FaPencilAlt />
                                </button>
                            )}
                        </>
                    </CardHeader>
                    <CardContent>
                        <>
                            {isEditing ? (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-2xl">
                                            Name:
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="border p-1 rounded w-full"
                                            />
                                        </label>
                                        <label className="text-2xl">
                                            Goal Grade:
                                            <input
                                                type="number"
                                                value={goal}
                                                onChange={(e) => setGoal(e.target.value)}
                                                className="border p-1 rounded w-full"
                                            />
                                        </label>
                                        <label className="text-2xl">
                                            Semester:
                                            <input
                                                type="text"
                                                value={semester}
                                                onChange={(e) => setSemester(e.target.value)}
                                                className="border p-1 rounded w-full"
                                            />
                                        </label>
                                        <label className="text-2xl">
                                            Credit Hours:
                                            <input
                                                type="number"
                                                value={creditHours}
                                                onChange={(e) => setCreditHours(e.target.value)}
                                                className="border p-1 rounded w-full"
                                            />
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-2xl">Name: {courseData?.name}</p>
                                    <p className="text-2xl">Goal: {courseData?.goal}</p>
                                    <p className="text-2xl">Semester: {courseData?.semester}</p>
                                    <p className="text-2xl">Credit Hours: {courseData?.creditHours}</p>
                                </>
                            )}
                        </>
                    </CardContent>
                </Card>
                <div className="ml-20">
                    <h1 className="text-center text-4xl font-bold mt-40 -mb-30">Categories</h1>
                    <div className="flex justify-center items-center min-h-screen">
                        <div className="grid grid-cols-4 gap-5">
                            {categoryData?.map((category) => (
                                <Card key={category.id}>
                                    <CardHeader>
                                        <h1 className="text-center">{category.name}</h1>
                                    </CardHeader>
                                    <CardContent>
                                        <h1 className="text-center">Weight: {category.weight ?? "N/A"}%</h1>
                                    </CardContent>
                                    <CardFooter className="flex justify-center">
                                        <Button variant="destructive" onClick={async () => {
                                            await fetch('http://localhost:8080/api/categories/' + category.id, { method: 'DELETE' });
                                            mutate("http://localhost:8080/api/categories?courseId=" + search);
                                        }}>
                                            Delete
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                            <Button asChild className="h-50 rounded-0.5rem">
                                <Link href={"/addcategory?id=" + search}>
                                    Add Category
                                    <Plus />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="ml-20">
                    <h1 className="text-center text-4xl font-bold mt-40 -mb-30">Assignments</h1>
                    <div className="flex justify-center items-center min-h-screen">
                        <div className="grid grid-cols-4 gap-5">
                            {data?.map((assignment) => (
                                <Card key={assignment.id}>
                                    <CardHeader>
                                        <h1 className="text-center">{assignment.name}</h1>
                                        <div className="text-zinc-500 text-center">
                                            {new Date(assignment.dueDate).toLocaleString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <h1 className="text-center">Grade: {assignment.grade ?? "N/A"}%</h1>
                                    </CardContent>
                                    <CardFooter className="flex justify-center">
                                        <Button variant="destructive" onClick={async () => {
                                            await fetch('http://localhost:8080/api/assignments/' + assignment.id, { method: 'DELETE' });
                                            mutate("http://localhost:8080/api/assignments?courseId=" + search);
                                        }}>
                                            Delete
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                            <Button asChild className="h-50 rounded-0.5rem">
                                <Link href={"/addassignment?id=" + search}>
                                    Add Assignment
                                    <Plus />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center">
                <Button variant="destructive" onClick={() =>
                fetch('http://localhost:8080/api/courses/' + search, { method: 'DELETE' })
                    .then(() => router.push('/dashboard'))
            }> Delete Course</Button>
            </div>
        </div>
    )

}