"use client";

/**
 * Root error boundary for the App Router.
 *
 * Next.js renders this in place of the segment whenever an uncaught error is
 * thrown while rendering a page (or from an event handler that bubbles). It
 * replaces the previous behaviour where an unhandled render error produced a
 * blank screen / dev overlay with no way back.
 *
 * `reset()` re-attempts rendering the segment — useful for transient API
 * failures, where a retry often succeeds.
 */

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
            <TriangleAlert size={80} className="text-destructive" />
            <h1 className="text-4xl font-bold">Something went wrong</h1>
            <p className="max-w-md text-muted-foreground">
                {error.message || "An unexpected error occurred. Please try again."}
            </p>
            {error.digest ? (
                <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
            ) : null}
            <div className="flex gap-3">
                <Button onClick={() => reset()}>Try again</Button>
                <Button asChild variant="secondary">
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
            </div>
        </div>
    );
}
