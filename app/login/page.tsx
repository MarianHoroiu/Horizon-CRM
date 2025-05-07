"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextInput from "@/app/components/form/TextInput";
import PasswordInput from "@/app/components/form/PasswordInput";

// Define the validation schema using Zod
const loginSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Define the type for our form
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Form handling with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, dirtyFields },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur", // Validate on field blur
    reValidateMode: "onChange", // Re-validate when field changes after it's been touched
  });

  // If already authenticated, redirect
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const onSubmit: SubmitHandler<LoginFormData> = async data => {
    setIsLoading(true);
    setLoginError("");

    try {
      // Use NextAuth's built-in redirect handling
      await signIn("credentials", {
        redirect: true,
        callbackUrl: callbackUrl,
        email: data.email,
        password: data.password,
      });

      // We won't reach here as redirect is true
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8 bg-white rounded-lg shadow-md p-6 pb-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/"
              className="font-medium text-blue-600 hover:text-blue-500">
              return to the homepage
            </Link>
          </p>
        </div>

        {(error || loginError) && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert">
            <span className="block sm:inline">
              {error === "CredentialsSignin"
                ? "Invalid email or password. Please try again."
                : loginError || "An error occurred. Please try again."}
            </span>
          </div>
        )}

        <form
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate>
          <div>
            {/* Email Input */}
            <TextInput
              id="email"
              type="email"
              label="Email address"
              required
              isValid={dirtyFields.email && !errors.email}
              error={errors.email?.message}
              touched={touchedFields.email}
              placeholder="Email address"
              autoComplete="email"
              disabled={isLoading}
              showLabel={false}
              registerProps={register("email", {
                required: "Email is required",
              })}
            />
          </div>

          <div>
            {/* Password Input */}
            <PasswordInput
              id="password"
              label="Password"
              required
              isValid={dirtyFields.password && !errors.password}
              error={errors.password?.message}
              touched={touchedFields.password}
              placeholder="Password"
              autoComplete="current-password"
              disabled={isLoading}
              showLabel={false}
              registerProps={register("password", {
                required: "Password is required",
              })}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-400">
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
