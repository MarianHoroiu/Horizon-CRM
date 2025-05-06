"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  // Function to toggle the sidebar on mobile
  const toggleSidebar = () => {
    const sidebar = document.getElementById("dashboard-sidebar");
    if (sidebar) {
      sidebar.classList.toggle("-translate-x-full");
    }
  };

  const isDashboardPath = pathname.startsWith("/dashboard");

  return (
    <nav className="bg-blue-700 fixed w-full z-50">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {isDashboardPath && status === "authenticated" && (
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* Mobile menu button for sidebar */}
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleSidebar}
                aria-controls="dashboard-sidebar"
                aria-expanded="false">
                <span className="sr-only">Open sidebar menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
            </div>
          )}

          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="Horizon CRM Logo"
                  width={40}
                  height={40}
                  className="mr-2"
                />
              </Link>
            </div>
            {!isDashboardPath && (
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  {/* Public navigation links */}
                  <Link
                    href="/"
                    className={`${
                      pathname === "/" ? "bg-blue-800" : ""
                    } text-white rounded-md px-3 py-2 text-sm font-medium`}>
                    Home
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Authentication buttons */}
            {status === "authenticated" ? (
              <div className="flex items-center">
                <span className="text-white mr-4 hidden sm:block">
                  {session.user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500">
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
