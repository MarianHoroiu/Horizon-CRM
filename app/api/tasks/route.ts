import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Define the validation schema
const taskCreateSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title must be 100 characters or less" }),
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(500, { message: "Description must be 500 characters or less" }),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  dueDate: z
    .string()
    .min(1, { message: "Due date is required" })
    .refine(date => !isNaN(Date.parse(date)), {
      message: "Please enter a valid date",
    }),
  contactId: z.string().min(1, { message: "Contact is required" }),
});

// GET handler for fetching tasks
export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const status = url.searchParams.get("status");
    const skip = (page - 1) * limit;

    // Define where clause based on status parameter
    const whereClause: Prisma.TaskWhereInput = { userId };
    if (status) {
      whereClause.status = status;
    }

    // Count total tasks for each status category
    const [
      totalCount,
      pendingCount,
      inProgressCount,
      completedCount,
      cancelledCount,
    ] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: "PENDING" } }),
      prisma.task.count({ where: { userId, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { userId, status: "COMPLETED" } }),
      prisma.task.count({ where: { userId, status: "CANCELLED" } }),
    ]);

    // Fetch tasks with pagination and filtering
    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Count tasks that match the current filter
    const filteredTotal = status
      ? await prisma.task.count({ where: whereClause })
      : totalCount;

    return NextResponse.json({
      tasks,
      pagination: {
        total: filteredTotal,
        pages: Math.ceil(filteredTotal / limit),
        page,
        limit,
      },
      counts: {
        TOTAL: totalCount,
        PENDING: pendingCount,
        IN_PROGRESS: inProgressCount,
        COMPLETED: completedCount,
        CANCELLED: cancelledCount,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST handler for creating a new task
export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();

    // Validate the input
    const validationResult = taskCreateSchema.safeParse(body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      console.warn("Task Creation API - Validation failed:", formattedErrors);

      return NextResponse.json(
        { error: "Validation failed", details: formattedErrors },
        { status: 400 }
      );
    }

    const { title, description, status, dueDate, contactId } =
      validationResult.data;

    // Verify that the contact exists and belongs to the user
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        userId,
      },
    });

    if (!contact) {
      console.warn(
        `Task Creation API - Contact ${contactId} not found or not accessible for user ${userId}`
      );
      return NextResponse.json(
        { error: "Contact not found or not accessible" },
        { status: 404 }
      );
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        dueDate: new Date(dueDate),
        userId,
        contactId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Task created successfully", task },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
