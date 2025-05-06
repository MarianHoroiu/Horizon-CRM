// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "An error occurred");
  }
  return response.json();
};

// Search contacts with proper error handling
export const searchContacts = async (query: string) => {
  try {
    // Encode the query parameter to prevent URL injection
    const encodedQuery = encodeURIComponent(query.trim());
    const response = await fetch(
      `/api/protected/contacts/search?query=${encodedQuery}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return handleResponse(response);
  } catch (error) {
    console.error("Error searching contacts:", error);
    throw error;
  }
};

// Get all contacts with proper error handling
export const getContacts = async () => {
  try {
    const response = await fetch("/api/protected/contacts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching contacts:", error);
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
