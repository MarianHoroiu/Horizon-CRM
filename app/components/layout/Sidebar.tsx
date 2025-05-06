"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HiChartPie,
  HiUsers,
  HiClipboardList,
  HiUser,
  HiLockClosed,
} from "react-icons/hi";
import { CgDetailsMore } from "react-icons/cg";
export default function Sidebar() {
  const pathname = usePathname();
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path ? "bg-gray-100 dark:bg-gray-700" : "";
  };

  return (
    <aside
      id="dashboard-sidebar"
      className="fixed top-16 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar">
      <div className="h-full px-3 py-4 overflow-y-auto bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <ul className="space-y-2 font-medium">
          <li>
            <Link
              href="/dashboard"
              className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${isActive(
                "/dashboard"
              )}`}>
              <HiChartPie className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ms-3">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/contacts"
              className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${isActive(
                "/dashboard/contacts"
              )}`}>
              <HiUsers className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ms-3">Contacts</span>
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/tasks"
              className={`flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group ${isActive(
                "/dashboard/tasks"
              )}`}>
              <HiClipboardList className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ms-3">Tasks</span>
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              aria-controls="dropdown-account"
              aria-expanded={isAccountOpen}>
              <HiUser className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="flex-1 ms-3 text-left whitespace-nowrap">
                Account
              </span>
              <svg
                className={`w-3 h-3 transition-transform ${
                  isAccountOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
            <ul
              id="dropdown-account"
              className={`${
                isAccountOpen ? "block" : "hidden"
              } py-2 space-y-2`}>
              <li>
                <Link
                  href="/dashboard/account/details"
                  className={`flex items-center p-2 ps-11 w-full text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${isActive(
                    "/dashboard/account/details"
                  )}`}>
                  <CgDetailsMore className="w-5 h-5 mr-2 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                  Details
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/account/change-password"
                  className={`flex items-center p-2 ps-11 w-full text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${isActive(
                    "/dashboard/account/change-password"
                  )}`}>
                  <HiLockClosed className="w-5 h-5 mr-2 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                  Change Password
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </aside>
  );
}
