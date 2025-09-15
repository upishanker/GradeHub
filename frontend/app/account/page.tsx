"use client"
import {useRouter} from "next/navigation";
import {NavBar} from "@/app/navbar/Navbar";
import useSWR, {mutate} from "swr";
import {z} from "zod";
import {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {FaPencilAlt, FaSave} from "react-icons/fa";


export default function Account() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    const [formValues, setFormValues] = useState({
        currentPassword: '',
        newPassword: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    const { data, error, isLoading } = useSWR(
        isClient ? "http://localhost:8080/api/users" : null,
        fetcher
    );

    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(data?.username ?? "");
    const [email, setEmail] = useState(data?.email ?? "");
    const isGoogleNoPassword = data?.provider === 'GOOGLE' && !data?.passwordSet;

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setUsername(data?.username ?? "");
            setEmail(data?.email ?? "");
        }
    };

    useEffect(() => {
        setIsClient(true);
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiry = payload.exp * 1000;
            if (Date.now() >= expiry) {
                router.push("/login");
            }
        } catch (e) {
            router.push("/login");
        }
    }, [router]);

    if (!isClient) {
        return <div>Loading...</div>;
    }
    if (isLoading) return <div>Loading user data...</div>;
    if (error) return <div>An error has occurred: {error.message}</div>;
    if (!data) return <div>No user data found</div>;

    const formSchema = z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8, { message: 'New Password must be at least 8 characters.' }),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };
    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch('http://localhost:8080/api/users', {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ username, email})
            })
            if(!res.ok) {
                console.error(await res.text());
                alert("Failed to update");
                return;
            }
            alert("Profile update successfully!");
            setIsEditing(false);
            mutate("http://localhost:8080/api/users")
        }
        catch (err) {
            console.error(err);
        }
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = formSchema.safeParse(formValues);
        const token = localStorage.getItem("token");

        if (!result.success) {
            const fieldErrors: { [key: string]: string } = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) {
                    fieldErrors[err.path[0]] = err.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }
        const courseRequest = {
            currentPassword: result.data.currentPassword,
            newPassword: result.data.newPassword,
        };

        try {
            const response = await fetch('http://localhost:8080/api/users/password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(courseRequest),
            })
            if (!response.ok) {
                console.error(await response.text())
                alert('Failed to change password')
                return
            }
            alert('Password changed successfully')

        } catch (error) {
            console.error(error)
            alert('An error occurred')
        }
    };
    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formValues.newPassword.length < 8) {
            setErrors(prev => ({ ...prev, newPassword: 'New Password must be at least 8 characters.' }));
            return;
        }
        const token = localStorage.getItem("token");
        const res = await fetch('http://localhost:8080/api/users/password/set', {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ newPassword: formValues.newPassword })
        });
        if (!res.ok) {
            console.error(await res.text());
            alert("Failed to set password");
            return;
        }
        alert("Password set successfully! You can now log in with email/password.");
        setFormValues(prev => ({ ...prev, newPassword: '' }));
        // Refresh user profile to reflect passwordSet = true
        mutate("http://localhost:8080/api/users");
    };
    function handleLogout() {
        localStorage.removeItem("token");
        router.push("/account/login");
    }
    return (
        <div>
            <NavBar />
            <h1 className="text-center text-4xl mt-20">Welcome, {data?.username}</h1>
            <div className="mt-20 flex justify-around">
                <Card className="w-100 ml-4">
                    <CardHeader className="flex justify-between items-center">
                        <p className="text-3xl">Account Information</p>
                        <>
                            {isEditing ? (
                                <button onClick={handleSave}>
                                    <FaSave />
                                </button>
                            ) : (
                                <button onClick={handleEditToggle}>
                                    <FaPencilAlt />
                                </button>
                            )}
                        </>
                    </CardHeader>
                    <CardContent>
                        <>
                            {isEditing ? (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-2xl">
                                            Username:
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="border p-1 rounded w-full"
                                            />
                                        </label>
                                        <label className="text-2xl">
                                            Email:
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="border p-1 rounded w-full"
                                            />
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-2xl">Username: {data?.username}</p>
                                    <p className="text-2xl">Email: {data?.email}</p>
                                </>
                            )}
                        </>
                    </CardContent>
                </Card>
                <div className="flex items-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-center text-2xl">
                                {isGoogleNoPassword ? 'Set Password' : 'Change Password'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isGoogleNoPassword ? (
                                <form onSubmit={handleSetPassword} className="space-y-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            name="newPassword"
                                            placeholder="●●●●●●●●"
                                            value={formValues.newPassword}
                                            onChange={handleChange}
                                        />
                                        {errors.newPassword && (
                                            <p className="text-sm text-red-600">{errors.newPassword}</p>
                                        )}
                                    </div>
                                    <Button type="submit" className="w-full">Set Password</Button>
                                </form>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        name="currentPassword"
                                        placeholder="●●●●●●●●"
                                        value={formValues.currentPassword}
                                        onChange={handleChange}
                                    />
                                    {errors.currentPassword && (
                                        <p className="text-sm text-red-600">{errors.currentPassword}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        name="newPassword"
                                        placeholder="●●●●●●●●"
                                        value={formValues.newPassword}
                                        onChange={handleChange}
                                    />
                                    {errors.newPassword && (
                                        <p className="text-sm text-red-600">{errors.newPassword}</p>
                                    )}
                                </div>
                                <Button type="submit" className="w-full">
                                    Change Password
                                </Button>
                            </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="flex justify-center mt-20"><Button variant="destructive" onClick={handleLogout}>
                Logout
            </Button></div>
        </div>
    )
}