"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path ? "bg-blue-800" : "";
  };

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <nav className="bg-blue-700">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
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
              {/* Icon when menu is open */}
              <svg
                className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
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
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {/* Navigation links for authenticated users */}
                {status === "authenticated" && (
                  <>
                    <Link
                      href="/dashboard"
                      className={`${isActive(
                        "/dashboard"
                      )} text-white rounded-md px-3 py-2 text-sm font-medium`}>
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/contacts"
                      className={`${isActive(
                        "/dashboard/contacts"
                      )} text-white rounded-md px-3 py-2 text-sm font-medium`}>
                      Contacts
                    </Link>
                    <Link
                      href="/dashboard/tasks"
                      className={`${isActive(
                        "/dashboard/tasks"
                      )} text-white rounded-md px-3 py-2 text-sm font-medium`}>
                      Tasks
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Authentication buttons */}
            {status === "authenticated" ? (
              <div className="flex items-center">
                <span className="text-white mr-4 hidden sm:block">
                  {session.user.role}
                </span>
                <Link
                  href="/dashboard/account"
                  className={`${isActive(
                    "/dashboard/account"
                  )} text-white rounded-md px-3 py-2 text-sm font-medium mr-2`}>
                  Account Settings
                </Link>
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

      {/* Mobile menu */}
      <div
        className={`${isMobileMenuOpen ? "block" : "hidden"} sm:hidden`}
        id="mobile-menu">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {/* Mobile navigation links for authenticated users */}
          {status === "authenticated" && (
            <>
              <Link
                href="/dashboard"
                className={`${isActive(
                  "/dashboard"
                )} text-white block rounded-md px-3 py-2 text-base font-medium`}>
                Dashboard
              </Link>
              <Link
                href="/dashboard/contacts"
                className={`${isActive(
                  "/dashboard/contacts"
                )} text-white block rounded-md px-3 py-2 text-base font-medium`}>
                Contacts
              </Link>
              <Link
                href="/dashboard/tasks"
                className={`${isActive(
                  "/dashboard/tasks"
                )} text-white block rounded-md px-3 py-2 text-base font-medium`}>
                Tasks
              </Link>
              <Link
                href="/dashboard/account"
                className={`${isActive(
                  "/dashboard/account"
                )} text-white block rounded-md px-3 py-2 text-base font-medium`}>
                Account Settings
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
