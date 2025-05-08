"use client";

import React, { useEffect, useRef } from "react";
import ContactForm from "./ContactForm";

type StatusType = "LEAD" | "PROSPECT" | "CUSTOMER" | "INACTIVE";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: StatusType;
}

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contact: Contact;
}

export default function EditContactModal({
  isOpen,
  onClose,
  onSuccess,
  contact,
}: EditContactModalProps) {
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
        className="bg-white rounded-lg p-6 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h3
            className="text-xl leading-6 font-semibold text-gray-900"
            id="modal-title">
            Edit Contact
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Update the contact information
          </p>
        </div>

        <ContactForm
          onSuccess={onSuccess}
          onCancel={onClose}
          initialData={contact}
          isEditing={true}
        />
      </div>
    </div>
  );
}
