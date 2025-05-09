// Helper function to handle API responses
const handleResponse = async (response: Response) => {
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

// Search contacts with proper error handling
export const searchContacts = async (
  query: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    // Encode the query parameter to prevent URL injection
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `/api/protected/contacts/search?query=${encodedQuery}&page=${page}&limit=${limit}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error searching contacts:", error);
    throw error;
  }
};

// Get all contacts with proper error handling
export const getContacts = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await fetch(
      `/api/protected/contacts?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

// Get a single contact by ID
export const getContactById = async (contactId: string) => {
  try {
    const url = `/api/protected/contacts?id=${contactId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching contact:", error);
    throw error;
  }
};

// Create a new contact with proper error handling
export const createContact = async (contactData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  status: string;
}) => {
  try {
    const response = await fetch("/api/protected/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
};

// Update an existing contact
export const updateContact = async (
  contactId: string,
  contactData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    status: string;
  }
) => {
  try {
    const url = `/api/protected/contacts?id=${contactId}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
};

// Delete a contact with proper error handling
export const deleteContact = async (contactId: string) => {
  try {
    const url = `/api/protected/contacts?id=${contactId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};
