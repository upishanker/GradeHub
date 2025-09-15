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
import {NavBar} from "@/components/Navbar";
import { useSearchParams } from "next/navigation";
import toast from 'react-hot-toast';

const formSchema = z.object({
    name: z.string().max(100, { message: 'Name must be less than 100 characters.' }),
    weight: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number().min(0, {message: 'Weight must be at least 0'}).max(100, { message: 'Weight must be at most 100.' })),
});



export default function AddCategory() {
    const params = useSearchParams();
    const search = params.get('id')
    const router = useRouter();
    const token = localStorage.getItem("token");

    const [formValues, setFormValues] = useState({
        name: '',
        weight: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = formSchema.safeParse(formValues);

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
        const categoryRequest = {
            courseId: search,
            name: result.data.name,
            weight: Number(result.data.weight),
        };

        try {
            const response = await fetch('http://localhost:8080/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(categoryRequest),
            })
            if (!response.ok) {
                console.error(await response.text())
                toast.error('Failed to create category');
                return
            }
            toast.success('Category created successfully')
            router.push('/course?id=' + search);

        } catch (error) {
            console.error(error)
            toast.error('An error occurred')
        }
    };

    return (
        <div>
            <NavBar></NavBar>
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">Add Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Category Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Category Name"
                                    value={formValues.name}
                                    onChange={handleChange}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="weight">Weight</Label>
                                <Input
                                    id="weight"
                                    name="weight"
                                    placeholder="50"
                                    value={formValues.weight}
                                    onChange={handleChange}
                                />
                                {errors.weight && (
                                    <p className="text-sm text-red-600">{errors.weight}</p>
                                )}
                            </div>
                            <Button type="submit" className="w-full">
                                Add Category
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
