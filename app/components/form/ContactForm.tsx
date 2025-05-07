"use client";

import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createContact } from "@/lib/services/contactService";
import DOMPurify from "dompurify";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

// Define the validation schema using Zod
const contactSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "First name is required" })
    .max(100)
    .regex(/^[A-Za-z\s-']+$/, {
      message:
        "First name can only contain letters, spaces, hyphens, and apostrophes",
    }),
  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(100)
    .regex(/^[A-Za-z\s-']+$/, {
      message:
        "Last name can only contain letters, spaces, hyphens, and apostrophes",
    }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  phone: z
    .string()
    .min(1, { message: "Phone number is required" })
    .max(20)
    .regex(/^[0-9()+\-.\s]+$/, {
      message:
        "Phone number can only contain numbers, spaces, and these symbols: () + - .",
    }),
  company: z.string().min(1, { message: "Company is required" }).max(100),
  status: z.enum(["LEAD", "PROSPECT", "CUSTOMER", "INACTIVE"]),
});

// Define the type for our form
type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ContactForm({ onSuccess, onCancel }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, touchedFields, isValid },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur", // Validate on field blur
    reValidateMode: "onChange", // Re-validate when field changes after it's been touched
    criteriaMode: "all", // Show all validation errors, not just the first
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      status: "LEAD",
    },
  });

  const onSubmit: SubmitHandler<ContactFormData> = async data => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // Sanitize all string inputs before submission to prevent XSS
      const sanitizedData = {
        ...data,
        firstName: DOMPurify.sanitize(data.firstName),
        lastName: DOMPurify.sanitize(data.lastName),
        email: DOMPurify.sanitize(data.email),
        phone: DOMPurify.sanitize(data.phone),
        company: DOMPurify.sanitize(data.company),
      };

      // Submit sanitized data
      await createContact(sanitizedData);
      reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating contact:", error);
      setServerError(
        error instanceof Error
          ? error.message
          : "Failed to create contact. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="firstName"
              type="text"
              {...register("firstName", {
                required: "First name is required",
                onChange: e => (e.target.value = e.target.value.trimStart()),
                onBlur: e => (e.target.value = e.target.value.trim()),
              })}
              className={`mt-1 block w-full rounded-md shadow-sm h-10 pl-3 pr-10 py-2 text-base 
                appearance-none
                ${
                  errors.firstName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : touchedFields.firstName && dirtyFields.firstName
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }
                [&:-webkit-autofill]:bg-white [&:-webkit-autofill:focus]:bg-white [&:-webkit-autofill:active]:bg-white
                `}
              aria-invalid={errors.firstName ? "true" : "false"}
            />
            {touchedFields.firstName && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-1">
                {errors.firstName ? (
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                ) : dirtyFields.firstName ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : null}
              </div>
            )}
          </div>
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700">
            Last Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="lastName"
              type="text"
              {...register("lastName", {
                required: "Last name is required",
                onChange: e => (e.target.value = e.target.value.trimStart()),
                onBlur: e => (e.target.value = e.target.value.trim()),
              })}
              className={`mt-1 block w-full rounded-md shadow-sm h-10 pl-3 pr-10 py-2 text-base
                appearance-none
                ${
                  errors.lastName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : touchedFields.lastName && dirtyFields.lastName
                    ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }
                [&:-webkit-autofill]:bg-white [&:-webkit-autofill:focus]:bg-white [&:-webkit-autofill:active]:bg-white
                `}
              aria-invalid={errors.lastName ? "true" : "false"}
            />
            {touchedFields.lastName && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-1">
                {errors.lastName ? (
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                ) : dirtyFields.lastName ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : null}
              </div>
            )}
          </div>
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address format",
              },
            })}
            className={`mt-1 block w-full rounded-md shadow-sm h-10 pl-3 pr-10 py-2 text-base
              appearance-none
              ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : touchedFields.email && dirtyFields.email
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              }
              [&:-webkit-autofill]:bg-white [&:-webkit-autofill:focus]:bg-white [&:-webkit-autofill:active]:bg-white
              `}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {touchedFields.email && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-1">
              {errors.email ? (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              ) : dirtyFields.email ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : null}
            </div>
          )}
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700">
          Phone <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="phone"
            type="tel"
            {...register("phone", {
              required: "Phone number is required",
              onChange: e => {
                // Only allow digits, spaces, and common phone symbols
                if (!/^[0-9()+\-.\s]*$/.test(e.target.value)) {
                  e.target.value = e.target.value.replace(
                    /[^0-9()+\-.\s]/g,
                    ""
                  );
                }
              },
            })}
            className={`mt-1 block w-full rounded-md shadow-sm h-10 pl-3 pr-10 py-2 text-base
              appearance-none
              ${
                errors.phone
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : touchedFields.phone && dirtyFields.phone
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              }
              [&:-webkit-autofill]:bg-white [&:-webkit-autofill:focus]:bg-white [&:-webkit-autofill:active]:bg-white
              `}
            aria-invalid={errors.phone ? "true" : "false"}
          />
          {touchedFields.phone && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-1">
              {errors.phone ? (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              ) : dirtyFields.phone ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : null}
            </div>
          )}
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Company */}
      <div>
        <label
          htmlFor="company"
          className="block text-sm font-medium text-gray-700">
          Company <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="company"
            type="text"
            {...register("company", {
              required: "Company is required",
              onChange: e => (e.target.value = e.target.value.trimStart()),
              onBlur: e => (e.target.value = e.target.value.trim()),
            })}
            className={`mt-1 block w-full rounded-md shadow-sm h-10 pl-3 pr-10 py-2 text-base
              appearance-none
              ${
                errors.company
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : touchedFields.company && dirtyFields.company
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              }
              [&:-webkit-autofill]:bg-white [&:-webkit-autofill:focus]:bg-white [&:-webkit-autofill:active]:bg-white
              `}
            aria-invalid={errors.company ? "true" : "false"}
          />
          {touchedFields.company && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-1">
              {errors.company ? (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              ) : dirtyFields.company ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : null}
            </div>
          )}
        </div>
        {errors.company && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.company.message}
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700">
          Status <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            id="status"
            {...register("status", {
              required: "Status is required",
            })}
            className={`mt-1 block w-full rounded-md shadow-sm h-10 pl-3 pr-10 py-2 text-base
              appearance-none
              ${
                errors.status
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : touchedFields.status && dirtyFields.status
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                  : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              }
              [&:-webkit-autofill]:bg-white [&:-webkit-autofill:focus]:bg-white [&:-webkit-autofill:active]:bg-white
              `}>
            <option value="LEAD">Lead</option>
            <option value="PROSPECT">Prospect</option>
            <option value="CUSTOMER">Customer</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <ChevronDownIcon className="h-5 w-5" />
          </div>
        </div>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.status.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={isSubmitting}>
          Cancel
        </button>
        <button
          type="submit"
          className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              isValid
                ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            }
            ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
          `}
          disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Contact"}
        </button>
      </div>
    </form>
  );
}
