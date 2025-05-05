import { z } from "zod";
import { StatusSchema } from "./schemas";

/**
 * Contact form validation schema
 */
export const ContactFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name cannot exceed 100 characters" }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^[0-9\-\+\(\)\s]{7,20}$/, {
      message: "Please enter a valid phone number",
    })
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .max(100, { message: "Company name cannot exceed 100 characters" })
    .optional()
    .or(z.literal("")),
  status: StatusSchema,
  userId: z.string().min(1, { message: "Please select a user" }),
});

/**
 * Type inference from the schema
 */
export type ContactFormValues = z.infer<typeof ContactFormSchema>;

/**
 * Default values for the contact form
 */
export const defaultContactValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "LEAD",
  userId: "",
};
