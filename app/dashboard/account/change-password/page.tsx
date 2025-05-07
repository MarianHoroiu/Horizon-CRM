"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PasswordInput from "@/app/components/form/PasswordInput";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

// Define validation schema using Zod
const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .refine(val => /[A-Z]/.test(val), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine(val => /[a-z]/.test(val), {
        message: "Password must contain at least one lowercase letter",
      })
      .refine(val => /[0-9]/.test(val), {
        message: "Password must contain at least one number",
      })
      .refine(val => /[^A-Za-z0-9]/.test(val), {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

// Define the type for our form
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ChangePasswordPage() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, touchedFields, isSubmitting, isValid },
    setError,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<PasswordFormData> = async data => {
    // Reset messages
    setSuccessMessage("");
    setServerError(null);

    try {
      const response = await fetch("/api/user/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to reset password");
      }

      // Clear form fields
      reset();

      // Show success message
      setSuccessMessage("Password updated successfully");
    } catch (error) {
      console.error("Error resetting password:", error);
      setServerError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );

      // Check for specific error messages from the API
      if (
        error instanceof Error &&
        error.message.includes("current password")
      ) {
        setError("currentPassword", {
          type: "manual",
          message: "Current password is incorrect",
        });
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        {successMessage && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm mb-4 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
            {successMessage}
          </div>
        )}

        {serverError && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mb-4 flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 mr-2 text-red-500" />
            {serverError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate>
          {/* Current Password Field */}
          <div>
            <PasswordInput
              id="currentPassword"
              registerProps={register("currentPassword")}
              label="Current Password"
              required
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              isValid={
                !!touchedFields.currentPassword && !errors.currentPassword
              }
              touched={!!touchedFields.currentPassword}
            />
          </div>

          {/* New Password Field */}
          <div>
            <PasswordInput
              id="newPassword"
              registerProps={register("newPassword")}
              label="New Password"
              required
              autoComplete="new-password"
              error={errors.newPassword?.message}
              isValid={!!touchedFields.newPassword && !errors.newPassword}
              touched={!!touchedFields.newPassword}
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <PasswordInput
              id="confirmPassword"
              registerProps={register("confirmPassword")}
              label="Confirm New Password"
              required
              autoComplete="new-password"
              isValid={dirtyFields.confirmPassword && !errors.confirmPassword}
              error={errors.confirmPassword?.message}
              touched={!!touchedFields.confirmPassword}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
                  isValid
                    ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                }
                ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
              `}
              disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
