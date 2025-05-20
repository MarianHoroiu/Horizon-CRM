import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (_newPage: number) => void;
  siblingCount?: number;
  pageSizeOptions?: number[];
  pageSize?: number;
  onPageSizeChange?: (_newSize: number) => void;
  totalItems?: number;
  showingText?: (_rangeInfo: {
    start: number;
    end: number;
    total: number;
  }) => string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 2,
  pageSizeOptions = [10, 25, 50],
  pageSize = 10,
  onPageSizeChange,
  totalItems,
  showingText,
}: PaginationProps) => {
  // Generate page numbers to display with siblings
  const getPageNumbers = () => {
    const pageNumbers = [];

    // Calculate the range based on current page and sibling count
    const leftSiblingIndex = Math.max(1, currentPage - siblingCount);
    const rightSiblingIndex = Math.min(totalPages, currentPage + siblingCount);

    // Add first page if needed
    if (leftSiblingIndex > 1) {
      pageNumbers.push(1);
      // Add ellipsis if there's a gap
      if (leftSiblingIndex > 2) {
        pageNumbers.push("ellipsis-left");
      }
    }

    // Add the pages in the current range
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      pageNumbers.push(i);
    }

    // Add last page if needed
    if (rightSiblingIndex < totalPages) {
      // Add ellipsis if there's a gap
      if (rightSiblingIndex < totalPages - 1) {
        pageNumbers.push("ellipsis-right");
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  if (totalPages <= 1 && !onPageSizeChange) return null;

  // Calculate range for showing text (e.g. "Showing 1-10 of 50 items")
  const calculateRange = () => {
    if (!totalItems) return null;

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalItems);

    return { start, end, total: totalItems };
  };

  const range = calculateRange();

  return (
    <div className="w-full mt-4 flex flex-col sm:flex-row justify-between items-center">
      {/* Items per page selector */}
      {onPageSizeChange && (
        <div className="mb-4 sm:mb-0 flex items-center">
          <span className="text-sm text-gray-500 mr-2">Items per page:</span>
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded-md text-sm py-1 px-2">
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Showing x of y text */}
      {range && showingText && (
        <div className="text-sm text-gray-500 mb-4 sm:mb-0">
          {showingText(range)}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
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
          {getPageNumbers().map((pageNumber, index) =>
            pageNumber === "ellipsis-left" ||
            pageNumber === "ellipsis-right" ? (
              <span key={`${pageNumber}-${index}`} className="px-3 py-2">
                &hellip;
              </span>
            ) : (
              <button
                key={`${pageNumber}-${index}`}
                onClick={() => onPageChange(Number(pageNumber))}
                className={`px-3 py-2 rounded-md ${
                  currentPage === pageNumber
                    ? "bg-blue-600 text-white font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}>
                {pageNumber}
              </button>
            )
          )}

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
      )}
    </div>
  );
};
