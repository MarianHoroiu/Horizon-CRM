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
import { useForm } from "react-hook-form";
import {
  FiTrash2,
  FiSearch,
  FiPlus,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
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

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (_page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2 my-6">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-md flex items-center ${
          currentPage === 1
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        aria-label="Previous page">
        <FiChevronLeft className="h-5 w-5" />
      </button>

      {/* Page numbers */}
      {getPageNumbers().map(pageNumber => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`px-3 py-2 rounded-md ${
            currentPage === pageNumber
              ? "bg-indigo-600 text-white font-medium"
              : "text-gray-700 hover:bg-gray-100"
          }`}>
          {pageNumber}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-md flex items-center ${
          currentPage === totalPages
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        aria-label="Next page">
        <FiChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  // Setup React Hook Form for search functionality
  const { register, watch } = useForm({
    defaultValues: {
      search: "",
    },
  });
  const searchInputValue = watch("search");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Edit contact state
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showCompanyFilter, setShowCompanyFilter] = useState(false);

  // Refs for dropdown positioning and tracking if filters are applied
  const companyHeaderRef = useRef<HTMLTableCellElement>(null);
  const statusHeaderRef = useRef<HTMLTableCellElement>(null);
  const hasFiltersRef = useRef(false);
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

  // Stable fetch function that doesn't depend on component state
  const fetchContactsData = useCallback(
    async (page: number, limit: number, query?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        let data;
        if (query?.trim()) {
          data = await searchContacts(query, page, limit);
        } else {
          data = await getContacts(page, limit);
        }

        const fetchedContacts = data.contacts || [];
        const pagination = data.pagination || {
          totalPages: Math.ceil(fetchedContacts.length / limit),
          currentPage: page,
        };

        return {
          contacts: fetchedContacts,
          pagination,
        };
      } catch (err) {
        console.error("Error fetching contacts:", err);
        throw err;
      }
    },
    []
  );

  // Handle fetching with proper error handling
  const loadContacts = useCallback(async () => {
    if (hasFiltersRef.current) {
      // Skip server fetch if we're doing client-side filtering
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchContactsData(
        currentPage,
        itemsPerPage,
        searchQuery
      );

      setContacts(data.contacts);
      setAllContacts(data.contacts);
      setTotalPages(data.pagination.totalPages);

      // Don't update currentPage here to avoid loops
    } catch (err) {
      setError("Failed to load contacts");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, fetchContactsData]);

  // Initial data loading effect - runs only when dependencies truly change
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Apply client-side filters when needed
  useEffect(() => {
    // Track if we're using client-side filtering
    hasFiltersRef.current = !!(statusFilter || companyFilter);

    if (!hasFiltersRef.current || allContacts.length === 0) {
      return;
    }

    // Apply client-side filters only when we have active filters
    let filtered = [...allContacts];

    if (statusFilter) {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    if (companyFilter) {
      filtered = filtered.filter(contact => contact.company === companyFilter);
    }

    setContacts(filtered);
    // Recalculate page count for client-side filtering
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [statusFilter, companyFilter, allContacts, itemsPerPage]);

  // Handle search with proper debouncing
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        // Reset to page 1 when searching
        setCurrentPage(1);
        setSearchQuery(query);
      }, 500),
    []
  );

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Watch for changes in the search input and trigger search
  useEffect(() => {
    // Clear client-side filters when searching
    if (hasFiltersRef.current) {
      setStatusFilter(null);
      setCompanyFilter(null);
    }

    // Sanitize the input to prevent XSS
    const sanitizedValue = searchInputValue.replace(/<\/?[^>]+(>|$)/g, "");
    debouncedSearch(sanitizedValue);
  }, [searchInputValue, debouncedSearch]);

  // Handle page change
  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  // Handle filter selection
  const handleStatusFilter = useCallback((status: string | null) => {
    setStatusFilter(status);
    setShowStatusFilter(false);
  }, []);

  const handleCompanyFilter = useCallback((company: string | null) => {
    setCompanyFilter(company);
    setShowCompanyFilter(false);
  }, []);

  // Handle new contact creation success
  const handleContactCreationSuccess = useCallback(() => {
    setShowAddContactModal(false);

    // Clear filters and search when updating data
    setStatusFilter(null);
    setCompanyFilter(null);
    setSearchQuery("");
    setCurrentPage(1);

    // Fetch fresh data
    loadContacts();
  }, [loadContacts]);

  // Position dropdowns properly
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

    // Cleanup function for click handler
    return () => {
      setIsMounted(false);
    };
  }, []);

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

  // Handle edit success
  const handleEditSuccess = useCallback(() => {
    setShowEditContactModal(false);
    setContactToEdit(null);

    // Clear filters to ensure we see the updated contact
    setStatusFilter(null);
    setCompanyFilter(null);
    setSearchQuery("");
    setCurrentPage(1);

    // Fetch fresh data
    loadContacts().then(() => {
      showToast({
        message: "Contact updated successfully!",
        type: "success",
      });
    });
  }, [loadContacts, showToast]);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!contactToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteContact(contactToDelete.id);

      // Update the contacts list after successful deletion
      setContacts(contacts =>
        contacts.filter(c => c.id !== contactToDelete.id)
      );
      setAllContacts(allContacts =>
        allContacts.filter(c => c.id !== contactToDelete.id)
      );

      // Recalculate pagination if needed
      if (allContacts.length <= 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }

      // Close the modal
      setShowDeleteModal(false);
      setContactToDelete(null);

      // Show success toast
      showToast({
        message: `Your contact ${contactToDelete.firstName} ${contactToDelete.lastName} has been deleted successfully`,
        type: "success",
        duration: 4000,
      });

      // Refresh data if we've deleted all visible contacts
      if (contacts.length <= 1) {
        loadContacts();
      }
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
  }, [
    contactToDelete,
    currentPage,
    loadContacts,
    showToast,
    contacts.length,
    allContacts.length,
  ]);

  // Handle contact deletion click
  const handleDeleteClick = useCallback((contact: Contact) => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  }, []);

  // Handle delete cancel
  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false);
    setContactToDelete(null);
  }, []);

  // Handle edit click
  const handleEditClick = useCallback((contact: Contact) => {
    setContactToEdit(contact);
    setShowEditContactModal(true);
  }, []);

  // Handle edit cancel
  const handleEditCancel = useCallback(() => {
    setShowEditContactModal(false);
    setContactToEdit(null);
  }, []);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl text-slate-800 font-bold mb-6">
        Contacts
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Page header */}
        <div className="mb-8 ">
          {/* Search and Add Contact */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full max-w-md">
              <div className="relative">
                <input
                  id="search-contacts"
                  className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  type="search"
                  placeholder="Search by name, email or company"
                  {...register("search")}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FiSearch className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Add Contact Button */}
            <button
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
              onClick={() => setShowAddContactModal(true)}>
              <FiPlus className="w-5 h-5 mr-2" />
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
              {/* Fixed height container for the table */}
              <div className="min-h-[700px] flex flex-col">
                {/* Table takes available space but allows pagination to stay fixed at bottom */}
                <div className="flex-grow">
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
                          ref={companyHeaderRef}>
                          <div className="flex items-center gap-1">
                            <span
                              className={companyFilter ? "text-blue-600" : ""}>
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
                            <span
                              className={statusFilter ? "text-blue-600" : ""}>
                              Status
                            </span>
                            <button
                              onClick={() =>
                                setShowStatusFilter(!showStatusFilter)
                              }
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
                          <td colSpan={6} className="px-6 py-12 text-center">
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
                              {!(
                                searchQuery ||
                                statusFilter ||
                                companyFilter
                              ) && (
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
                        <>
                          {contacts.map(contact => (
                            <tr
                              key={contact.id}
                              className="hover:bg-blue-100 border-b border-gray-100 odd:bg-white even:bg-gray-100">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-medium text-gray-900">
                                  {contact.firstName} {contact.lastName}
                                </span>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-500">
                                  {contact.email}
                                </span>
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
                                <div className="flex justify-left gap-x-2">
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
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination - fixed position at bottom of container */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
