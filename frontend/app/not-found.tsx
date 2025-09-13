import {Frown, Plus} from 'lucide-react';
import Link from "next/link";
import {Button} from "@/components/ui/button";

export default function NotFound() {
    return (
        <>
            <div className="min-h-screen flex justify-center items-center gap-10">
               <h1 className="text-center text-5xl">404 - Page Not Found</h1>
                <Frown size={100}/>
            </div>
            <Button asChild className="rounded-0.5rem flex ml-auto mr-auto w-1/4 -mt-30">
                <Link href={`/dashboard`}>
                    Go to Dashboard
                </Link>
            </Button>
        </>
    )
}