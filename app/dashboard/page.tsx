"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show dashboard content if authenticated
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {session?.user && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {`Welcome, ${session.user.firstName} ${session.user.lastName}.`}
          </h2>
          <p className="text-gray-600 mb-4">
            You are signed in as: {session.user.role}
          </p>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/dashboard/contacts"
                className="bg-blue-50 p-4 rounded-md hover:bg-blue-100 transition">
                <h4 className="font-medium">Contacts</h4>
                <p className="text-sm text-gray-600">Manage your contacts</p>
              </a>
              <a
                href="/dashboard/tasks"
                className="bg-green-50 p-4 rounded-md hover:bg-green-100 transition">
                <h4 className="font-medium">Tasks</h4>
                <p className="text-sm text-gray-600">View and manage tasks</p>
              </a>
              <a
                href="/dashboard/reports"
                className="bg-purple-50 p-4 rounded-md hover:bg-purple-100 transition">
                <h4 className="font-medium">Reports</h4>
                <p className="text-sm text-gray-600">
                  View performance reports
                </p>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
