"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  HiCheck,
  HiExclamation,
  HiInformationCircle,
  HiX,
} from "react-icons/hi";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

// Define toast types
export type ToastType = "success" | "error" | "warning" | "info";

/**
 * Props for toast notifications
 * @interface ToastProps
 * @property {string} message - The text message to display in the toast
 * @property {ToastType} type - The type of toast: "success", "error", "warning", or "info"
 * @property {number} [duration=4000] - How long the toast should stay visible (in milliseconds)
 * @property {() => void} [onDismiss] - Optional callback function when toast is dismissed
 */
export interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number; // in milliseconds
  onDismiss?: () => void;
}

/**
 * Context for toast management
 * @interface ToastContextProps
 * @property {(_props: ToastProps) => void} showToast - Function to display a new toast
 * @property {() => void} hideToast - Function to hide the currently visible toast
 */
interface ToastContextProps {
  showToast: (_props: ToastProps) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

/**
 * ToastProvider component that manages toast notifications
 *
 * Animation behavior can be customized by modifying the `toastVariants` object:
 * - `stiffness`: Controls the speed and bounciness (higher = faster & bouncier, lower = slower & smoother)
 * - `damping`: Controls how quickly the animation settles (higher = less bounce)
 * - `mass`: Controls the "weight" of the animation (lower = faster movement)
 * - `velocity`: Controls initial animation speed
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [visible, setVisible] = useState(false);

  /**
   * Displays a toast notification
   * @param {ToastProps} props - Toast properties
   */
  const showToast = (props: ToastProps) => {
    // Set default duration to 4000ms (4 seconds) if not provided
    const toastWithDefaults = {
      ...props,
      duration: props.duration || 4000,
    };
    setToast(toastWithDefaults);
    setVisible(true);
  };

  /**
   * Hides the currently displayed toast
   */
  const hideToast = () => {
    setVisible(false);
    // We'll let AnimatePresence handle the timing of removal
    setTimeout(() => setToast(null), 500);
  };

  useEffect(() => {
    if (visible && toast?.duration) {
      const timer = setTimeout(() => {
        hideToast();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [visible, toast]);

  // Animation variants for the toast with spring animation for more natural motion
  const toastVariants = {
    initial: { x: "100vw", opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 30,
        mass: 0.8, // Lower mass makes animation faster
        velocity: 2, // Initial velocity
      },
    },
    exit: {
      x: "-100vw",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 30,
        mass: 0.8,
        velocity: 2,
      },
    },
  };

  // Handle drag to dismiss
  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x < -100) {
      // Dismiss if dragged to the left
      hideToast();
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Toast Container with Framer Motion */}
      <AnimatePresence>
        {toast && visible && (
          <div className="fixed top-2 inset-x-0 flex justify-center z-50">
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={toastVariants}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              whileTap={{ scale: 0.98 }}>
              <Toast {...toast} onDismiss={hideToast} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications
 *
 * @returns {ToastContextProps} Toast functions
 * @property {(_props: ToastProps) => void} showToast - Function to display a new toast
 * @property {() => void} hideToast - Function to hide the current toast
 *
 * @example
 * ```tsx
 * // In your component
 * import { useToast } from '@/components/ui/Toast';
 *
 * export default function MyComponent() {
 *   const { showToast } = useToast();
 *
 *   const handleSuccess = () => {
 *     showToast({
 *       message: "Operation successful!",
 *       type: "success",
 *       duration: 5000, // optional, defaults to 4000ms
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleSuccess}>
 *       Show Success Toast
 *     </button>
 *   );
 * }
 * ```
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

/**
 * Toast notification component
 *
 * Renders a single toast notification with appropriate styling based on type.
 * This component includes an icon, message, and dismiss button, with a colored
 * left border to indicate the toast type.
 *
 * @param {ToastProps} props - Toast properties
 * @param {string} props.message - The text message to display
 * @param {ToastType} props.type - Type of toast: "success", "error", "warning", or "info"
 * @param {() => void} [props.onDismiss] - Function to call when toast is dismissed
 */
function Toast({ message, type, onDismiss }: ToastProps) {
  // Define colors and icons based on type
  const getToastProps = () => {
    switch (type) {
      case "success":
        return {
          icon: HiCheck,
          bgColor: "bg-white dark:bg-gray-800",
          borderColor: "border-l-10 border-green-500",
          iconColor: "text-green-500 dark:text-green-400",
        };
      case "error":
        return {
          icon: HiX,
          bgColor: "bg-white dark:bg-gray-800",
          borderColor: "border-l-10 border-red-500",
          iconColor: "text-red-500 dark:text-red-400",
        };
      case "warning":
        return {
          icon: HiExclamation,
          bgColor: "bg-white dark:bg-gray-800",
          borderColor: "border-l-10 border-yellow-500",
          iconColor: "text-yellow-500 dark:text-yellow-400",
        };
      case "info":
      default:
        return {
          icon: HiInformationCircle,
          bgColor: "bg-white dark:bg-gray-800",
          borderColor: "border-l-10 border-blue-500",
          iconColor: "text-blue-500 dark:text-blue-400",
        };
    }
  };

  const { icon, bgColor, borderColor, iconColor } = getToastProps();

  return (
    <div
      className={`flex items-center w-full max-w-xs p-4 shadow-lg rounded-lg ${bgColor} ${borderColor} cursor-grab active:cursor-grabbing`}>
      <div className="inline-flex items-center justify-center shrink-0 w-8 h-8">
        {React.createElement(icon, { className: `h-5 w-5 ${iconColor}` })}
      </div>
      <div className="ml-3 text-sm font-normal text-gray-800 dark:text-gray-200">
        {message}
      </div>
      <button
        className="ml-auto -mx-1.5 -my-1.5 text-gray-400 hover:text-gray-900 rounded-lg p-1.5 inline-flex h-8 w-8 items-center justify-center dark:text-gray-500 dark:hover:text-white"
        onClick={onDismiss}
        type="button"
        aria-label="Close">
        <HiX className="w-5 h-5" />
      </button>
    </div>
  );
}
