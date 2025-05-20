"use client";

import React from "react";

// Define the possible task statuses
export const TASK_STATUSES = [
  { key: "ALL", label: "All Tasks" },
  { key: "PENDING", label: "Pending" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

interface TaskStatusFilterProps {
  activeFilter: string;
  setActiveFilter: (_filter: string) => void;
  counts?: Record<string, number>;
}

export default function TaskStatusFilter({
  activeFilter,
  setActiveFilter,
  counts = {},
}: TaskStatusFilterProps) {
  // Handle filter click with preventDefault to avoid page refresh
  const handleFilterClick = (filterKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveFilter(filterKey);
  };

  // Get status color class based on status
  const getStatusClass = (status: string) => {
    switch (status) {
      case "ALL":
        return "bg-purple-100 text-purple-800";
      case "PENDING":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="mb-6 flex flex-wrap gap-4">
      {TASK_STATUSES.map(status => {
        const isActive = activeFilter === status.key;
        const count =
          status.key === "ALL" ? counts.TOTAL || 0 : counts[status.key] || 0;

        return (
          <button
            key={status.key}
            className={`px-4 py-2 rounded-md transition-colors flex items-center border ${
              isActive
                ? `${getStatusClass(status.key)} border-transparent`
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={e => handleFilterClick(status.key, e)}
            aria-pressed={isActive}>
            <span>{status.label}</span>
            {count > 0 && (
              <span className="ml-2 bg-gray-200 text-gray-800 text-xs rounded-full px-2 py-1">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
