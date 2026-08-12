'use client'

import { useState } from 'react';
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

const formSchema = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
});

/**
 * Intentionally generic: the backend never reveals whether an account exists
 * for the submitted address, and neither does this UI.
 */
const GENERIC_MESSAGE =
    'If an account exists for that email, a reset link has been sent.';

export default function ForgotPasswordPage() {
    const [formValues, setFormValues] = useState({ email: '' });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

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

        setIsLoading(true);
        try {
            await apiPost(
                '/api/users/forgot-password',
                { email: result.data.email },
                { skipAuth: true }
            );
            // Same message regardless of whether the address matched an account.
            toast.success(GENERIC_MESSAGE);
            setSubmitted(true);
        } catch (error) {
            console.error(error);
            // Only genuine transport/server failures land here — the endpoint
            // returns 200 for both known and unknown addresses, so this never
            // implies anything about whether the account exists.
            toast.error(
                error instanceof ApiError
                    ? 'Something went wrong. Please try again.'
                    : 'An error occurred. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <ModeToggle />
            <div className="flex items-center justify-center min-h-screen p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">
                            Forgot Password
                        </CardTitle>
                        <CardDescription className="text-center">
                            Enter your email and we&apos;ll send you a link to reset your
                            password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submitted ? (
                            <div className="space-y-4">
                                <p className="text-sm text-center text-muted-foreground">
                                    {GENERIC_MESSAGE}
                                </p>
                                <p className="text-sm text-center text-muted-foreground">
                                    Didn&apos;t get an email? Check your spam folder, or{' '}
                                    <button
                                        type="button"
                                        onClick={() => setSubmitted(false)}
                                        className="underline underline-offset-4"
                                    >
                                        try another address
                                    </button>
                                    .
                                </p>
                                <div className="text-center text-sm">
                                    <a
                                        href="/account/login"
                                        className="underline underline-offset-4"
                                    >
                                        Back to log in
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
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

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Sending...' : 'Send reset link'}
                                </Button>

                                <div className="mt-4 text-center text-sm">
                                    Remembered your password?{' '}
                                    <a
                                        href="/account/login"
                                        className="underline underline-offset-4"
                                    >
                                        Log in
                                    </a>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
