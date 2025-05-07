"use client";

import React from "react";

export default function TasksPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Tasks</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Create Task
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors">
            All Tasks
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-100 transition-colors border">
            Pending
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-100 transition-colors border">
            In Progress
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-100 transition-colors border">
            Completed
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-100 transition-colors border">
            Cancelled
          </button>
        </div>

        <div className="space-y-4">
          {/* Task 1 */}
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">Initial outreach call</h3>
                <p className="text-gray-600 mt-1 text-sm">
                  Introduce our services and schedule a demo
                </p>
                <div className="mt-2 flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Pending
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    Due in 7 days
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 hover:text-blue-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button className="p-2 text-red-600 hover:text-red-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              <span className="font-medium">Contact:</span> John Smith (ABC
              Corp)
            </div>
            <div className="mt-1 text-sm text-gray-500">
              <span className="font-medium">Assigned to:</span> Sales
              Representative
            </div>
          </div>

          {/* Task 2 */}
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">Prepare proposal</h3>
                <p className="text-gray-600 mt-1 text-sm">
                  Create custom proposal based on client needs
                </p>
                <div className="mt-2 flex gap-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    In Progress
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Due in 3 days
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 hover:text-blue-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button className="p-2 text-red-600 hover:text-red-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-500">
              <span className="font-medium">Contact:</span> Sarah Johnson (XYZ
              Industries)
            </div>
            <div className="mt-1 text-sm text-gray-500">
              <span className="font-medium">Assigned to:</span> Manager User
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">Showing 2 of 4 tasks</div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 border rounded bg-gray-100 text-gray-600"
              disabled>
              Previous
            </button>
            <button className="px-3 py-1 border rounded bg-blue-600 text-white">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
