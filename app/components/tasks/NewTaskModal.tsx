"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextInput from "../form/TextInput";
import SelectInput from "../form/SelectInput";
import { useToast } from "@/app/components/ui/Toast";
import DOMPurify from "dompurify";
import { createTask } from "@/lib/services/taskService";

// Define the validation schema using Zod
const taskSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title must be 100 characters or less" }),
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(500, { message: "Description must be 500 characters or less" }),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  dueDate: z
    .string()
    .min(1, { message: "Due date is required" })
    .refine(date => !isNaN(Date.parse(date)), {
      message: "Please enter a valid date",
    }),
  contactId: z.string().min(1, { message: "Contact is required" }),
});

// Define the type for our form
type TaskFormData = z.infer<typeof taskSchema>;

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
}

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contacts: Contact[];
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function NewTaskModal({
  isOpen,
  onClose,
  onSuccess,
  contacts,
}: NewTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { showToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      status: "PENDING",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7))
        .toISOString()
        .split("T")[0], // Default to 7 days from now
      contactId: "",
    },
  });

  // Transform contacts for select dropdown
  const contactOptions = contacts.map(contact => ({
    value: contact.id,
    label: `${contact.firstName} ${contact.lastName}`,
  }));

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

  const handleFormSubmit = handleSubmit(async (data: TaskFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // Sanitize all string inputs before submission to prevent XSS
      const sanitizedData = {
        ...data,
        title: DOMPurify.sanitize(data.title),
        description: DOMPurify.sanitize(data.description),
      };

      await createTask(sanitizedData);

      // Show success toast notification
      showToast({
        message: `Task "${sanitizedData.title}" created successfully!`,
        type: "success",
      });

      reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating task:", error);

      // Handle error message
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create task. Please try again.";

      setServerError(errorMessage);

      // Show error toast notification
      showToast({
        message: errorMessage,
        type: "error",
        duration: 4000, // Show error messages longer
      });
    } finally {
      setIsSubmitting(false);
    }
  });

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
            Add New Task
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Fill in the information to create a new task
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
          {serverError && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {serverError}
            </div>
          )}

          {/* Title */}
          <TextInput
            id="title"
            label="Title"
            required
            isValid={touchedFields.title && !errors.title}
            error={errors.title?.message}
            touched={touchedFields.title}
            registerProps={register("title", {
              required: "Title is required",
              onChange: e => (e.target.value = e.target.value.trimStart()),
              onBlur: e => (e.target.value = e.target.value.trim()),
            })}
          />

          {/* Description */}
          <div className="w-full">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${
                errors.description
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : touchedFields.description && !errors.description
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              }`}
              {...register("description", {
                required: "Description is required",
              })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Status */}
          <SelectInput
            id="status"
            label="Status"
            required
            options={STATUS_OPTIONS}
            isValid={touchedFields.status && !errors.status}
            error={errors.status?.message}
            touched={touchedFields.status}
            registerProps={register("status")}
          />

          {/* Due Date */}
          <TextInput
            id="dueDate"
            label="Due Date"
            type="date"
            required
            isValid={touchedFields.dueDate && !errors.dueDate}
            error={errors.dueDate?.message}
            touched={touchedFields.dueDate}
            registerProps={register("dueDate", {
              required: "Due date is required",
            })}
          />

          {/* Contact */}
          <SelectInput
            id="contactId"
            label="Contact"
            required
            options={contactOptions}
            isValid={touchedFields.contactId && !errors.contactId}
            error={errors.contactId?.message}
            touched={touchedFields.contactId}
            registerProps={register("contactId", {
              required: "Contact is required",
            })}
          />

          {/* Submit and Cancel buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
