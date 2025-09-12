"use client";

import {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {useRouter} from "next/navigation";

export default function TwoFAPage() {
    const [otp, setOtp] = useState("");
    const [loginSessionId, setLoginSessionId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        // Get sessionId from localStorage (more secure than URL)
        const sessionId = localStorage.getItem('loginSessionId');
        if (sessionId) {
            try {
                const parsed = JSON.parse(sessionId);
                setLoginSessionId(parsed.loginSessionId || sessionId);
            } catch {
                // If it's not JSON, use as-is (fallback for plain string values)
                setLoginSessionId(sessionId);
            }
        } else {
            // Redirect back to login if no sessionId
            router.push('/login');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("Please enter a 6-digit code");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch('http://localhost:8080/api/users/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loginSessionId: loginSessionId,
                    code: otp
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store JWT token
                localStorage.setItem('token', data.token);
                // Redirect to dashboard
                router.push('/dashboard');
            } else {
                // Show a red error message below the OTP boxes
                setError(data.error || 'The code you entered is incorrect.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center">Two-Factor Authentication</CardTitle>
                    <CardDescription className="text-center">
                        Enter the 6-digit code from your email.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="flex flex-col items-center gap-4">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>

                        {error && (
                            <p className="text-sm text-red-600 text-center">
                                {error}
                            </p>
                        )}
                    </CardContent>

                    <CardFooter className="flex justify-center mt-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Verifying..." : "Verify"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}