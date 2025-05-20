"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NewTaskModal from "@/app/components/tasks/NewTaskModal";
import EditTaskModal from "@/app/components/tasks/EditTaskModal";

import TaskStatusFilter from "@/app/components/tasks/TaskStatusFilter";
import TaskList from "@/app/components/tasks/TaskList";
import TaskSortControl, {
  SortField,
  SortOrder,
} from "@/app/components/tasks/TaskSortControl";
import { Pagination } from "@/app/components/ui/Pagination";
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

interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL params or use defaults
  const getInitialParam = (key: string, defaultValue: string): string => {
    const param = searchParams.get(key);
    return param || defaultValue;
  };

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State with URL param initialization
  const [activeFilter, setActiveFilter] = useState(
    getInitialParam("status", "ALL")
  );
  const [sortBy, setSortBy] = useState(getInitialParam("sortBy", "createdAt"));
  const [sortOrder, setSortOrder] = useState<string>(
    getInitialParam("order", "desc")
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(getInitialParam("page", "1"), 10)
  );
  const [pageSize, setPageSize] = useState(
    parseInt(getInitialParam("limit", "10"), 10)
  );

  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 1,
    page: currentPage,
    limit: pageSize,
  });

  const { showToast } = useToast();

  // Update URL when filter, sort or pagination changes
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    // Only add params that are different from defaults
    if (activeFilter !== "ALL") params.set("status", activeFilter);
    if (sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("order", sortOrder);
    if (currentPage !== 1) params.set("page", currentPage.toString());
    if (pageSize !== 10) params.set("limit", pageSize.toString());

    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : "";

    // Update URL without reloading the page
    router.push(`/dashboard/tasks${url}`, { scroll: false });
  }, [activeFilter, sortBy, sortOrder, currentPage, pageSize, router]);

  // Update URL when parameters change
  useEffect(() => {
    updateUrlParams();
  }, [activeFilter, sortBy, sortOrder, currentPage, pageSize, updateUrlParams]);

  // Fetch tasks from the API
  const fetchTasks = useCallback(
    async (skipCache = false) => {
      try {
        setIsLoading(true);
        // Pass the active filter, sort params, and pagination to the API
        const response = await getTasks(
          currentPage,
          pageSize,
          skipCache,
          activeFilter,
          sortBy,
          sortOrder
        );

        if (response.tasks && Array.isArray(response.tasks)) {
          setTasks(response.tasks);

          // Set task counts if available in response
          if (response.counts) {
            setTaskCounts(response.counts);
          }

          // Set pagination info
          if (response.pagination) {
            setPagination(response.pagination);
          }
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
    [showToast, activeFilter, sortBy, sortOrder, currentPage, pageSize]
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

  // Fetch data on component mount and when filter, sort, or pagination parameters change
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchTasks();
      // Only fetch contacts once on initial load
      if (contacts.length === 0) {
        await fetchContacts();
      }
    };

    loadInitialData();
  }, [fetchTasks, fetchContacts, contacts.length]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    // Update the active filter state
    setActiveFilter(filter);
    // Reset to first page when changing filters
    setCurrentPage(1);
    // Reset any error when changing filters
    setError(null);
  };

  // Handle sort change
  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortBy(field);
    setSortOrder(order);
    // Reset to first page when changing sort
    setCurrentPage(1);
  };

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

  // Function to handle task status changes
  const handleTaskStatusChange = async (updatedTask: Task) => {
    try {
      // Refresh the task list to get the latest data
      await fetchTasks(true);

      showToast({
        message: `Task status updated to ${updatedTask.status.replace(
          "_",
          " "
        )}`,
        type: "success",
      });
    } catch (error) {
      console.error("Error refreshing tasks after status change:", error);
      showToast({
        message:
          "Status was updated but failed to refresh the list. Please reload the page.",
        type: "error",
      });
    }
  };

  // Get title text based on active filter
  const getTasksTitle = () => {
    if (activeFilter === "ALL") return "All Tasks";
    return `${activeFilter.replace("_", " ")} Tasks`;
  };

  // Format the showing text
  const getShowingText = (range: {
    start: number;
    end: number;
    total: number;
  }) => {
    return `Showing ${range.start}-${range.end} of ${range.total} tasks`;
  };

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl text-slate-800 font-bold mb-6">
        Tasks
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{getTasksTitle()}</h2>
          <button
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => setShowNewTaskModal(true)}>
            <FiPlus className="w-5 h-5 mr-2" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Task Status Filter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
          <TaskStatusFilter
            activeFilter={activeFilter}
            setActiveFilter={handleFilterChange}
            counts={taskCounts}
          />

          <TaskSortControl
            sortBy={sortBy as SortField}
            sortOrder={sortOrder as SortOrder}
            onSortChange={handleSortChange}
          />
        </div>

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          error={error}
          activeFilter={activeFilter}
          pagination={pagination}
          onEdit={handleEditTask}
          onDelete={handleTaskDeletion}
          onStatusChange={handleTaskStatusChange}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={pagination.pages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[6, 10, 20, 50]}
          totalItems={pagination.total}
          showingText={getShowingText}
        />
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
