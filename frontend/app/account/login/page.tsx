"use client"

import { LoginForm } from "@/components/login-form"
import {ModeToggle} from "@/components/ui/darkmodetoggle";


export default function Login() {
    return (
        <div>
            <ModeToggle />
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <LoginForm />
                </div>
            </div>
        </div>
    )
}