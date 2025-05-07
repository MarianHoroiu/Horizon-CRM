"use client";

import React, { forwardRef } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils/cn";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  id: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  showLabel?: boolean;
  registerProps?: UseFormRegisterReturn;
  isValid?: boolean;
  touched?: boolean;
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    {
      id,
      name,
      value,
      onChange,
      label,
      options,
      required = false,
      disabled = false,
      error,
      className = "",
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
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={cn(
              "w-full px-3 py-2 h-10 border rounded-md shadow-sm focus:outline-none appearance-none pr-10",
              "[&:-webkit-autofill]:bg-white [&:-webkit-autofill:focus]:bg-white [&:-webkit-autofill:active]:bg-white",
              className,
              {
                "border-red-500 focus:border-red-500 focus:ring-red-500":
                  !isValid,
                "border-green-500 focus:border-green-500 focus:ring-green-500":
                  touched && isValid,
                "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500":
                  (isValid || !error) && !(touched && isValid),
              }
            )}
            ref={ref}
            {...registerProps}
            aria-invalid={!isValid ? "true" : "false"}>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <ChevronDownIcon className="h-5 w-5" />
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

SelectInput.displayName = "SelectInput";

export default SelectInput;
