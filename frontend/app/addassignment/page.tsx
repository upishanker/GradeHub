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
import { Check, ChevronsUpDown } from "lucide-react"
import { useSearchParams } from "next/navigation";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import {cn} from "@/lib/utils";
import useSWR from "swr";



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



const createFormSchema = (useCategory: boolean) => z.object({
    name: z.string().max(100, { message: 'Name must be less than 100 characters.' }),
    category: useCategory
        ? z.string().min(1, { message: 'Category is required when using categories.' })
        : z.string().optional(),
    grade: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number().min(0, { message: 'Grade must be at least 0.' }).max(120, { message: 'Grade must be at most 120.' })
    ),
    weight: useCategory
        ? z.any().optional() // Weight is not validated when using categories
        : z.preprocess(
            (val) => {
                if (val === '' || val === null) return undefined;
                return Number(val);
            },
            z.number().min(0, { message: 'Weight must be at least 0' }).max(100, { message: 'Weight must be at most 100' })
        ),
    dueDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid datetime',
    }),
});



export default function AddAssignment() {
    const params = useSearchParams();
    const search = params.get('id')
    const router = useRouter();
    const token = localStorage.getItem("token");

    const [formValues, setFormValues] = useState({
        name: '',
        category: '',
        grade: '',
        weight: '',
        dueDate: '',
        useCategory: false
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [useCategory, setUseCategory] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formSchema = createFormSchema(useCategory);
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
        const assignmentRequest = {
            courseId: search,
            name: result.data.name,
            grade: Number(result.data.grade),
            dueDate: result.data.dueDate,
            ...(useCategory
                ? { categoryId: selectedCategory?.id}
                : { weight: Number(result.data.weight) })
        };

        try {
            const response = await fetch('http://localhost:8080/api/assignments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(assignmentRequest),
            })
            if (!response.ok) {
                console.error(await response.text())
                alert('Failed to create assignment')
                return
            }
            alert('Assignment created successfully')
            router.push('/course?id=' + search);

        } catch (error) {
            console.error(error)
            alert('An error occurred')
        }
    };
    const { data: categoryData, error: categoryError} =  useSWR('http://localhost:8080/api/categories?courseId=' + search, fetcher);
    const selectedCategory = useCategory
        ? categoryData?.find(cat => cat.name === formValues.category)
        : null;

    return (
        <div>
            <NavBar></NavBar>
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">Add Assignment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Assignment Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Assignment Name"
                                    value={formValues.name}
                                    onChange={handleChange}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    id="useCategory"
                                    type="checkbox"
                                    checked={useCategory}
                                    onChange={(e) => {
                                        setUseCategory(e.target.checked);
                                        setFormValues(prev => ({
                                            ...prev,
                                            category: '',
                                            weight: ''
                                        }));
                                        setErrors(prev => ({
                                            ...prev,
                                            category: '',
                                            weight: ''
                                        }));
                                    }}
                                    className="accent-primary h-4 w-4"
                                />
                                <Label htmlFor="useCategory">Use Category</Label>
                            </div>
                            {useCategory && (
                                <div className="space-y-1">
                                    <Label htmlFor="category">Category</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(formValues.category ? "text-black" : "text-muted-foreground")}
                                            >
                                                {formValues.category || "Select category"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Command>
                                                <CommandInput placeholder="Search Category..." />
                                                <CommandList>
                                                    <CommandEmpty>No category found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {categoryData?.map(category => (
                                                            <CommandItem
                                                                key={category.id}
                                                                value={category.name}
                                                                onSelect={() => {
                                                                    setFormValues(prev => ({
                                                                        ...prev,
                                                                        category: category.name,
                                                                        categoryId: category.id,
                                                                    }));
                                                                    setErrors(prev => ({
                                                                        ...prev,
                                                                        category: '',
                                                                    }));
                                                                }}
                                                            >
                                                                {category.name}
                                                                <Check
                                                                    className={cn(
                                                                        category.name === formValues.category
                                                                            ? "opacity-100 ml-2"
                                                                            : "opacity-0 ml-2"
                                                                    )}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {errors.category && (
                                        <p className="text-sm text-red-600">{errors.category}</p>
                                    )}
                                </div>
                            )}
                            <div className="space-y-1">
                                <Label htmlFor="grade">Grade</Label>
                                <Input
                                    id="grade"
                                    name="grade"
                                    type="number"
                                    placeholder="100"
                                    value={formValues.grade}
                                    onChange={handleChange}
                                />
                                {errors.grade && (
                                    <p className="text-sm text-red-600">{errors.grade}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="weight">Weight</Label>
                                <Input
                                    id="weight"
                                    name="weight"
                                    placeholder="50"
                                    value={
                                        useCategory
                                            ? selectedCategory?.weight?.toString() ?? ''
                                            : formValues.weight
                                    }
                                    onChange={handleChange}
                                    disabled={useCategory}
                                    className={useCategory ? "bg-gray-200 cursor-not-allowed" : ""}
                                />

                                {errors.weight && (
                                    <p className="text-sm text-red-600">{errors.weight}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    name="dueDate"
                                    type="datetime-local"
                                    placeholder="2025-07-06T14:30:00-07:00"
                                    value={formValues.dueDate}
                                    onChange={handleChange}
                                />
                                {errors.dueDate && (
                                    <p className="text-sm text-red-600">{errors.dueDate}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full">
                                Add Assignment
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
