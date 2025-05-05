import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Role, Status, TaskStatus } from "../lib/validations/schemas";

const prisma = new PrismaClient();

// Function to hash passwords
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

async function main() {
  // Clean the database
  await prisma.task.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("Database cleared!");

  console.log("Seeding database...");

  // Default password for all test accounts
  const defaultPassword = await hashPassword("Password123!");

  // Create admin user
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@horizon-crm.com",
      password: defaultPassword,
      role: Role.ADMIN,
    },
  });

  // Create manager user
  const manager = await prisma.user.create({
    data: {
      name: "Manager User",
      email: "manager@horizon-crm.com",
      password: defaultPassword,
      role: Role.MANAGER,
    },
  });

  // Create regular user
  const user = await prisma.user.create({
    data: {
      name: "Sales Representative",
      email: "sales@horizon-crm.com",
      password: defaultPassword,
      role: Role.USER,
    },
  });

  // Create contacts
  const lead = await prisma.contact.create({
    data: {
      name: "John Smith",
      email: "john@example.com",
      phone: "555-123-4567",
      company: "ABC Corp",
      status: Status.LEAD,
      userId: user.id,
    },
  });

  const prospect = await prisma.contact.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "555-987-6543",
      company: "XYZ Industries",
      status: Status.PROSPECT,
      userId: manager.id,
    },
  });

  const customer = await prisma.contact.create({
    data: {
      name: "Michael Brown",
      email: "michael@example.com",
      phone: "555-456-7890",
      company: "Acme Inc",
      status: Status.CUSTOMER,
      userId: user.id,
    },
  });

  const inactive = await prisma.contact.create({
    data: {
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "555-789-0123",
      company: "Old Client LLC",
      status: Status.INACTIVE,
      userId: manager.id,
    },
  });

  // Create tasks
  await prisma.task.create({
    data: {
      title: "Initial outreach call",
      description: "Introduce our services and schedule a demo",
      status: TaskStatus.PENDING,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      userId: user.id,
      contactId: lead.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Prepare proposal",
      description: "Create custom proposal based on client needs",
      status: TaskStatus.IN_PROGRESS,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      userId: manager.id,
      contactId: prospect.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Onboarding session",
      description: "Walk through product features and setup",
      status: TaskStatus.COMPLETED,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      userId: user.id,
      contactId: customer.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Follow-up meeting",
      description: "Discuss renewal options",
      status: TaskStatus.CANCELLED,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      userId: manager.id,
      contactId: inactive.id,
    },
  });

  console.log("Database seeding completed!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
