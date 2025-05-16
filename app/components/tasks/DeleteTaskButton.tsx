"use client";

import React, { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import ConfirmationDialog from "./ConfirmationDialog";
import { useToast } from "@/app/components/ui/Toast";
import { deleteTask } from "@/lib/services/taskService";

interface DeleteTaskButtonProps {
  taskId: string;
  taskTitle: string;
  onSuccess: () => void;
}

export default function DeleteTaskButton({
  taskId,
  taskTitle,
  onSuccess,
}: DeleteTaskButtonProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (isDeleting) return; // Prevent multiple clicks

    try {
      setIsDeleting(true);
      await deleteTask(taskId);

      // Show success toast notification
      showToast({
        message: "Task deleted successfully",
        type: "success",
      });

      // Call the success callback to refresh the task list
      onSuccess();
    } catch (error) {
      console.error("Error deleting task:", error);

      // Show error toast notification
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete task. Please try again.",
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        className="p-2 text-red-600 hover:text-red-800 transition-colors relative"
        onClick={() => setIsConfirmDialogOpen(true)}
        aria-label="Delete task"
        disabled={isDeleting}>
        {isDeleting ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
          </span>
        ) : (
          <FiTrash2 className="h-5 w-5" />
        )}
      </button>

      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      />
    </>
  );
}
