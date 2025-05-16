"use client";

import React from "react";
import { FiEdit2 } from "react-icons/fi";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  assignedTo: User;
  contact: Contact;
  createdAt: string;
  updatedAt: string;
}

interface TaskCardProps {
  task: Task;
  onEdit: (_taskId: string) => void;
  onDelete?: (_taskId: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  // Format the date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status color class based on status
  const getStatusClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format status text for display
  const formatStatus = (status: string) => {
    return status.replace("_", " ");
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{task.title}</h3>
          <p className="text-gray-600 mt-1 text-sm">{task.description}</p>
          <div className="mt-2 flex gap-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${getStatusClass(
                task.status
              )}`}>
              {formatStatus(task.status)}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
              Due {formatDate(task.dueDate)}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-500">
        <span className="font-medium">Contact:</span> {task.contact.firstName}{" "}
        {task.contact.lastName}
        {task.contact.company && ` (${task.contact.company})`}
      </div>
      <div className="mt-1 text-sm text-gray-500">
        <span className="font-medium">Assigned to:</span>{" "}
        {task.assignedTo.firstName} {task.assignedTo.lastName}
      </div>
    </div>
  );
}
