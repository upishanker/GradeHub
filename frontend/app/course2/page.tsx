"use client"

import { NavBar } from "@/app/navbar/Navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import useSWR, { mutate } from "swr";
import { useSearchParams, useRouter } from "next/navigation";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {FaPencilAlt, FaSave} from "react-icons/fa";

const fetcher = async (url: string) => {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
};

export default function Course() {
    const params = useSearchParams();
    const router = useRouter();
    const search = params.get("id");

    // SWR hooks (always called, never conditional)
    const { data: assignmentData, error: assignmentError } = useSWR(
        `http://localhost:8080/api/assignments?courseId=${search}`,
        fetcher
    );
    const { data: courseData, error: courseError } = useSWR(
        `http://localhost:8080/api/courses/${search}`,
        fetcher
    );
    const { data: categoryData, error: categoryError } = useSWR(
        `http://localhost:8080/api/categories?courseId=${search}`,
        fetcher
    );

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(courseData?.name ?? "");
    const [goal, setGoal] = useState(courseData?.goal ?? "");
    const [semester, setSemester] = useState(courseData?.semester ?? "");
    const [creditHours, setCreditHours] = useState(courseData?.creditHours ?? "");

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
            const res = await fetch(`http://localhost:8080/api/courses/${search}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name, goal, semester, creditHours }),
            });
            if (!res.ok) {
                console.error(await res.text());
                alert("Failed to update");
                return;
            }
            alert("Course updated successfully!");
            setIsEditing(false);
            mutate(`http://localhost:8080/api/courses/${search}`);
        } catch (err) {
            console.error(err);
        }
    };

    // Determine loading or error states
    const isLoading = !assignmentData || !courseData || !categoryData;
    const isError = assignmentError || courseError || categoryError;

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (isError) return <div className="p-8 text-center text-red-600">An error occurred.</div>;

    // Build tower layers: categories + standalone assignments
    const layers = [
        ...(categoryData.map((category: any) => ({
            type: "category",
            id: category.id,
            name: category.name,
            weight: category.weight ?? 0,
            assignments: assignmentData.filter((a: any) => a.categoryId === category.id) ?? [],
        })) ?? []),
        ...(assignmentData
            .filter((a: any) => !a.categoryId)
            .map((assignment: any) => ({
                type: "assignment",
                id: assignment.id,
                name: assignment.name,
                weight: assignment.weight ?? 0,
                assignments: [],
            })) ?? []),
    ];

    // Sort descending by weight
    const sortedLayers = layers.sort((a, b) => b.weight - a.weight);
    const maxWeight = sortedLayers[0]?.weight ?? 1;

    return (
        <div>
            <NavBar />
            <h1 className="text-4xl text-center font-bold mb-8">{courseData?.name}</h1>

            <div className="flex flex-col items-center mt-20 px-4">
                <div className="flex flex-col-reverse items-center w-full max-w-xl">
                    {sortedLayers.map((layer) => {
                        const widthPercent = (layer.weight / maxWeight) * 100;

                        return (
                            <Card
                                key={layer.id}
                                className="bg-neutral-800 text-white mb-4 p-3"
                                style={{ width: `${widthPercent}%` }}
                            >
                                {layer.type === "category" ? (
                                    <div className="flex flex-col">
                                            <CardHeader className="font-bold text-center">{layer.name} ({layer.weight}%)</CardHeader>
                                            <CardContent className="flex mt-2">
                                                {layer.assignments.map((a: any) => (
                                                    <div
                                                        key={a.id}
                                                        className="bg-neutral-50 text-neutral-800 text-sm text-center p-1 mx-1 rounded-sm flex-1"
                                                    >
                                                        {a.name} ({a.grade ?? "N/A"}%)
                                                    </div>
                                                ))}
                                            </CardContent>
                                    </div>
                                ) : (
                                    <div className="text-center font-medium">
                                        {layer.name} ({layer.weight}%)
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {/* Add Category/Assignment Buttons */}
                <div className="flex gap-4 mt-8">
                    <Button asChild>
                        <Link href={`/addcategory?id=${search}`} className="flex items-center gap-1">
                            Add Category <Plus />
                        </Link>
                    </Button>

                    <Button asChild>
                        <Link href={`/addassignment?id=${search}`} className="flex items-center gap-1">
                            Add Assignment <Plus />
                        </Link>
                    </Button>
                </div>
                <Card className="w-full mt-30 h-30">
                    <CardHeader className="flex justify-between items-center">
                        <p className="text-3xl ml-auto mr-auto">Course Information</p>
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
                                    <div className="flex gap-2 justify-around">
                                        <label className="text-2xl">
                                            Name:
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="border p-1 rounded"
                                            />
                                        </label>
                                        <label className="text-2xl">
                                            Goal Grade:
                                            <input
                                                type="number"
                                                value={goal}
                                                onChange={(e) => setGoal(e.target.value)}
                                                className="border p-1 rounded"
                                            />
                                        </label>
                                        <label className="text-2xl">
                                            Semester:
                                            <input
                                                type="text"
                                                value={semester}
                                                onChange={(e) => setSemester(e.target.value)}
                                                className="border p-1 rounded"
                                            />
                                        </label>
                                        <label className="text-2xl">
                                            Credit Hours:
                                            <input
                                                type="number"
                                                value={creditHours}
                                                onChange={(e) => setCreditHours(e.target.value)}
                                                className="border p-1 rounded"
                                            />
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex gap-2 justify-around">
                                        <p className="text-2xl">Name: {courseData?.name}</p>
                                        <p className="text-2xl">Goal Grade: {courseData?.goal}</p>
                                        <p className="text-2xl">Semester: {courseData?.semester}</p>
                                        <p className="text-2xl">Credit Hours: {courseData?.creditHours}</p>
                                    </div>
                                </>
                            )}
                        </>
                    </CardContent>
                </Card>
                {/* Delete Course */}
                <Button
                    variant="destructive"
                    className="mt-6 w-full"
                    onClick={() =>
                        fetch(`http://localhost:8080/api/courses/${search}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                        }).then(() => router.push("/dashboard"))
                    }
                >
                    Delete Course
                </Button>
            </div>
        </div>
    );
}
