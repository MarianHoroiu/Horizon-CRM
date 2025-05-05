"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If the user is authenticated, redirect to dashboard or show authenticated homepage
  const isAuthenticated = status === "authenticated";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <div className="w-full max-w-5xl items-center justify-between lg:flex">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl md:text-6xl font-bold">
            Horizon <span className="text-blue-600">CRM</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Manage your contacts and tasks efficiently
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 lg:flex-row lg:justify-start">
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
                  Go to Dashboard
                </Link>
                <Link
                  href="/dashboard/contacts"
                  className="rounded-lg border border-blue-600 px-6 py-3 font-medium text-blue-600 hover:bg-blue-50">
                  View Contacts
                </Link>
                <Link
                  href="/dashboard/tasks"
                  className="rounded-lg border border-blue-600 px-6 py-3 font-medium text-blue-600 hover:bg-blue-50">
                  Manage Tasks
                </Link>
              </>
            )}
          </div>

          {isAuthenticated && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-blue-800">
                Welcome back, {session?.user?.name || session?.user?.email}! You
                are signed in.
              </p>
            </div>
          )}

          <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-100">
            <h2 className="text-2xl font-semibold mb-3">About Horizon CRM</h2>
            <p className="text-gray-700">
              Horizon CRM helps you manage customer relationships, track sales
              leads, and organize your tasks efficiently. Our platform provides
              powerful tools for businesses of all sizes.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
