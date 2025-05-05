import { z } from "zod";

/**
 * Generic validation function
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Object with validation result and potential errors
 */
export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown
): {
  success: boolean;
  data: z.infer<T> | null;
  error: z.ZodError | null;
} {
  try {
    const validData = schema.parse(data);
    return {
      success: true,
      data: validData,
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        error,
      };
    }
    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * Format Zod validation errors into a user-friendly format
 * @param error - Zod error
 * @returns Object mapping field paths to error messages
 */
export function formatZodErrors(error: z.ZodError) {
  return error.errors.reduce((acc, err) => {
    const path = err.path.join(".");
    acc[path] = err.message;
    return acc;
  }, {} as Record<string, string>);
}
