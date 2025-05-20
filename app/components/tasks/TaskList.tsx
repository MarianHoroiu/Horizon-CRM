import React from "react";
import TaskCard from "./TaskCard";

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

interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  activeFilter: string;
  pagination?: PaginationInfo;
  onEdit: (_taskId: string) => void;
  onDelete: () => void;
  onStatusChange: (_updatedTask: Task) => void;
}

export default function TaskList({
  tasks,
  isLoading,
  error,
  activeFilter,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
        <span className="text-gray-500">Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        {activeFilter === "ALL"
          ? "No tasks found. Create your first task to get started."
          : `No ${activeFilter.toLowerCase().replace("_", " ")} tasks found.`}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
