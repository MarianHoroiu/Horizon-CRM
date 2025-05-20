"use client";

import React, { useState } from "react";
import { updateTaskStatus } from "@/lib/services/taskService";
import { FiCheck, FiClock, FiPlayCircle, FiXCircle } from "react-icons/fi";
import clsx from "clsx";

interface TaskActionsProps {
  taskId: string;
  currentStatus: string;
  onStatusChange: (_newStatus: string) => void;
}

export default function TaskActions({
  taskId,
  currentStatus,
  onStatusChange,
}: TaskActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    {
      value: "PENDING",
      label: "Pending",
      icon: <FiClock className="w-4 h-4" />,
      color: "text-blue-600 bg-blue-100",
    },
    {
      value: "IN_PROGRESS",
      label: "In Progress",
      icon: <FiPlayCircle className="w-4 h-4" />,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      value: "COMPLETED",
      label: "Completed",
      icon: <FiCheck className="w-4 h-4" />,
      color: "text-green-600 bg-green-100",
    },
    {
      value: "CANCELLED",
      label: "Cancelled",
      icon: <FiXCircle className="w-4 h-4" />,
      color: "text-red-600 bg-red-100",
    },
  ];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await updateTaskStatus(taskId, newStatus);
      onStatusChange(newStatus);
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  // Find the current status object for display
  const currentStatusOption = statusOptions.find(
    option => option.value === currentStatus
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={clsx(
          "flex items-center gap-1 px-2 py-1 rounded text-xs focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all",
          currentStatusOption?.color,
          isLoading ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true">
        {isLoading ? (
          <>
            <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-1"></span>
            <span>Updating...</span>
          </>
        ) : (
          <>
            {currentStatusOption?.icon}
            <span>{currentStatusOption?.label}</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10">
          <div className="py-1">
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                disabled={option.value === currentStatus || isLoading}
                className={clsx(
                  "flex items-center w-full px-4 py-2 text-sm",
                  option.value === currentStatus
                    ? "bg-gray-100 cursor-default"
                    : "hover:bg-gray-50 cursor-pointer",
                  "focus:outline-none focus:bg-gray-50"
                )}>
                <span
                  className={clsx(
                    "mr-2",
                    option.value === currentStatus ? "text-gray-400" : ""
                  )}>
                  {option.icon}
                </span>
                <span
                  className={
                    option.value === currentStatus ? "font-medium" : ""
                  }>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
