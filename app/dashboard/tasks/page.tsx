"use client";

import React, { useState, useEffect, useCallback } from "react";
import NewTaskModal from "@/app/components/tasks/NewTaskModal";
import EditTaskModal from "@/app/components/tasks/EditTaskModal";
import TaskCard from "@/app/components/tasks/TaskCard";
import { getTasks } from "@/lib/services/taskService";
import { useToast } from "@/app/components/ui/Toast";
import { FiPlus } from "react-icons/fi";

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

export default function TasksPage() {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Fetch tasks from the API
  const fetchTasks = useCallback(
    async (skipCache = false) => {
      try {
        setIsLoading(true);
        const response = await getTasks(1, 50, skipCache);

        if (response.tasks && Array.isArray(response.tasks)) {
          setTasks(response.tasks);
        } else {
          console.error("Invalid tasks data format:", response);
          setTasks([]);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Failed to load tasks. Please try again.");
        showToast({
          message: "Failed to load tasks. Please try again.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  // Fetch contacts for the task creation modal
  const fetchContacts = useCallback(async () => {
    try {
      const response = await fetch("/api/protected/contacts");
      const data = await response.json();

      if (data.contacts && Array.isArray(data.contacts)) {
        setContacts(data.contacts);
      } else {
        console.error("Invalid contacts data format:", data);
        setContacts([]);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      showToast({
        message:
          "Failed to load contacts. You may not be able to create tasks.",
        type: "error",
      });
    }
  }, [showToast]);

  // Fetch data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchTasks();
      await fetchContacts();
    };

    loadInitialData();
  }, [fetchTasks, fetchContacts]);

  // Function to handle successful task creation
  const handleTaskCreationSuccess = async () => {
    setShowNewTaskModal(false);

    try {
      // Force refresh of tasks with cache busting
      await fetchTasks(true);

      showToast({
        message: "Task created successfully and list updated",
        type: "success",
      });
    } catch (error) {
      console.error("Error refreshing tasks:", error);
      showToast({
        message:
          "Task was created but failed to refresh the list. Please reload the page.",
        type: "error",
      });
    }
  };

  // Function to handle task edit button click
  const handleEditTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowEditTaskModal(true);
  };

  // Function to handle successful task update
  const handleTaskUpdateSuccess = async () => {
    setShowEditTaskModal(false);
    setSelectedTaskId(null);

    try {
      // Force refresh of tasks with cache busting
      await fetchTasks(true);

      showToast({
        message: "Task updated successfully and list updated",
        type: "success",
      });
    } catch (error) {
      console.error("Error refreshing tasks:", error);
      showToast({
        message:
          "Task was updated but failed to refresh the list. Please reload the page.",
        type: "error",
      });
    }
  };

  // Function to handle task deletion
  const handleTaskDeletion = async () => {
    try {
      // Force refresh of tasks with cache busting
      await fetchTasks(true);
    } catch (error) {
      console.error("Error refreshing tasks after deletion:", error);
      showToast({
        message: "Failed to refresh the task list. Please reload the page.",
        type: "error",
      });
    }
  };

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl text-slate-800 font-bold mb-6">
        Tasks
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Tasks</h2>
          <button
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => setShowNewTaskModal(true)}>
            <FiPlus className="w-5 h-5 mr-2" />
            <span>Create Task</span>
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

        {isLoading ? (
          <div className="py-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-gray-500">Loading tasks...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No tasks found. Create your first task to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleTaskDeletion}
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {tasks.length > 0
              ? `Showing ${tasks.length} tasks`
              : "No tasks to display"}
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 border rounded bg-gray-100 text-gray-600"
              disabled>
              Previous
            </button>
            <button
              className="px-3 py-1 border rounded bg-blue-600 text-white"
              disabled>
              1
            </button>
            <button
              className="px-3 py-1 border rounded bg-gray-100 text-gray-600"
              disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <NewTaskModal
          isOpen={showNewTaskModal}
          onClose={() => setShowNewTaskModal(false)}
          onSuccess={handleTaskCreationSuccess}
          contacts={contacts}
        />
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && selectedTaskId && (
        <EditTaskModal
          isOpen={showEditTaskModal}
          onClose={() => {
            setShowEditTaskModal(false);
            setSelectedTaskId(null);
          }}
          onSuccess={handleTaskUpdateSuccess}
          contacts={contacts}
          taskId={selectedTaskId}
        />
      )}
    </main>
  );
}
