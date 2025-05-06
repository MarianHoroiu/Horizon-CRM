import { z } from "zod";
import { StatusSchema } from "./schemas";

/**
 * Contact form validation schema
 */
export const ContactFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }).max(100),
  lastName: z.string().min(1, { message: "Last name is required" }).max(100),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  phone: z.string().min(1, { message: "Phone number is required" }).max(20),
  company: z.string().min(1, { message: "Company is required" }).max(100),
  status: StatusSchema,
  userId: z.string().optional(),
});

/**
 * Type for the values from the contact form schema
 */
export type ContactFormValues = z.infer<typeof ContactFormSchema>;

/**
 * Default values for the contact form
 */
export const defaultContactValues: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  status: "LEAD",
  userId: "",
};
