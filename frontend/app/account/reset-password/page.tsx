'use client'

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { ModeToggle } from '@/components/ui/darkmodetoggle';
import { ApiError, apiPost } from '@/utils/api';
import { redirectToLogin } from '@/utils/auth';

const formSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters.' }),
        confirmPassword: z.string(),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
        message: 'Passwords do not match.',
        path: ['confirmPassword'],
    });

const DEFAULT_ERROR = 'This reset link is invalid or has expired.';

/** Pulls the backend's `{ error, message, status }` text out of an ApiError. */
function messageFromApiError(err: ApiError): string {
    try {
        const parsed = JSON.parse(err.body) as {
            message?: string;
            error?: string;
        };
        return parsed?.message || parsed?.error || DEFAULT_ERROR;
    } catch {
        // Body wasn't JSON; keep the default message.
        return DEFAULT_ERROR;
    }
}

function ResetPasswordForm() {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get('token');

    const [formValues, setFormValues] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [tokenError, setTokenError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

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

        setIsLoading(true);
        setTokenError('');
        try {
            await apiPost(
                '/api/users/reset-password',
                { token, newPassword: result.data.newPassword },
                { skipAuth: true }
            );
            toast.success('Password reset successfully. Please log in.');
            redirectToLogin(router);
        } catch (error) {
            console.error(error);
            const message =
                error instanceof ApiError
                    ? messageFromApiError(error)
                    : 'Network error. Please try again.';
            setTokenError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        Invalid or missing reset link
                    </CardTitle>
                    <CardDescription className="text-center">
                        This page needs a valid reset link. Request a new one to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        type="button"
                        className="w-full"
                        onClick={() => router.push('/account/forgot-password')}
                    >
                        Request a new link
                    </Button>
                    <div className="text-center text-sm">
                        <a href="/account/login" className="underline underline-offset-4">
                            Back to log in
                        </a>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
                <CardDescription className="text-center">
                    Choose a new password for your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="newPassword">New password</Label>
                        <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formValues.newPassword}
                            onChange={handleChange}
                        />
                        {errors.newPassword && (
                            <p className="text-sm text-red-600">{errors.newPassword}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="confirmPassword">Confirm new password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formValues.confirmPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {tokenError && (
                        <div className="space-y-1 text-center">
                            <p className="text-sm text-red-600">{tokenError}</p>
                            <p className="text-sm text-muted-foreground">
                                <a
                                    href="/account/forgot-password"
                                    className="underline underline-offset-4"
                                >
                                    Request a new reset link
                                </a>
                            </p>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Resetting...' : 'Reset password'}
                    </Button>

                    <div className="mt-4 text-center text-sm">
                        <a href="/account/login" className="underline underline-offset-4">
                            Back to log in
                        </a>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div>
            <ModeToggle />
            <div className="flex items-center justify-center min-h-screen p-4">
                <Suspense fallback={<div>Loading…</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
