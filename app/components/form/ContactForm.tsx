"use client";

import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createContact } from "@/lib/services/contactService";
import DOMPurify from "dompurify";
import TextInput from "./TextInput";
import SelectInput from "./SelectInput";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/app/components/ui/Toast";

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

const STATUS_OPTIONS = [
  { value: "LEAD", label: "Lead" },
  { value: "PROSPECT", label: "Prospect" },
  { value: "CUSTOMER", label: "Customer" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function ContactForm({ onSuccess, onCancel }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, touchedFields },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur", // Validate on field blur
    reValidateMode: "onChange", // Re-validate when field changes after it's been touched
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

      // Show success toast notification
      showToast({
        message: `Contact ${sanitizedData.firstName} ${sanitizedData.lastName} created successfully!`,
        type: "success",
      });

      onSuccess();
    } catch (error) {
      console.error("Error creating contact:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create contact. Please try again.";

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
        <TextInput
          id="firstName"
          label="First Name"
          required
          isValid={touchedFields.firstName && !errors.firstName}
          error={errors.firstName?.message}
          touched={touchedFields.firstName}
          registerProps={register("firstName", {
            required: "First name is required",
            onChange: e => (e.target.value = e.target.value.trimStart()),
            onBlur: e => (e.target.value = e.target.value.trim()),
          })}
        />

        {/* Last Name */}
        <TextInput
          id="lastName"
          label="Last Name"
          required
          isValid={touchedFields.lastName && !errors.lastName}
          error={errors.lastName?.message}
          touched={touchedFields.lastName}
          registerProps={register("lastName", {
            required: "Last name is required",
            onChange: e => (e.target.value = e.target.value.trimStart()),
            onBlur: e => (e.target.value = e.target.value.trim()),
          })}
        />
      </div>

      {/* Email */}
      <TextInput
        id="email"
        label="Email"
        type="email"
        required
        isValid={touchedFields.email && !errors.email}
        error={errors.email?.message}
        touched={touchedFields.email}
        registerProps={register("email", {
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address format",
          },
        })}
      />

      {/* Phone */}
      <TextInput
        id="phone"
        label="Phone"
        type="tel"
        required
        isValid={touchedFields.phone && !errors.phone}
        error={errors.phone?.message}
        touched={touchedFields.phone}
        registerProps={register("phone", {
          required: "Phone number is required",
          onChange: e => {
            // Only allow digits, spaces, and common phone symbols
            if (!/^[0-9()+\-.\s]*$/.test(e.target.value)) {
              e.target.value = e.target.value.replace(/[^0-9()+\-.\s]/g, "");
            }
          },
        })}
      />

      {/* Company */}
      <TextInput
        id="company"
        label="Company"
        required
        isValid={touchedFields.company && !errors.company}
        error={errors.company?.message}
        touched={touchedFields.company}
        registerProps={register("company", {
          required: "Company is required",
          onChange: e => (e.target.value = e.target.value.trimStart()),
          onBlur: e => (e.target.value = e.target.value.trim()),
        })}
      />

      {/* Status */}
      <SelectInput
        id="status"
        label="Status"
        options={STATUS_OPTIONS}
        required
        isValid={touchedFields.status && !errors.status}
        error={errors.status?.message}
        touched={touchedFields.status}
        registerProps={register("status", {
          required: "Status is required",
        })}
      />

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
          className={cn(
            "inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
            {
              "bg-green-600 hover:bg-green-700 focus:ring-green-500": isValid,
              "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500":
                !isValid,
              "opacity-70 cursor-not-allowed": isSubmitting,
            }
          )}
          disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Contact"}
        </button>
      </div>
    </form>
  );
}
