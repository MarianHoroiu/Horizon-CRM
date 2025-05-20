// Type definitions
export interface TaskData {
  title: string;
  description: string;
  status: string;
  dueDate: string;
  contactId: string;
}

export interface TaskStatusData {
  status: string;
}

export interface TaskResponse {
  tasks?: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    dueDate: string;
    contactId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    assignedTo: {
      id: string;
      firstName: string;
      lastName: string;
    };
    contact: {
      id: string;
      firstName: string;
      lastName: string;
      company?: string;
    };
  }>;
  pagination?: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  counts?: {
    TOTAL: number;
    PENDING: number;
    IN_PROGRESS: number;
    COMPLETED: number;
    CANCELLED: number;
  };
}

export interface SingleTaskResponse {
  task: {
    id: string;
    title: string;
    description: string;
    status: string;
    dueDate: string;
    contactId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    assignedTo: {
      id: string;
      firstName: string;
      lastName: string;
    };
    contact: {
      id: string;
      firstName: string;
      lastName: string;
      company?: string;
    };
  };
}

// Helper function to handle API responses
const handleResponse = async (response: Response): Promise<unknown> => {
  if (!response.ok) {
    console.error(`API error: ${response.status} ${response.statusText}`);
    let errorData: { error?: string } = {};
    try {
      errorData = await response.json();
    } catch (e) {
      console.error("Failed to parse error response as JSON:", e);
      errorData = {
        error: `HTTP error ${response.status}: ${response.statusText}`,
      };
    }
    throw new Error(
      errorData.error || `HTTP error ${response.status}: ${response.statusText}`
    );
  }

  // Check if response is empty (204 No Content or empty body)
  const contentType = response.headers.get("content-type");

  if (response.status === 204) {
    console.warn("204 No Content response - returning empty object");
    return {}; // Return empty object for 204 No Content
  }

  if (!contentType || !contentType.includes("application/json")) {
    console.warn(`Non-JSON content type: ${contentType}, treating as empty`);
    return {}; // Return empty object for non-JSON responses
  }

  // Check content length if available
  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength) === 0) {
    console.warn("Zero content length, returning empty object");
    return {}; // Return empty object for zero-length responses
  }

  try {
    const text = await response.text();

    if (!text || text.trim() === "") {
      console.warn("Empty response text, returning empty object");
      return {};
    }

    return JSON.parse(text);
  } catch (error: unknown) {
    console.error("Error parsing JSON response:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to parse response: ${error.message}`);
    } else {
      throw new Error("Failed to parse response: Unknown error");
    }
  }
};

// Get all tasks with proper error handling
export const getTasks = async (
  page: number = 1,
  limit: number = 10,
  skipCache: boolean = false,
  status?: string
): Promise<TaskResponse> => {
  try {
    // Add a cache-busting query parameter if skipCache is true
    const cacheBuster = skipCache ? `&_=${Date.now()}` : "";
    // Add status filter if provided (and not 'ALL')
    const statusFilter = status && status !== "ALL" ? `&status=${status}` : "";

    const response = await fetch(
      `/api/tasks?page=${page}&limit=${limit}${statusFilter}${cacheBuster}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Skip cache when needed
        cache: skipCache ? "no-store" : "default",
      }
    );

    return handleResponse(response) as Promise<TaskResponse>;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// Get a single task by ID
export const getTaskById = async (
  taskId: string,
  skipCache: boolean = false,
  signal?: AbortSignal
): Promise<SingleTaskResponse> => {
  try {
    // Add a cache-busting query parameter if skipCache is true
    const cacheBuster = skipCache ? `?_=${Date.now()}` : "";
    const response = await fetch(`/api/tasks/${taskId}${cacheBuster}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Skip cache when needed
      cache: skipCache ? "no-store" : "default",
      signal, // Add AbortSignal for cancellation
    });

    return handleResponse(response) as Promise<SingleTaskResponse>;
  } catch (error) {
    // Don't log aborted requests as errors
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Fetch aborted:", taskId);
      // Rethrow the error so caller can handle it
      throw error;
    }

    console.error("Error fetching task:", error);
    throw error;
  }
};

// Create a new task with proper error handling
export const createTask = async (
  taskData: TaskData
): Promise<SingleTaskResponse> => {
  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    return handleResponse(response) as Promise<SingleTaskResponse>;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// Update an existing task
export const updateTask = async (
  taskId: string,
  taskData: TaskData,
  skipCache: boolean = true, // Default to true to always bust cache after updates
  signal?: AbortSignal
): Promise<SingleTaskResponse> => {
  try {
    // Add a cache-busting query parameter if skipCache is true
    const cacheBuster = skipCache ? `?_=${Date.now()}` : "";
    const response = await fetch(`/api/tasks/${taskId}${cacheBuster}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
      // Skip cache when needed
      cache: skipCache ? "no-store" : "default",
      signal, // Add AbortSignal for cancellation
    });

    return handleResponse(response) as Promise<SingleTaskResponse>;
  } catch (error) {
    // Don't log aborted requests as errors
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Update aborted:", taskId);
      // Rethrow the error so caller can handle it
      throw error;
    }

    console.error("Error updating task:", error);
    throw error;
  }
};

// Update only a task's status
export const updateTaskStatus = async (
  taskId: string,
  status: string,
  skipCache: boolean = true,
  signal?: AbortSignal
): Promise<SingleTaskResponse> => {
  try {
    // Add a cache-busting query parameter if skipCache is true
    const cacheBuster = skipCache ? `?_=${Date.now()}` : "";
    const response = await fetch(`/api/tasks/${taskId}${cacheBuster}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
      // Skip cache when needed
      cache: skipCache ? "no-store" : "default",
      signal, // Add AbortSignal for cancellation
    });

    return handleResponse(response) as Promise<SingleTaskResponse>;
  } catch (error) {
    // Don't log aborted requests as errors
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Status update aborted:", taskId);
      // Rethrow the error so caller can handle it
      throw error;
    }

    console.error("Error updating task status:", error);
    throw error;
  }
};

// Delete a task with proper error handling
export const deleteTask = async (
  taskId: string
): Promise<{ message?: string }> => {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse(response) as Promise<{ message?: string }>;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};
