"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  autoComplete?: string;
  showLabel?: boolean;
}

export default function PasswordInput({
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
}: PasswordInputProps) {
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
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10 ${className} ${
            error ? "border-red-500" : ""
          }`}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
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

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
