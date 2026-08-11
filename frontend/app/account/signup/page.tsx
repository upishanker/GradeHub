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
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import toast from "react-hot-toast";
import {ModeToggle} from "@/components/ui/darkmodetoggle";
import {ApiError, apiPost} from "@/utils/api";

const formSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export default function SignupPage() {
    const router = useRouter();

    const [formValues, setFormValues] = useState({
        username: '',
        email: '',
        password: '',
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
                    fieldErrors[err.path[0] as string] = err.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        try {
            await apiPost('/api/users/signup', result.data, { skipAuth: true });
            toast.success('User created successfully')
            router.push('/account/login');
        } catch (error) {
            console.error(error)
            toast.error(error instanceof ApiError ? 'Failed to create user' : 'An error occurred')
        }
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            const idToken = credentialResponse?.credential;
            if (!idToken) {
                toast.error("Google sign up failed: missing credential");
                return;
            }
            // Same endpoint as login. Backend will upsert user and return JWT.
            const data = await apiPost("/api/auth/google", { idToken }, { skipAuth: true });
            localStorage.setItem("token", data.token);
            router.push("/");
        } catch (e) {
            console.error(e);
            toast.error("Google sign-in failed");
        }
    };

    const handleGoogleError = () => {
        toast.error("Google sign-in failed");
    };

    return (
        <div>
            <ModeToggle />
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">Sign Up</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Username */}
                            <div className="space-y-1">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    placeholder="Your username"
                                    value={formValues.username}
                                    onChange={handleChange}
                                />
                                {errors.username && (
                                    <p className="text-sm text-red-600">{errors.username}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formValues.email}
                                    onChange={handleChange}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formValues.password}
                                    onChange={handleChange}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full">
                                Sign Up
                            </Button>

                            <div className="relative mt-4 flex items-center justify-center">
                                <span className="mx-2 text-xs text-muted-foreground">or</span>
                            </div>

                            <div className="flex justify-center">
                                <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
                            </div>

                            <div className="mt-4 text-center text-sm">
                                Already have an account?{" "}
                                <a href="/account/login" className="underline underline-offset-4">
                                    Log in
                                </a>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}