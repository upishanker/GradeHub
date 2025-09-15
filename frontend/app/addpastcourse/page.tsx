'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {NavBar} from "@/app/navbar/Navbar";
import {toNumberGrade} from "@/utils/helpers";


const seasons = [
    { label: "Fall", value: "fall" },
    { label: "Spring", value: "spring" },
    { label: "Summer", value: "summer" },
    { label: "Winter", value: "winter" },
] as const;

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear + 5 - i;
    return { label: year.toString(), value: year.toString() };
});

const letterGrades = [
    "A",
    "A-",
    "B+",
    "B",
    "B-",
    "C+",
    "C",
    "C-",
    "D+",
    "D",
    "D-",
    "F"
] as const;
const formSchema = z.object({
    name: z.string().max(100, { message: 'Name must be less than 100 characters.' }),
    letterGrade: z.string().refine((val) => letterGrades.includes(val as any), { message: 'Invalid letter grade.' }),
    season: z.string().min(1, { message: 'Please select a season.' }),
    year: z.string().min(1, { message: 'Please select a year.' }),
    creditHours: z.preprocess(
        (val) => (val === '' ? undefined : Number(val)),
        z.number().min(1, { message: 'Credit hours must be at least 1.' }).max(6, { message: 'Credit hours must be at most 6.' })
    ),
});

export default function AddPastCourse() {
    const router = useRouter();

    const [formValues, setFormValues] = useState({
        name: '',
        letterGrade: '',
        season: '',
        year: '',
        creditHours: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [seasonOpen, setSeasonOpen] = useState(false);
    const [yearOpen, setYearOpen] = useState(false);
    const [letterGradeOpen, setletterGradeOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Clear letter grade when typing in number input
        if (name === 'letterGrade' && e.target.type === 'number') {
            setFormValues({ ...formValues, [name]: value });
        } else {
            setFormValues({ ...formValues, [name]: value });
        }
        setErrors({ ...errors, [name]: '' });
    };

    const handleSeasonSelect = (value: string) => {
        setFormValues({ ...formValues, season: value });
        setErrors({ ...errors, season: '' });
        setSeasonOpen(false);
    };

    const handleYearSelect = (value: string) => {
        setFormValues({ ...formValues, year: value });
        setErrors({ ...errors, year: '' });
        setYearOpen(false);
    };
    const handleletterGradeSelect = (value: string) => {
        setFormValues({ ...formValues, letterGrade: value });
        setErrors({ ...errors, letterGrade: '' });
        setletterGradeOpen(false);
    }

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

        const semester = `${result.data.season.charAt(0).toUpperCase() + result.data.season.slice(1)} ${result.data.year}`;


        const courseRequest = {
            name: result.data.name,
            letterGrade: result.data.letterGrade,
            semester,
            creditHours: Number(result.data.creditHours),
        };

        try {
            const response = await fetch('http://localhost:8080/api/pastcourses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(courseRequest),
            })
            if (!response.ok) {
                console.error(await response.text())
                toast.error('Failed to create course')
                return
            }
            toast.error('Course created successfully')
            router.push('/dashboard');

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
                        <CardTitle className="text-center text-2xl">Add Past Course</CardTitle>
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

                            <div className="space-y-2">
                                <Label htmlFor="letterGrade">Letter Grade</Label>
                                <div className="flex justify-between items-center">

                                    <Popover open={letterGradeOpen} onOpenChange={setletterGradeOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={letterGradeOpen}
                                                className={cn(
                                                    "justify-between",
                                                    !formValues.letterGrade && "text-muted-foreground"
                                                )}
                                            >
                                                {formValues.letterGrade
                                                    ? letterGrades.find((letterGrade) => letterGrade === formValues.letterGrade)
                                                    : "Select"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search Letter..." />
                                                <CommandList>
                                                    <CommandEmpty>No letter found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {letterGrades.map((letterGrade) => (
                                                            <CommandItem
                                                                key={letterGrade}
                                                                value={letterGrade}
                                                                onSelect={() => handleletterGradeSelect(letterGrade)}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        formValues.letterGrade === letterGrade ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {letterGrade}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {errors.letterGrade && (
                                    <p className="text-sm text-red-600">{errors.letterGrade}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label>Semester</Label>
                                <div className="flex gap-2">
                                    {/* Season Combobox */}
                                    <div className="flex-1">
                                        <Popover open={seasonOpen} onOpenChange={setSeasonOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={seasonOpen}
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !formValues.season && "text-muted-foreground"
                                                    )}
                                                >
                                                    {formValues.season
                                                        ? seasons.find((season) => season.value === formValues.season)?.label
                                                        : "Select season"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search season..." />
                                                    <CommandList>
                                                        <CommandEmpty>No season found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {seasons.map((season) => (
                                                                <CommandItem
                                                                    key={season.value}
                                                                    value={season.value}
                                                                    onSelect={() => handleSeasonSelect(season.value)}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formValues.season === season.value ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {season.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.season && (
                                            <p className="text-sm text-red-600 mt-1">{errors.season}</p>
                                        )}
                                    </div>

                                    {/* Year Combobox */}
                                    <div className="flex-1">
                                        <Popover open={yearOpen} onOpenChange={setYearOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={yearOpen}
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !formValues.year && "text-muted-foreground"
                                                    )}
                                                >
                                                    {formValues.year
                                                        ? years.find((year) => year.value === formValues.year)?.label
                                                        : "Select year"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search year..." />
                                                    <CommandList>
                                                        <CommandEmpty>No year found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {years.map((year) => (
                                                                <CommandItem
                                                                    key={year.value}
                                                                    value={year.value}
                                                                    onSelect={() => handleYearSelect(year.value)}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            formValues.year === year.value ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {year.label}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.year && (
                                            <p className="text-sm text-red-600 mt-1">{errors.year}</p>
                                        )}
                                    </div>
                                </div>
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
                                Add Past Course
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
