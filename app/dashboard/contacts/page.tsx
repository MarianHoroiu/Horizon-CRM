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
import EditContactModal from "@/app/components/form/EditContactModal";
import DeleteConfirmationModal from "@/app/components/form/DeleteConfirmationModal";
import { useToast } from "@/app/components/ui/Toast";
import { FiTrash2, FiSearch, FiPlus, FiFilter } from "react-icons/fi";
import { BsPencilSquare, BsFolder } from "react-icons/bs";

type StatusType = "LEAD" | "PROSPECT" | "CUSTOMER" | "INACTIVE";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: StatusType;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  // Edit contact state
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showCompanyFilter, setShowCompanyFilter] = useState(false);

  // Refs for dropdown positioning
  const companyHeaderRef = useRef<HTMLTableCellElement>(null);
  const statusHeaderRef = useRef<HTMLTableCellElement>(null);
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
    if (showCompanyFilter && companyHeaderRef.current) {
      const rect = companyHeaderRef.current.getBoundingClientRect();
      setCompanyDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right - 192 + window.scrollX, // 192px is w-48
      });
    }
  }, [showCompanyFilter]);

  useEffect(() => {
    if (showStatusFilter && statusHeaderRef.current) {
      const rect = statusHeaderRef.current.getBoundingClientRect();
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

  // Handle edit click
  const handleEditClick = (contact: Contact) => {
    setContactToEdit(contact);
    setShowEditContactModal(true);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setShowEditContactModal(false);
    setContactToEdit(null);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setShowEditContactModal(false);
    setContactToEdit(null);



    // Clear filters to ensure we see the updated contact
    setStatusFilter(null);
    setCompanyFilter(null);
    setSearchQuery("");

    // Fetch fresh data
    fetchContacts().then(() => {
      showToast({
        message: "Contact updated successfully!",
        type: "success",
      });
    });
  };

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        {/* Left: Title */}
        <h1 className="text-2xl md:text-3xl text-slate-800 font-bold mb-4 sm:mb-0">
          Contacts
        </h1>

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
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Add contact button */}
          <button
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setShowAddContactModal(true)}>
            <FiPlus className="w-4 h-4 mr-2" />
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

      {/* Edit Contact Modal */}
      {showEditContactModal && contactToEdit && (
        <EditContactModal
          isOpen={showEditContactModal}
          onClose={handleEditCancel}
          onSuccess={handleEditSuccess}
          contact={contactToEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && contactToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
          title="Delete Contact"
          message={`Are you sure you want to delete ${contactToDelete.firstName} ${contactToDelete.lastName}? This action cannot be undone.`}
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
        ) : (
          <div className="overflow-x-auto border rounded-lg">
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
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                    data-filter="company"
                    ref={companyHeaderRef}>
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
                        <FiFilter className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Render company dropdown through portal */}
                    {showCompanyFilter && <CompanyFilterDropdown />}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                    data-filter="status"
                    ref={statusHeaderRef}>
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
                        <FiFilter className="h-4 w-4" />
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
                {contacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-center">
                        <BsFolder className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No contacts found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchQuery || statusFilter || companyFilter
                            ? "Try adjusting your search or filters"
                            : "Get started by creating a new contact"}
                        </p>
                        {!(searchQuery || statusFilter || companyFilter) && (
                          <div className="mt-6">
                            <button
                              type="button"
                              onClick={() => setShowAddContactModal(true)}
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                              Add Contact
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map(contact => (
                    <tr
                      key={contact.id}
                      className="hover:bg-gray-50 border-b border-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </span>
                          <span className="text-sm text-gray-500">
                            {contact.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contact.phone}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          companyFilter === contact.company
                            ? "text-indigo-600"
                            : "text-gray-900"
                        }`}>
                        {contact.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            contact.status === "LEAD"
                              ? "bg-blue-100 text-blue-800"
                              : contact.status === "PROSPECT"
                              ? "bg-green-100 text-green-800"
                              : contact.status === "CUSTOMER"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            onClick={() => handleEditClick(contact)}
                            className="text-indigo-600 hover:text-indigo-900 mr-2">
                            <BsPencilSquare className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(contact)}
                            className="text-red-600 hover:text-red-900">
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
