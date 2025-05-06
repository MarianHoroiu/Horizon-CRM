"use client";

import React, { useEffect, useRef } from "react";
import ContactForm from "./ContactForm";

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddContactModal({
  isOpen,
  onClose,
  onSuccess,
}: AddContactModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close the modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    // Handle escape key to close modal
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gray-500 bg-opacity-75 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true">
      <div
        ref={modalRef}
        className="bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6">
        <div className="mb-4">
          <h3
            className="text-lg leading-6 font-medium text-gray-900"
            id="modal-title">
            Add New Contact
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the information to create a new contact
          </p>
        </div>

        <ContactForm onSuccess={onSuccess} onCancel={onClose} />
      </div>
    </div>
  );
}
