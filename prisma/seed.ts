import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Role, Status, TaskStatus } from "../lib/validations/schemas";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Constants for seeding
const ADMIN_CONTACTS = 20;
const MANAGER_CONTACTS = 15;
const SALES_CONTACTS = 25;
const TASKS_PER_CONTACT_MIN = 1;
const TASKS_PER_CONTACT_MAX = 4;

// Function to hash passwords
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Function to generate a random status
function getRandomStatus(): Status {
  const statuses = [
    Status.LEAD,
    Status.PROSPECT,
    Status.CUSTOMER,
    Status.INACTIVE,
  ];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// Function to generate a random task status
function getRandomTaskStatus(): TaskStatus {
  const statuses = [
    TaskStatus.PENDING,
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
    TaskStatus.CANCELLED,
  ];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// Function to generate a random date within a range
function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Function to create random tasks for a contact
async function createRandomTasks(userId: string, contactId: string) {
  const numTasks =
    Math.floor(
      Math.random() * (TASKS_PER_CONTACT_MAX - TASKS_PER_CONTACT_MIN + 1)
    ) + TASKS_PER_CONTACT_MIN;

  const tasks = [];
  for (let i = 0; i < numTasks; i++) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30); // 30 days ago

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days in future

    tasks.push({
      title: faker.lorem.sentence({ min: 3, max: 5 }),
      description: faker.lorem.paragraph(),
      status: getRandomTaskStatus(),
      dueDate: getRandomDate(pastDate, futureDate),
      userId,
      contactId,
    });
  }

  return await prisma.task.createMany({
    data: tasks,
  });
}

// Function to create random contacts for a user
async function createRandomContacts(userId: string, count: number) {
  console.log(`Creating ${count} contacts for user ${userId}...`);

  for (let i = 0; i < count; i++) {
    const contact = await prisma.contact.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number(),
        company: faker.company.name(),
        status: getRandomStatus(),
        userId,
      },
    });

    await createRandomTasks(userId, contact.id);
  }
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
  const admin = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@horizon-crm.com",
      password: defaultPassword,
      role: Role.ADMIN,
    },
  });

  // Create manager user
  const manager = await prisma.user.create({
    data: {
      firstName: "Manager",
      lastName: "User",
      email: "manager@horizon-crm.com",
      password: defaultPassword,
      role: Role.MANAGER,
    },
  });

  // Create regular user
  const salesRep = await prisma.user.create({
    data: {
      firstName: "Sales",
      lastName: "Representative",
      email: "sales@horizon-crm.com",
      password: defaultPassword,
      role: Role.USER,
    },
  });

  // Create random contacts and tasks for each user
  await createRandomContacts(admin.id, ADMIN_CONTACTS);
  await createRandomContacts(manager.id, MANAGER_CONTACTS);
  await createRandomContacts(salesRep.id, SALES_CONTACTS);

  console.log("Database seeding completed!");
  console.log(`Created ${ADMIN_CONTACTS} contacts for Admin`);
  console.log(`Created ${MANAGER_CONTACTS} contacts for Manager`);
  console.log(`Created ${SALES_CONTACTS} contacts for Sales Representative`);
  console.log(
    `Total Contacts: ${ADMIN_CONTACTS + MANAGER_CONTACTS + SALES_CONTACTS}`
  );
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
