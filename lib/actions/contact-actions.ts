import { validate, formatZodErrors } from "@/lib/validations/utils";
import {
  ContactFormSchema,
  type ContactFormValues,
} from "@/lib/validations/contact-form-schema";
import prisma from "@/lib/prisma";

/**
 * Type for the return value of the createContact action
 */
type CreateContactResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  contact?: { id: string; firstName: string; lastName: string };
};

/**
 * Server action to create a new contact with validation
 */
export async function createContact(
  formData: FormData
): Promise<CreateContactResult> {
  // Convert FormData to a plain object
  const rawData = Object.fromEntries(formData.entries());

  // Validate using the Zod schema
  const validation = validate(ContactFormSchema, rawData);

  // If validation failed, return errors
  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed. Please check the form for errors.",
      errors: formatZodErrors(validation.error!),
    };
  }

  // Get the validated data
  const data = validation.data!;

  try {
    // Create the contact in the database
    const contact = await prisma.contact.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        status: data.status,
        userId:
          data.userId ||
          process.env.DEFAULT_USER_ID ||
          "DEFAULT_USER_ID_PLACEHOLDER",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    return {
      success: true,
      message: "Contact created successfully!",
      contact: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
      },
    };
  } catch (error) {
    console.error("Failed to create contact:", error);

    return {
      success: false,
      message: "An error occurred while creating the contact.",
    };
  }
}

/**
 * Example of how to use the server action with TypeScript
 * Demonstrates type inference from the schema
 */
export async function createContactTyped(
  data: ContactFormValues
): Promise<CreateContactResult> {
  const validation = validate(ContactFormSchema, data);

  if (!validation.success) {
    return {
      success: false,
      message: "Validation failed. Please check the form for errors.",
      errors: formatZodErrors(validation.error!),
    };
  }

  const validatedData = validation.data!;

  try {
    const contact = await prisma.contact.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        company: validatedData.company,
        status: validatedData.status,
        userId:
          validatedData.userId ||
          process.env.DEFAULT_USER_ID ||
          "DEFAULT_USER_ID_PLACEHOLDER",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    return {
      success: true,
      message: "Contact created successfully!",
      contact: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
      },
    };
  } catch (error) {
    console.error("Failed to create contact:", error);

    return {
      success: false,
      message: "An error occurred while creating the contact.",
    };
  }
}
