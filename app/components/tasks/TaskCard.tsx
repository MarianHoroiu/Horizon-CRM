"use client";

import React, { useState } from "react";
import { FiEdit2, FiUser, FiBriefcase } from "react-icons/fi";
import DeleteTaskButton from "./DeleteTaskButton";
import { Avatar } from "@/app/components/ui/Avatar";
import { Badge } from "@/app/components/ui/Badge";
import TaskActions from "./TaskActions";

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
  onStatusChange?: (_task: Task) => void;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const [currentTask, setCurrentTask] = useState<Task>(task);

  // Format the date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Generate user tooltip content
  const userTooltip = (
    <div>
      <p className="font-semibold">
        {currentTask.assignedTo.firstName} {currentTask.assignedTo.lastName}
      </p>
      <p className="text-xs text-gray-300">Assigned User</p>
    </div>
  );

  // Generate contact tooltip content
  const contactTooltip = (
    <div>
      <p className="font-semibold">
        {currentTask.contact.firstName} {currentTask.contact.lastName}
      </p>
      {currentTask.contact.company && (
        <p className="text-xs text-gray-300">{currentTask.contact.company}</p>
      )}
      <p className="text-xs text-gray-300">Contact</p>
    </div>
  );

  // Handle status changes
  const handleStatusChange = (newStatus: string) => {
    // Create updated task with new status
    const updatedTask = {
      ...currentTask,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    // Update local state first for immediate UI feedback
    setCurrentTask(updatedTask);

    // Notify parent component of the status change if callback is provided
    if (onStatusChange) {
      onStatusChange(updatedTask);
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{currentTask.title}</h3>
          <p className="text-gray-600 mt-1 text-sm">
            {currentTask.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
              Due {formatDate(currentTask.dueDate)}
            </span>

            {/* Task Status Actions Component */}
            <TaskActions
              taskId={currentTask.id}
              currentStatus={currentTask.status}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
            onClick={() => onEdit(currentTask.id)}
            aria-label="Edit task">
            <FiEdit2 className="h-5 w-5" />
          </button>
          {onDelete && (
            <DeleteTaskButton
              taskId={currentTask.id}
              taskTitle={currentTask.title}
              onSuccess={() => onDelete(currentTask.id)}
            />
          )}
        </div>
      </div>

      {/* Enhanced Contact and User Information */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-3">
        <div className="flex items-center gap-2">
          <Avatar
            firstName={currentTask.contact.firstName}
            lastName={currentTask.contact.lastName}
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
              {currentTask.contact.firstName} {currentTask.contact.lastName}
              {currentTask.contact.company && (
                <span className="text-gray-500 ml-1">
                  ({currentTask.contact.company})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Avatar
            firstName={currentTask.assignedTo.firstName}
            lastName={currentTask.assignedTo.lastName}
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
              {currentTask.assignedTo.firstName}{" "}
              {currentTask.assignedTo.lastName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
