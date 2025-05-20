"use client";

import React from "react";
import { FiEdit2, FiUser, FiBriefcase } from "react-icons/fi";
import DeleteTaskButton from "./DeleteTaskButton";
import { Avatar } from "@/app/components/ui/Avatar";
import { Badge } from "@/app/components/ui/Badge";

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
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format status text for display
  const formatStatus = (status: string) => {
    return status.replace("_", " ");
  };

  // Generate user tooltip content
  const userTooltip = (
    <div>
      <p className="font-semibold">
        {task.assignedTo.firstName} {task.assignedTo.lastName}
      </p>
      <p className="text-xs text-gray-300">Assigned User</p>
    </div>
  );

  // Generate contact tooltip content
  const contactTooltip = (
    <div>
      <p className="font-semibold">
        {task.contact.firstName} {task.contact.lastName}
      </p>
      {task.contact.company && (
        <p className="text-xs text-gray-300">{task.contact.company}</p>
      )}
      <p className="text-xs text-gray-300">Contact</p>
    </div>
  );

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
        <div className="flex gap-2">
          <button
            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
            onClick={() => onEdit(task.id)}
            aria-label="Edit task">
            <FiEdit2 className="h-5 w-5" />
          </button>
          {onDelete && (
            <DeleteTaskButton
              taskId={task.id}
              taskTitle={task.title}
              onSuccess={() => onDelete(task.id)}
            />
          )}
        </div>
      </div>

      {/* Enhanced Contact and User Information */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-3">
        <div className="flex items-center gap-2">
          <Avatar
            firstName={task.contact.firstName}
            lastName={task.contact.lastName}
            size="sm"
            tooltipContent={contactTooltip}
          />
          <div>
            <Badge
              text="Contact"
              variant="contact"
              size="sm"
              icon={<FiBriefcase className="w-3 h-3" />}
            />
            <p className="text-sm font-medium mt-0.5">
              {task.contact.firstName} {task.contact.lastName}
              {task.contact.company && (
                <span className="text-gray-500 ml-1">
                  ({task.contact.company})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Avatar
            firstName={task.assignedTo.firstName}
            lastName={task.assignedTo.lastName}
            size="sm"
            tooltipContent={userTooltip}
          />
          <div>
            <Badge
              text="Assigned To"
              variant="user"
              size="sm"
              icon={<FiUser className="w-3 h-3" />}
            />
            <p className="text-sm font-medium mt-0.5">
              {task.assignedTo.firstName} {task.assignedTo.lastName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
