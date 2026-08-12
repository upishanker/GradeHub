"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast'
import { apiPost } from "@/utils/api";

export function LoginForm({
                            className,
                            ...props
                          }: React.ComponentProps<"div">) {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const form = e.currentTarget as HTMLFormElement;
      const email = (form.querySelector("#email") as HTMLInputElement).value;
      const password = (form.querySelector("#password") as HTMLInputElement).value;

      const data = await apiPost<{ loginSessionId: string }>('/api/users/login', { email, password }, { skipAuth: true });

      localStorage.setItem('loginSessionId', data.loginSessionId);
      router.push("/account/twofactor");
    } catch (error) {
      console.error(error);
      toast.error('Incorrect email or password');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        toast.error("Google login failed: missing credential");
        return;
      }
      const data = await apiPost<{ token: string }>("/api/auth/google", { idToken }, { skipAuth: true });
      // Store your app JWT
      localStorage.setItem("token", data.token);
      // Navigate to the app (adjust path as needed)
      router.push("/");
    } catch (e) {
      console.error(e);
      toast.error("Google login failed");
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed");
  };

  return (
      <>
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                    />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                          href="/account/forgot-password"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input id="password" type="password" required />
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button type="submit" className="w-full">
                      Login
                    </Button>
                    <div className="relative flex items-center justify-center">
                      <span className="mx-2 text-xs text-muted-foreground">or</span>
                    </div>
                    <div className="flex justify-center">
                      <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="/account/signup" className="underline underline-offset-4">
                    Sign up
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </>
  )
}