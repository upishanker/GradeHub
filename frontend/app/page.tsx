"use client"
import {router} from "next/client";
import {useRouter} from "next/navigation";
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
        router.push("/account/login")
    }
    return (
    <div>

    </div>
  );
}
