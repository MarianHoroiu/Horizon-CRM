"use client";

import React, { useState, useEffect, useCallback } from "react";
import NewTaskModal from "@/app/components/tasks/NewTaskModal";
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

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
      setIsMounted(true);
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
              <div
                key={task.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{task.title}</h3>
                    <p className="text-gray-600 mt-1 text-sm">
                      {task.description}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          task.status === "PENDING"
                            ? "bg-blue-100 text-blue-800"
                            : task.status === "IN_PROGRESS"
                            ? "bg-yellow-100 text-yellow-800"
                            : task.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                        {task.status.replace("_", " ")}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        Due {new Date(task.dueDate).toLocaleDateString()}
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
                  <span className="font-medium">Contact:</span>{" "}
                  {task.contact.firstName} {task.contact.lastName}
                  {task.contact.company && ` (${task.contact.company})`}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  <span className="font-medium">Assigned to:</span>{" "}
                  {task.assignedTo.firstName} {task.assignedTo.lastName}
                </div>
              </div>
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
            <button className="px-3 py-1 border rounded bg-blue-600 text-white">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {isMounted && showNewTaskModal && (
        <NewTaskModal
          isOpen={showNewTaskModal}
          onClose={() => setShowNewTaskModal(false)}
          onSuccess={handleTaskCreationSuccess}
          contacts={contacts}
        />
      )}
    </main>
  );
}
