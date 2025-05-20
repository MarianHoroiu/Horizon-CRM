import React from "react";
import { FiArrowUp, FiArrowDown, FiCheck } from "react-icons/fi";

export type SortField = "dueDate" | "createdAt";
export type SortOrder = "asc" | "desc";

interface TaskSortControlProps {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (_newField: SortField, _newOrder: SortOrder) => void;
}

export default function TaskSortControl({
  sortBy,
  sortOrder,
  onSortChange,
}: TaskSortControlProps) {
  // Options are defined inline in buttons for simplicity

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Sort by:</span>
      <div className="relative inline-block">
        <button
          className="inline-flex items-center justify-between w-40 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onClick={() => {
            // Toggle order when clicking the same field
            if (sortBy === "dueDate") {
              onSortChange("dueDate", sortOrder === "asc" ? "desc" : "asc");
            } else {
              onSortChange("dueDate", "asc");
            }
          }}>
          <span>Due Date</span>
          {sortBy === "dueDate" && (
            <span className="ml-1">
              {sortOrder === "asc" ? <FiArrowUp /> : <FiArrowDown />}
            </span>
          )}
          {sortBy === "dueDate" && (
            <FiCheck className="ml-auto text-blue-500" />
          )}
        </button>
      </div>

      <div className="relative inline-block">
        <button
          className="inline-flex items-center justify-between w-40 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onClick={() => {
            // Toggle order when clicking the same field
            if (sortBy === "createdAt") {
              onSortChange("createdAt", sortOrder === "asc" ? "desc" : "asc");
            } else {
              onSortChange("createdAt", "asc");
            }
          }}>
          <span>Creation Date</span>
          {sortBy === "createdAt" && (
            <span className="ml-1">
              {sortOrder === "asc" ? <FiArrowUp /> : <FiArrowDown />}
            </span>
          )}
          {sortBy === "createdAt" && (
            <FiCheck className="ml-auto text-blue-500" />
          )}
        </button>
      </div>
    </div>
  );
}
