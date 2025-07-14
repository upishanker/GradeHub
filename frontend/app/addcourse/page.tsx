'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {NavBar} from "@/app/navbar/Navbar";


const formSchema = z.object({
    name: z.string().max(100, { message: 'Name must be less than 100 characters.' }),
    goal: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number().min(0, { message: 'Goal must be at least 0.' }).max(100, { message: 'Goal must be at most 100.' })
    ),
    semester: z.string().max(100, { message: 'Semester must be less than 100 characters.' }),
    creditHours: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number().min(1, { message: 'Credit hours must be at least 1.' }).max(6, { message: 'Credit hours must be at most 6.' })
    ),
});



export default function SignupPage() {
    const router = useRouter();

    const [formValues, setFormValues] = useState({
        name: '',
        goal: '',
        semester: '',
        creditHours: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = formSchema.safeParse(formValues);
        const token = localStorage.getItem("token");

        if (!result.success) {
            const fieldErrors: { [key: string]: string } = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) {
                    fieldErrors[err.path[0]] = err.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }
        const courseRequest = {
            name: result.data.name,
            goal: Number(result.data.goal),
            semester: result.data.semester,
            creditHours: Number(result.data.creditHours),
        };

        try {
            const response = await fetch('http://localhost:8080/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(courseRequest),
            })
            if (!response.ok) {
                console.error(await response.text())
                alert('Failed to create course')
                return
            }
            alert('Course created successfully')
            router.push('/dashboard');

        } catch (error) {
            console.error(error)
            alert('An error occurred')
        }
    };

    return (
        <div>
            <NavBar></NavBar>
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">Add Course</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Course Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Course Name"
                                    value={formValues.name}
                                    onChange={handleChange}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="goal">Goal Grade</Label>
                                <Input
                                    id="goal"
                                    name="goal"
                                    type="number"
                                    placeholder="100"
                                    value={formValues.goal}
                                    onChange={handleChange}
                                />
                                {errors.goal && (
                                    <p className="text-sm text-red-600">{errors.goal}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="semester">Semester</Label>
                                <Input
                                    id="semester"
                                    name="semester"
                                    type="text"
                                    placeholder="Fall 2025"
                                    value={formValues.semester}
                                    onChange={handleChange}
                                />
                                {errors.semester && (
                                    <p className="text-sm text-red-600">{errors.semester}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="creditHours">Credit Hours</Label>
                                <Input
                                    id="creditHours"
                                    name="creditHours"
                                    type="number"
                                    placeholder="3"
                                    value={formValues.creditHours}
                                    onChange={handleChange}
                                />
                                {errors.creditHours && (
                                    <p className="text-sm text-red-600">{errors.creditHours}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full">
                                Add Course
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
