import { z } from "zod";

/**
 * User role validation schema
 */
export const RoleSchema = z.enum(["ADMIN", "MANAGER", "USER"]);
export type Role = z.infer<typeof RoleSchema>;

/**
 * Contact status validation schema
 */
export const StatusSchema = z.enum([
  "LEAD",
  "PROSPECT",
  "CUSTOMER",
  "INACTIVE",
]);
export type Status = z.infer<typeof StatusSchema>;

/**
 * Task status validation schema
 */
export const TaskStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

/**
 * Constants for Role values
 */
export const Role = {
  ADMIN: "ADMIN" as Role,
  MANAGER: "MANAGER" as Role,
  USER: "USER" as Role,
} as const;

/**
 * Constants for Status values
 */
export const Status = {
  LEAD: "LEAD" as Status,
  PROSPECT: "PROSPECT" as Status,
  CUSTOMER: "CUSTOMER" as Status,
  INACTIVE: "INACTIVE" as Status,
} as const;

/**
 * Constants for TaskStatus values
 */
export const TaskStatus = {
  PENDING: "PENDING" as TaskStatus,
  IN_PROGRESS: "IN_PROGRESS" as TaskStatus,
  COMPLETED: "COMPLETED" as TaskStatus,
  CANCELLED: "CANCELLED" as TaskStatus,
} as const;
