"use client";

import React, { useState, forwardRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils/cn";

interface PasswordInputProps {
  id: string;
  value?: string;
  onChange?: (_e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  autoComplete?: string;
  showLabel?: boolean;
  registerProps?: UseFormRegisterReturn;
  isValid?: boolean;
  touched?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      id,
      value,
      onChange,
      label,
      placeholder,
      required = false,
      disabled = false,
      error,
      className = "",
      autoComplete = "current-password",
      showLabel = true,
      registerProps,
      isValid = false,
      touched = false,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="w-full">
        {label && showLabel && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        {label && !showLabel && (
          <label htmlFor={id} className="sr-only">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            id={id}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "w-full px-3 py-2 h-10 border rounded-md shadow-sm focus:outline-none pr-10 appearance-none",
              "[&:-webkit-autofill]:bg-white [&:-webkit-autofill:focus]:bg-white [&:-webkit-autofill:active]:bg-white",
              className,
              {
                "border-red-500 focus:border-red-500 focus:ring-red-500":
                  !isValid,
                "border-green-500 focus:border-green-500 focus:ring-green-500":
                  touched && isValid && !error,
                "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500":
                  (isValid || !error) && !(touched && isValid),
              }
            )}
            autoComplete={autoComplete}
            ref={ref}
            {...registerProps}
            aria-invalid={!isValid ? "true" : "false"}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              type="button"
              className="pr-3 flex items-center"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? (
                <FaEyeSlash className="h-5 w-5 text-gray-400" />
              ) : (
                <FaEye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
