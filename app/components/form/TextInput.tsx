"use client";

import React, { forwardRef } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils/cn";

interface TextInputProps {
  id: string;
  name?: string;
  type?: string;
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

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      id,
      name,
      type = "text",
      value,
      onChange,
      label,
      placeholder,
      required = false,
      disabled = false,
      error,
      className = "",
      autoComplete,
      showLabel = true,
      registerProps,
      isValid = false,
      touched = false,
    },
    ref
  ) => {
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
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "w-full px-3 py-2 h-10 border rounded-md shadow-sm focus:outline-none appearance-none",
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

TextInput.displayName = "TextInput";

export default TextInput;
