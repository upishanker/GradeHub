import { IoSchool } from "react-icons/io5";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Plus} from "lucide-react";
import {NavBar} from "@/components/Navbar";

export default function BlankState() {
    return (
        <>
            <NavBar></NavBar>
            <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
                <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full dark:bg-neutral-800">
                    <IoSchool className="w-10 h-10 text-neutral-50" />
                </div>
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold tracking-tight">No Courses</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        It looks like you haven't added any courses yet. Try adding one!
                    </p>
                </div>
                <div className="flex gap-5">
                    <Button asChild className="rounded-0.5rem">
                        <Link href="/addcourse">
                            Add Current Course
                            <Plus/>
                        </Link>
                    </Button>
                    <Button asChild className="rounded-0.5rem">
                        <Link href="/addpastcourse">
                            Add Past  Course
                            <Plus/>
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    )
}