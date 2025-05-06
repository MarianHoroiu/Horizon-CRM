"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { searchContacts, getContacts } from "@/lib/services/contactService";
import debounce from "lodash/debounce";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
};

export default function ContactsPage() {
  const { data: session } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showCompanyFilter, setShowCompanyFilter] = useState(false);

  // Refs for dropdown positioning
  const companyFilterRef = useRef<HTMLTableCellElement>(null);
  const statusFilterRef = useRef<HTMLTableCellElement>(null);
  const [companyDropdownPosition, setCompanyDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const [statusDropdownPosition, setStatusDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const [isMounted, setIsMounted] = useState(false);

  // Extract unique values for filters
  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(allContacts.map(contact => contact.status))];
    return statuses.sort();
  }, [allContacts]);

  const uniqueCompanies = useMemo(() => {
    const companies = [
      ...new Set(allContacts.map(contact => contact.company).filter(Boolean)),
    ];
    return companies.sort();
  }, [allContacts]);

  // Update position of dropdowns when they are shown
  useEffect(() => {
    if (showCompanyFilter && companyFilterRef.current) {
      const rect = companyFilterRef.current.getBoundingClientRect();
      setCompanyDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right - 192 + window.scrollX, // 192px is w-48
      });
    }
  }, [showCompanyFilter]);

  useEffect(() => {
    if (showStatusFilter && statusFilterRef.current) {
      const rect = statusFilterRef.current.getBoundingClientRect();
      setStatusDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right - 192 + window.scrollX, // 192px is w-48
      });
    }
  }, [showStatusFilter]);

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch all contacts on initial load
  const fetchContacts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getContacts();
      setContacts(data.contacts);
      setAllContacts(data.contacts);
    } catch (err) {
      setError("Failed to load contacts");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter contacts based on search query and filter selections
  const filterContacts = useCallback(() => {
    let filtered = [...allContacts];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        contact =>
          contact.firstName.toLowerCase().includes(query) ||
          contact.lastName.toLowerCase().includes(query) ||
          (contact.email && contact.email.toLowerCase().includes(query)) ||
          (contact.company && contact.company.toLowerCase().includes(query)) ||
          (contact.phone && contact.phone.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    // Apply company filter
    if (companyFilter) {
      filtered = filtered.filter(contact => contact.company === companyFilter);
    }

    setContacts(filtered);
  }, [allContacts, searchQuery, statusFilter, companyFilter]);

  // Handle search with debouncing to prevent excessive API calls
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        fetchContacts();
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await searchContacts(query);
        setContacts(data.contacts);
        setAllContacts(data.contacts);
      } catch (err) {
        setError("Search failed");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  // Effect to load contacts on component mount
  useEffect(() => {
    fetchContacts();
    // Cleanup function for the debounced search
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Effect to apply filters when filter state changes
  useEffect(() => {
    if (allContacts.length > 0) {
      filterContacts();
    }
  }, [filterContacts, statusFilter, companyFilter]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Sanitize the input to prevent XSS
    const sanitizedValue = value.replace(/<\/?[^>]+(>|$)/g, "");
    setSearchQuery(sanitizedValue);
    debouncedSearch(sanitizedValue);
  };

  // Handle filter selection
  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
    setShowStatusFilter(false);
  };

  const handleCompanyFilter = (company: string | null) => {
    setCompanyFilter(company);
    setShowCompanyFilter(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        !target.closest('[data-filter="status"]') &&
        !target.closest("#status-dropdown")
      ) {
        setShowStatusFilter(false);
      }

      if (
        !target.closest('[data-filter="company"]') &&
        !target.closest("#company-dropdown")
      ) {
        setShowCompanyFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Company filter dropdown portal
  const CompanyFilterDropdown = () => {
    if (!isMounted) return null;

    return createPortal(
      <div
        id="company-dropdown"
        className="absolute z-50 bg-white border rounded-md shadow-lg overflow-hidden"
        style={{
          top: `${companyDropdownPosition.top}px`,
          left: `${companyDropdownPosition.left}px`,
          width: "12rem",
          maxHeight: "300px",
        }}>
        <ul className="py-1 overflow-y-auto max-h-60">
          <li>
            <button
              onClick={() => handleCompanyFilter(null)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700">
              Show All
            </button>
          </li>
          {uniqueCompanies.map(company => (
            <li key={company}>
              <button
                onClick={() => handleCompanyFilter(company)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700">
                {company}
              </button>
            </li>
          ))}
        </ul>
      </div>,
      document.body
    );
  };

  // Status filter dropdown portal
  const StatusFilterDropdown = () => {
    if (!isMounted) return null;

    return createPortal(
      <div
        id="status-dropdown"
        className="absolute z-50 bg-white border rounded-md shadow-lg overflow-hidden"
        style={{
          top: `${statusDropdownPosition.top}px`,
          left: `${statusDropdownPosition.left}px`,
          width: "12rem",
          maxHeight: "300px",
        }}>
        <ul className="py-1 overflow-y-auto max-h-60">
          <li>
            <button
              onClick={() => handleStatusFilter(null)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700">
              Show All
            </button>
          </li>
          {uniqueStatuses.map(status => (
            <li key={status}>
              <button
                onClick={() => handleStatusFilter(status)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700">
                {status}
              </button>
            </li>
          ))}
        </ul>
      </div>,
      document.body
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Contacts</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Contacts</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Add Contact
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search contacts"
            />
            <div className="absolute left-3 top-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                    data-filter="company"
                    ref={companyFilterRef}>
                    <div className="flex items-center gap-1">
                      <span className={companyFilter ? "text-blue-600" : ""}>
                        Company
                      </span>
                      <button
                        onClick={() => setShowCompanyFilter(!showCompanyFilter)}
                        className={`${
                          companyFilter
                            ? "text-blue-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                        aria-label="Filter by company">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Render company dropdown through portal */}
                    {showCompanyFilter && <CompanyFilterDropdown />}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                    data-filter="status"
                    ref={statusFilterRef}>
                    <div className="flex items-center gap-1">
                      <span className={statusFilter ? "text-blue-600" : ""}>
                        Status
                      </span>
                      <button
                        onClick={() => setShowStatusFilter(!showStatusFilter)}
                        className={`${
                          statusFilter
                            ? "text-blue-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                        aria-label="Filter by status">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Render status dropdown through portal */}
                    {showStatusFilter && <StatusFilterDropdown />}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      No contacts found
                    </td>
                  </tr>
                ) : (
                  contacts.map(contact => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {contact.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {contact.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {contact.company}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            contact.status === "LEAD"
                              ? "bg-blue-100 text-blue-800"
                              : contact.status === "PROSPECT"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {contacts.length} of {allContacts.length} contacts
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 border rounded bg-gray-100 text-gray-600"
              disabled>
              Previous
            </button>
            <button
              className="px-3 py-1 border rounded bg-gray-100 text-gray-600"
              disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
