"use client";

import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createContact } from "@/lib/services/contactService";
import DOMPurify from "dompurify";

// Define the validation schema using Zod
const contactSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }).max(100),
  lastName: z.string().min(1, { message: "Last name is required" }).max(100),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  phone: z.string().min(1, { message: "Phone number is required" }).max(20),
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
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
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
          <input
            id="firstName"
            type="text"
            {...register("firstName")}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.firstName ? "border-red-500" : ""
            }`}
            aria-invalid={errors.firstName ? "true" : "false"}
          />
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
          <input
            id="lastName"
            type="text"
            {...register("lastName")}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.lastName ? "border-red-500" : ""
            }`}
            aria-invalid={errors.lastName ? "true" : "false"}
          />
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
        <input
          id="email"
          type="email"
          {...register("email")}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.email ? "border-red-500" : ""
          }`}
          aria-invalid={errors.email ? "true" : "false"}
        />
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
        <input
          id="phone"
          type="tel"
          {...register("phone")}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.phone ? "border-red-500" : ""
          }`}
          aria-invalid={errors.phone ? "true" : "false"}
        />
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
        <input
          id="company"
          type="text"
          {...register("company")}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            errors.company ? "border-red-500" : ""
          }`}
          aria-invalid={errors.company ? "true" : "false"}
        />
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
        <select
          id="status"
          {...register("status")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          <option value="LEAD">Lead</option>
          <option value="PROSPECT">Prospect</option>
          <option value="CUSTOMER">Customer</option>
          <option value="INACTIVE">Inactive</option>
        </select>
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
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Contact"}
        </button>
      </div>
    </form>
  );
}
