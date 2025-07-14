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


const fetcher = async (url: string) => {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Failed to fetch");
    }
    return await response.json();
};

export function NavBar() {
    const { data, error } = useSWR("http://localhost:8080/api/courses", fetcher)
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
                        <NavigationMenuLink href="/account">Account</NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <ModeToggle></ModeToggle>
        </div>
    )
}