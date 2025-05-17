"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Sign up failed");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to sign up");
      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Show success toast
      toast.success("Account created successfully", {
        description: "You can now sign in with your new account",
      });

      router.push("/sign-in"); // Redirect to sign-in after successful signup
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      // Show error toast
      toast.error("Sign up failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="flex items-center text-[#393E46] dark:text-[#EEEEEE] hover:text-[#00ADB5] transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center flex-grow p-4">
        <Card className="w-full max-w-md border-none shadow-lg bg-white dark:bg-[#393E46] text-[#393E46] dark:text-[#EEEEEE]">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-1 bg-[#00ADB5] rounded-full"></div>
            </div>
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-sm text-[#393E46]/70 dark:text-[#EEEEEE]/70">
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-lg mb-4 flex items-start">
                <span className="font-medium">{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#393E46] dark:text-[#EEEEEE]/90"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-[#EEEEEE]/50 dark:bg-[#222831]/50 border-[#393E46]/10 dark:border-[#EEEEEE]/10 focus:border-[#00ADB5] dark:focus:border-[#00ADB5] focus:ring-[#00ADB5]/10 text-[#393E46] dark:text-[#EEEEEE]"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#393E46] dark:text-[#EEEEEE]/90"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-[#EEEEEE]/50 dark:bg-[#222831]/50 border-[#393E46]/10 dark:border-[#EEEEEE]/10 focus:border-[#00ADB5] dark:focus:border-[#00ADB5] focus:ring-[#00ADB5]/10 text-[#393E46] dark:text-[#EEEEEE]"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-[#393E46] dark:text-[#EEEEEE]/90"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-[#EEEEEE]/50 dark:bg-[#222831]/50 border-[#393E46]/10 dark:border-[#EEEEEE]/10 focus:border-[#00ADB5] dark:focus:border-[#00ADB5] focus:ring-[#00ADB5]/10 text-[#393E46] dark:text-[#EEEEEE]"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded border-[#393E46]/20 dark:border-[#EEEEEE]/20 text-[#00ADB5] focus:ring-[#00ADB5]/20"
                  required
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-[#393E46]/80 dark:text-[#EEEEEE]/80"
                >
                  I agree to the{" "}
                  <a href="#" className="text-[#00ADB5] hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-[#00ADB5] hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#00ADB5] hover:bg-[#00ADB5]/90 text-[#EEEEEE] font-medium py-2 shadow-md hover:shadow-lg transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-[#393E46]/10 dark:border-[#EEEEEE]/10 p-6">
            <Link
              href="/sign-in"
              className="text-sm text-[#00ADB5] hover:text-[#00ADB5]/80 hover:underline font-medium"
            >
              Already have an account? Sign in
            </Link>
          </CardFooter>
        </Card>
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-8 h-1 bg-[#00ADB5]/40 rounded-full"></div>
            <div className="w-2 h-2 bg-[#00ADB5] rounded-full"></div>
            <div className="w-8 h-1 bg-[#00ADB5]/40 rounded-full"></div>
          </div>
          <p className="text-sm text-[#393E46]/70 dark:text-[#EEEEEE]/70">
            Create your professional resume in minutes
          </p>
        </div>
      </div>
    </div>
  );
}
