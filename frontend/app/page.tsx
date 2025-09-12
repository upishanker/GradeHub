"use client"
import {router} from "next/client";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Plus} from "lucide-react";

export default function Home() {
    function isLoggedIn() {
        const token = localStorage.getItem("token");
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000;
            return Date.now() < expiry;
        } catch (e) {
            return false;
        }
    }
    const router = useRouter();
    if(isLoggedIn()) {
        router.push('/dashboard')
    }
    else {
        return (
            <>
                <div className="min-h-screen">
                    <div className="mt-[33vh] mx-auto max-w-xl px-4 text-center space-y-6">
                        <h1 className="text-5xl font-bold">Welcome</h1>
                        <h1>GradeHub is your new favorite hub</h1>
                        <div className="flex items-center justify-center gap-4">
                            <Button asChild className="rounded-[0.5rem]">
                                <Link href="/account/signup">Sign Up</Link>
                            </Button>
                            <span className="text-gray-500">or</span>
                            <Button asChild className="rounded-[0.5rem]">
                                <Link href="/account/login">Log In</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

}
