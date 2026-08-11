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
import {useRouter} from "next/navigation";
import {ModeToggle} from "@/components/ui/darkmodetoggle";
import {apiFetcher} from "@/utils/api";
import {logout} from "@/utils/auth";
import {Course} from "@/utils/types";


const fetcher = apiFetcher;

export function NavBar() {
    const router = useRouter();
    // NOTE: this used to `return 'An error has occured'` on failure, which
    // replaced the ENTIRE navbar (logo, links, logout, theme toggle) on any
    // transient API hiccup. The error is now scoped to the Courses dropdown.
    const { data, error, isLoading } = useSWR<Course[]>("/api/courses", fetcher)

    const renderCourses = () => {
        if (error) {
            return (
                <div className="p-2 text-sm text-muted-foreground whitespace-nowrap">
                    Couldn&apos;t load courses
                </div>
            );
        }
        if (isLoading) {
            return (
                <div className="p-2 text-sm text-muted-foreground whitespace-nowrap">
                    Loading…
                </div>
            );
        }
        if (!data || data.length === 0) {
            return (
                <div className="p-2 text-sm text-muted-foreground whitespace-nowrap">
                    No courses yet
                </div>
            );
        }
        return data.map((course) => (
            <NavigationMenuLink key={course.id} href={"/course?id=" + course.id}>
                {course.name}
            </NavigationMenuLink>
        ));
    };

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
                                {renderCourses()}
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink href="/gpa">GPA</NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink href="/settings">Settings</NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink href="/account">Account</NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            asChild
                            onSelect={(e) => e.preventDefault()}
                        >
                            <button
                                type="button"
                                className="cursor-pointer"
                                onClick={() => logout(router)}
                            >
                                Logout
                            </button>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <ModeToggle></ModeToggle>
        </div>
    )
}
