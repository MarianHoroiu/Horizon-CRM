"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/app/components/form/PasswordInput";

export default function AccountSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    image: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Password reset form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (status === "authenticated" && session?.user) {
      setUser({
        name: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role || "USER",
        image: session.user.image || "",
      });
    }
  }, [status, session, router]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset messages
    setSuccessMessage("");
    setErrorMessage("");
    setPasswordError("");

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    // Check if the new password is the same as current password
    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from the current password"
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      // Clear form fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Show success message
      setSuccessMessage("Password updated successfully");
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      {/* User details section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{user.name || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium capitalize">{user.role?.toLowerCase()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Status</p>
            <p className="font-medium">Active</p>
          </div>
        </div>
      </div>

      {/* Password reset section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handlePasswordReset}>
          <div className="mb-4">
            <PasswordInput
              id="currentPassword"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              label="Current Password"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="mb-4">
            <PasswordInput
              id="newPassword"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              label="New Password"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="mb-4">
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              label="Confirm New Password"
              required
              autoComplete="new-password"
              error={passwordError}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
