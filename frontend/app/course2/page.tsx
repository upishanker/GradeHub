"use client"
import {NavBar} from "@/app/navbar/Navbar";
import {useEffect, useMemo, useState} from "react";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Plus, Folder, ChevronDown, ChevronRight, FileText} from "lucide-react";
import useSWR, {mutate} from "swr";
import {useSearchParams, useRouter} from "next/navigation";
import {FaPencilAlt, FaSave} from "react-icons/fa";

const fetcher = async (url: string) => {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) { throw new Error("Failed to fetch"); }
    return await response.json();
};

export default function Course() {
    const params = useSearchParams();
    const router = useRouter();
    const search = params.get('id');

    const { data: assignments, error: assignmentsError } = useSWR(
        search ? `http://localhost:8080/api/assignments?courseId=${search}` : null,
        fetcher
    );
    const { data: courseData, error: courseError } = useSWR(
        search ? `http://localhost:8080/api/courses/${search}` : null,
        fetcher
    );
    const { data: categories, error: categoryError } = useSWR(
        search ? `http://localhost:8080/api/categories?courseId=${search}` : null,
        fetcher
    );

    if (assignmentsError || courseError || categoryError) return 'An error has occured';

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(courseData?.name ?? "");
    const [goal, setGoal] = useState(courseData?.goal ?? "");
    const [semester, setSemester] = useState(courseData?.semester ?? "");
    const [creditHours, setCreditHours] = useState(courseData?.creditHours ?? "");

    useEffect(() => {
        if (courseData) {
            setName(courseData.name ?? "");
            setGoal(courseData.goal ?? "");
            setSemester(courseData.semester ?? "");
            setCreditHours(courseData.creditHours ?? "");
        }
    }, [courseData]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing && courseData) {
            setName(courseData.name ?? "");
            setGoal(courseData.goal ?? "");
            setSemester(courseData.semester ?? "");
            setCreditHours(courseData.creditHours ?? "");
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8080/api/courses/${search}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name, goal, semester, creditHours })
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

    // Expand/collapse state
    const [openCategoryIds, setOpenCategoryIds] = useState<Record<number, boolean>>({});
    const toggleCategory = (id: number) => {
        setOpenCategoryIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Helper: format due date safely
    const formatDue = (d?: string | null) => {
        if (!d) return null;
        const date = new Date(d);
        return isNaN(date.getTime())
            ? null
            : date.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
    };

    // Precompute assignments grouped by categoryId
    const assignmentsByCategory = useMemo(() => {
        const grouped: Record<string, any[]> = {};
        (assignments ?? []).forEach((a: any) => {
            const key = a.categoryId ?? 'uncategorized';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(a);
        });
        return grouped;
    }, [assignments]);

    const uncategorizedAssignments: any[] = assignmentsByCategory['uncategorized'] ?? [];

    // Build rows: categories + their subcards (when open), then standalone
    const rows: Array<{ type: 'category' | 'subcard' | 'standalone'; data: any }> = [];
    (categories ?? []).forEach((category: any) => {
        rows.push({ type: 'category', data: category });
        if (openCategoryIds[category.id]) {
            const catAssignments = (assignmentsByCategory[String(category.id)] ?? []) as any[];
            catAssignments.forEach(a => rows.push({ type: 'subcard', data: { assignment: a, category } }));
        }
    });
    uncategorizedAssignments.forEach(a => rows.push({ type: 'standalone', data: a }));

    return (
        <div className="min-h-screen relative">
            <NavBar />

            <h1 className="text-4xl font-extrabold text-center pt-10">{courseData.name}</h1>
            <div className="max-w-6xl mx-auto px-4 pb-32">
                <h1 className="text-3xl font-bold my-10 text-center">Assignments</h1>

                {/* Centered grid under the title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
                    {rows.map((row, idx) => {
                        if (row.type === 'category') {
                            const category = row.data;
                            const isOpen = !!openCategoryIds[category.id];
                            return (
                                <Card
                                    key={`cat-${category.id}-${idx}`}
                                    className="w-full cursor-pointer hover:shadow-md transition"
                                    onClick={() => toggleCategory(category.id)}
                                >
                                    <CardHeader className="flex flex-col items-center">
                                        <div className="flex items-center gap-2">
                                            {isOpen ? <ChevronDown /> : <ChevronRight />}
                                            <Folder />
                                            <h2 className="text-lg font-semibold">{category.name}</h2>
                                        </div>
                                        <div className="pt-1 text-sm text-muted-foreground">
                                            Weight: {category.weight ?? "N/A"}%
                                        </div>
                                    </CardHeader>
                                    <CardFooter className="justify-center">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={async (e) => {
                                                e.stopPropagation(); // don’t toggle on delete click
                                                await fetch(`http://localhost:8080/api/categories/${category.id}`, {
                                                    method: 'DELETE',
                                                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                                });
                                                mutate(`http://localhost:8080/api/categories?courseId=${search}`);
                                                mutate(`http://localhost:8080/api/assignments?courseId=${search}`);
                                            }}
                                        >
                                            Delete Category
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        }

                        if (row.type === 'subcard') {
                            const { assignment, category } = row.data;
                            return (
                                <Card key={`sub-${assignment.id}-${idx}`} className="w-full border-dashed">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-zinc-600" />
                                            <h3 className="font-medium">{assignment.name}</h3>
                                        </div>
                                        <div className="text-zinc-500">
                                            {formatDue(assignment.dueDate) ?? 'No due date'}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-1">
                                        <div>Grade: {assignment.grade ?? "N/A"}%</div>
                                        <div>Weight: {assignment.weight ?? category.weight ?? "N/A"}%</div>
                                    </CardContent>
                                    <CardFooter className="justify-center">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={async () => {
                                                await fetch(`http://localhost:8080/api/assignments/${assignment.id}`, {
                                                    method: 'DELETE',
                                                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                                });
                                                mutate(`http://localhost:8080/api/assignments?courseId=${search}`);
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        }

                        // standalone
                        const a = row.data;
                        return (
                            <Card key={`standalone-${a.id}-${idx}`} className="w-full">
                                <CardHeader className="text-center">
                                    <h2 className="text-lg font-semibold">{a.name}</h2>
                                    <div className="text-zinc-500">
                                        {formatDue(a.dueDate) ?? 'No due date'}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center">Grade: {a.grade ?? "N/A"}%</div>
                                    <div className="text-center">Weight: {a.weight ?? "N/A"}%</div>
                                </CardContent>
                                <CardFooter className="flex justify-center">
                                    <Button
                                        variant="destructive"
                                        onClick={async () => {
                                            await fetch(`http://localhost:8080/api/assignments/${a.id}`, {
                                                method: 'DELETE',
                                                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                                            });
                                            mutate(`http://localhost:8080/api/assignments?courseId=${search}`);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {/* Centered action buttons */}
                <div className="flex justify-center gap-3 mt-8">
                    <Button asChild className="rounded-0.5rem">
                        <Link href={`/addcategory?id=${search}`}>
                            Add Category <Plus className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild className="rounded-0.5rem">
                        <Link href={`/addassignment?id=${search}`}>
                            Add Assignment <Plus className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Course Information card bottom-right (sticky) */}
            <div className="flex justify-center mr-4">
                <Card className="w-[360px] shadow-lg">
                    <CardHeader className="flex justify-between items-center">
                        <p className="text-2xl">Course Information</p>
                        <>
                            {isEditing ? (
                                <button onClick={handleSave} aria-label="Save">
                                    <FaSave />
                                </button>
                            ) : (
                                <button onClick={handleEditToggle} aria-label="Edit">
                                    <FaPencilAlt />
                                </button>
                            )}
                        </>
                    </CardHeader>
                    <CardContent>
                        {isEditing ? (
                            <div className="flex flex-col gap-3">
                                <label className="text-sm">
                                    Name:
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="border p-2 rounded w-full"
                                    />
                                </label>
                                <label className="text-sm">
                                    Goal Grade:
                                    <input
                                        type="number"
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        className="border p-2 rounded w-full"
                                    />
                                </label>
                                <label className="text-sm">
                                    Semester:
                                    <input
                                        type="text"
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                        className="border p-2 rounded w-full"
                                    />
                                </label>
                                <label className="text-sm">
                                    Credit Hours:
                                    <input
                                        type="number"
                                        value={creditHours}
                                        onChange={(e) => setCreditHours(e.target.value)}
                                        className="border p-2 rounded w-full"
                                    />
                                </label>
                            </div>
                        ) : (
                            <>
                                <p className="text-base">Name: {courseData?.name}</p>
                                <p className="text-base">Goal: {courseData?.goal}</p>
                                <p className="text-base">Semester: {courseData?.semester}</p>
                                <p className="text-base">Credit Hours: {courseData?.creditHours}</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete course at the very bottom, centered */}
            <div className="flex justify-center py-10">
                <Button
                    variant="destructive"
                    onClick={() =>
                        fetch(`http://localhost:8080/api/courses/${parseInt(String(search))}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                        }).then(() => router.push('/dashboard'))
                    }
                >
                    Delete Course
                </Button>
            </div>
        </div>
    );
}