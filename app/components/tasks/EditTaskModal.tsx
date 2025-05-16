"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextInput from "../form/TextInput";
import SelectInput from "../form/SelectInput";
import { useToast } from "@/app/components/ui/Toast";
import DOMPurify from "dompurify";
import { getTaskById, updateTask } from "@/lib/services/taskService";

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
  company?: string;
}

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contacts: Contact[];
  taskId: string;
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function EditTaskModal({
  isOpen,
  onClose,
  onSuccess,
  contacts,
  taskId,
}: EditTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fetchId, setFetchId] = useState(0);
  const { showToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      status: "PENDING",
      dueDate: new Date().toISOString().split("T")[0],
      contactId: "",
    },
  });

  // Reset component state when the modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setDataLoaded(false);
      setFetchId(prev => prev + 1);
    }
  }, [isOpen, taskId]);

  // Fetch task data when modal opens (separated from state reset)
  useEffect(() => {
    // Skip effect if modal is not open or no taskId
    if (!isOpen || !taskId) return;

    // Create an AbortController for this effect instance
    const abortController = new AbortController();
    let isMounted = true; // Flag to prevent state updates after unmount

    const fetchTaskData = async () => {
      try {
        // Use skipCache=true to ensure we're getting fresh data, and pass the signal
        const response = await getTaskById(
          taskId,
          true,
          abortController.signal
        );

        // Guard against updating state after unmount
        if (!isMounted) return;

        if (response && response.task) {
          // Batch form updates to reduce rerenders
          const updates = () => {
            setValue("title", response.task.title);
            setValue("description", response.task.description);

            // Ensure status is one of the enum values
            const validStatus = STATUS_OPTIONS.some(
              option => option.value === response.task.status
            )
              ? (response.task.status as
                  | "PENDING"
                  | "IN_PROGRESS"
                  | "COMPLETED"
                  | "CANCELLED")
              : "PENDING";
            setValue("status", validStatus);

            setValue("dueDate", response.task.dueDate.split("T")[0]);

            // Make sure contactId is properly set
            if (response.task.contactId) {
              // Verify the contact exists in our contacts array
              const contactExists = contacts.some(
                contact => contact.id === response.task.contactId
              );

              if (contactExists) {
                // Set the contact ID with priority
                setValue("contactId", response.task.contactId, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              } else {
                console.warn(
                  `Contact ID ${response.task.contactId} not found in contacts array`
                );
              }
            }
          };

          // Apply all updates at once
          updates();

          // Mark as loaded after small delay to prevent flicker
          setTimeout(() => {
            if (isMounted) {
              setDataLoaded(true);
              setIsLoading(false);
            }
          }, 100); // Increased delay slightly to ensure form values are set
        } else {
          throw new Error("Failed to load task data");
        }
      } catch (error) {
        // Don't set errors if the request was aborted
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        // Guard against updating state after unmount
        if (!isMounted) return;

        console.error("Error fetching task:", error);

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load task data. Please try again.";

        setServerError(errorMessage);

        showToast({
          message: errorMessage,
          type: "error",
          duration: 4000,
        });

        // Still need to exit loading state on error
        setIsLoading(false);
      }
    };

    fetchTaskData();

    // Cleanup function: abort fetch and set isMounted to false when component unmounts
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [isOpen, taskId, setValue, showToast, fetchId, contacts]);

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

    // Create an AbortController for this submit
    const abortController = new AbortController();

    try {
      // Sanitize all string inputs before submission to prevent XSS
      const sanitizedData = {
        ...data,
        title: DOMPurify.sanitize(data.title),
        description: DOMPurify.sanitize(data.description),
      };

      // Always use skipCache=true for updates to ensure caches are busted
      await updateTask(taskId, sanitizedData, true, abortController.signal);

      // Show success toast notification
      showToast({
        message: `Task "${sanitizedData.title}" updated successfully!`,
        type: "success",
      });

      onSuccess();
    } catch (error) {
      // Don't set errors if the request was aborted
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      console.error("Error updating task:", error);

      // Handle error message
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update task. Please try again.";

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
            Edit Task
          </h3>
          <p className="mt-2 text-sm text-gray-500">Update task information</p>
        </div>

        {isLoading && !dataLoaded ? (
          <div className="py-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-gray-500">Loading task data...</span>
          </div>
        ) : (
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
            <div className="w-full">
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${
                  errors.dueDate
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : touchedFields.dueDate && !errors.dueDate
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
                {...register("dueDate")}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            {/* Contact Selection */}
            <SelectInput
              id="contactId"
              label="Contact"
              required
              options={contacts.map(contact => ({
                value: contact.id,
                label: `${contact.firstName} ${contact.lastName}${
                  contact.company ? ` (${contact.company})` : ""
                }`,
              }))}
              isValid={touchedFields.contactId && !errors.contactId}
              error={errors.contactId?.message}
              touched={touchedFields.contactId}
              registerProps={register("contactId")}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={onClose}
                disabled={isSubmitting}>
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Updating...
                  </>
                ) : (
                  "Update Task"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
