"use client";

import React from "react";
import { useSession } from "next-auth/react";

// Dummy data for report visualizations
const monthlyData = [
  { month: "Jan", leads: 12, customers: 5 },
  { month: "Feb", leads: 18, customers: 7 },
  { month: "Mar", leads: 23, customers: 10 },
  { month: "Apr", leads: 29, customers: 12 },
  { month: "May", leads: 34, customers: 16 },
  { month: "Jun", leads: 40, customers: 20 },
];

export default function ReportsPage() {
  const { data: session } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Contacts Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Total Contacts
              </p>
              <h2 className="text-3xl font-bold mt-1">254</h2>
              <p className="text-green-600 text-sm font-medium mt-2">
                <span className="inline-block mr-1">↑</span>
                12% from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Tasks Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Tasks</p>
              <h2 className="text-3xl font-bold mt-1">42</h2>
              <p className="text-yellow-600 text-sm font-medium mt-2">
                <span className="inline-block mr-1">↓</span>
                4% from last month
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Conversion Rate
              </p>
              <h2 className="text-3xl font-bold mt-1">24.8%</h2>
              <p className="text-green-600 text-sm font-medium mt-2">
                <span className="inline-block mr-1">↑</span>
                2.3% from last month
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Conversion Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Lead Conversion</h2>
          <div className="flex justify-between mb-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">New Leads</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">
                Converted to Customers
              </span>
            </div>
          </div>
          <div className="mt-4 h-64 flex items-end space-x-2">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${data.leads * 3}px` }}></div>
                  <div
                    className="w-full bg-green-500 rounded-t absolute bottom-0"
                    style={{ height: `${data.customers * 3}px` }}></div>
                </div>
                <span className="text-xs mt-2 text-gray-500">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Contact Status Distribution
          </h2>
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              {/* Simple pie chart visualization */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Lead slice - 40% */}
                <path
                  d="M50,50 L50,0 A50,50 0 0,1 97.5,33.5 Z"
                  fill="#3B82F6"></path>
                {/* Prospect slice - 25% */}
                <path
                  d="M50,50 L97.5,33.5 A50,50 0 0,1 80.9,90.5 Z"
                  fill="#10B981"></path>
                {/* Customer slice - 25% */}
                <path
                  d="M50,50 L80.9,90.5 A50,50 0 0,1 19.1,90.5 Z"
                  fill="#6366F1"></path>
                {/* Inactive slice - 10% */}
                <path
                  d="M50,50 L19.1,90.5 A50,50 0 0,1 2.5,33.5 L50,0 Z"
                  fill="#9CA3AF"></path>
                {/* Center circle */}
                <circle cx="50" cy="50" r="20" fill="white"></circle>
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Leads (40%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Prospects (25%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Customers (25%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Inactive (10%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Export Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>Contact Report</span>
          </button>
          <button className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>Task Report</span>
          </button>
          <button className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>Conversion Report</span>
          </button>
          <button className="flex items-center justify-center gap-2 p-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>Full Data Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}
