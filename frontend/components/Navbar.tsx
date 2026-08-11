"use client"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import useSWR from "swr";
import {ModeToggle} from "@/components/ui/darkmodetoggle";
import {apiFetcher} from "@/utils/api";
import {Course} from "@/utils/types";


const fetcher = apiFetcher;

export function NavBar() {
    const { data, error } = useSWR<Course[]>("/api/courses", fetcher)
    if(error) return 'An error has occured'

    return (
        <div className="flex justify-between">
            <NavigationMenu viewport={false}>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuLink href="/dashboard">Dashboard</NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Courses</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div>
                                {data?.map((course) => (
                                    <NavigationMenuLink key={course.id} href={"/course?id=" + course.id}>{course.name}</NavigationMenuLink>
                                    ))}
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink href="/settings">Settings</NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink href="/account">Account</NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <ModeToggle></ModeToggle>
        </div>
    )
}