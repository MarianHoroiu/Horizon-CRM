"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import {
  searchContacts,
  getContacts,
  deleteContact,
} from "@/lib/services/contactService";
import debounce from "lodash/debounce";
import AddContactModal from "@/app/components/form/AddContactModal";
import DeleteConfirmationModal from "@/app/components/form/DeleteConfirmationModal";
import { useToast } from "@/app/components/ui/Toast";

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddContactModal, setShowAddContactModal] = useState(false);

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

  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

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
  const debouncedFetchHandler = useMemo(
    () =>
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

  const debouncedSearch = useCallback(
    (query: string) => {
      debouncedFetchHandler(query);
    },
    [debouncedFetchHandler]
  );

  // Effect to load contacts on component mount
  useEffect(() => {
    fetchContacts();
    // Cleanup function for the debounced search
    return () => {
      debouncedFetchHandler.cancel();
    };
  }, [debouncedFetchHandler]);

  // Effect to apply filters when filter state changes
  useEffect(() => {
    if (allContacts.length > 0) {
      filterContacts();
    }
  }, [filterContacts, statusFilter, companyFilter, allContacts.length]);

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

  // Handle new contact creation success
  const handleContactCreationSuccess = () => {
    setShowAddContactModal(false);
    fetchContacts(); // Refresh the contacts list
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

  // Handle contact deletion
  const handleDeleteClick = (contact: Contact) => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setContactToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteContact(contactToDelete.id);

      // Update the contacts list after successful deletion
      setContacts(contacts.filter(c => c.id !== contactToDelete.id));
      setAllContacts(allContacts.filter(c => c.id !== contactToDelete.id));

      // Close the modal
      setShowDeleteModal(false);
      setContactToDelete(null);

      // Show success toast
      showToast({
        message: `Your contact ${contactToDelete.firstName} ${contactToDelete.lastName} has been deleted successfully`,
        type: "success",
        duration: 4000,
      });
    } catch (err) {
      setError("Failed to delete contact");
      console.error(err);

      // Show error toast
      showToast({
        message: `Failed to delete contact: ${contactToDelete.firstName} ${contactToDelete.lastName}`,
        type: "error",
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">
            Contacts
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
          {/* Search */}
          <div className="relative">
            <label htmlFor="search-contacts" className="sr-only">
              Search
            </label>
            <input
              id="search-contacts"
              className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              type="search"
              placeholder="Search by name, email, company..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button
              className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
              type="button"
              aria-label="Search">
              <svg
                className="w-4 h-4 text-gray-500"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
              </svg>
            </button>
          </div>

          {/* Add contact button */}
          <button
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setShowAddContactModal(true)}>
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 16 16"
              fill="currentColor">
              <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
            </svg>
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Add Contact Modal */}
      {isMounted && showAddContactModal && (
        <AddContactModal
          isOpen={showAddContactModal}
          onClose={() => setShowAddContactModal(false)}
          onSuccess={handleContactCreationSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isMounted && showDeleteModal && contactToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Contact"
          message={`Are you sure you want to delete ${contactToDelete.firstName} ${contactToDelete.lastName}? This will also delete all tasks associated with this contact.`}
          isDeleting={isDeleting}
        />
      )}

      {/* Contacts table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {error && (
          <div className="p-4 bg-red-100 text-red-700 border-l-4 border-red-500">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center p-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-500">Loading contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center p-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true">
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No contacts found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || statusFilter || companyFilter
                ? "Try adjusting your search or filters"
                : "Get started by creating a new contact"}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowAddContactModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Contact
              </button>
            </div>
          </div>
        ) : (
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
                          onClick={() =>
                            setShowCompanyFilter(!showCompanyFilter)
                          }
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
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteClick(contact)}>
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
        )}
      </div>
    </div>
  );
}
