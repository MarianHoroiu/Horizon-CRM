import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse pagination parameters
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("id");

    // If a specific contact ID is requested, return just that contact
    if (contactId) {
      const contact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          userId: user.id,
        },
      });

      if (!contact) {
        return NextResponse.json(
          { error: "Contact not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ contact });
    }

    // Handle pagination
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const page = pageParam ? parseInt(pageParam) : 1;
    const limit = limitParam ? parseInt(limitParam) : 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalContacts = await prisma.contact.count({
      where: {
        userId: user.id,
      },
    });

    // Get paginated contacts for the user
    const contacts = await prisma.contact.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalContacts / limit);

    return NextResponse.json({
      contacts,
      pagination: {
        total: totalContacts,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// Define schema for contact validation
const contactSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }).max(100),
  lastName: z.string().min(1, { message: "Last name is required" }).max(100),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().max(20),
  company: z.string().max(100),
  status: z.enum(["LEAD", "PROSPECT", "CUSTOMER", "INACTIVE"]).default("LEAD"),
});

export async function POST(request: NextRequest) {
  try {
    // Verify CSRF protection (Next.js handles this by default with fetch API)
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if this is an update operation by looking for the ID parameter
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("id");

    // Parse and validate request body
    const body = await request.json();

    // Use Zod to validate the input data
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error.format() },
        { status: 400 }
      );
    }

    // If contactId is provided, this is an update operation
    if (contactId) {
      // Check if the contact exists and belongs to the user
      const existingContact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          userId: user.id,
        },
      });

      if (!existingContact) {
        return NextResponse.json(
          { error: "Contact not found" },
          { status: 404 }
        );
      }

      // Update contact with validated data
      const updatedContact = await prisma.contact.update({
        where: { id: contactId },
        data: {
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          email: result.data.email,
          phone: result.data.phone,
          company: result.data.company,
          status: result.data.status,
        },
      });

      return NextResponse.json({ contact: updatedContact });
    } else {
      // This is a create operation
      // Create contact with validated data
      const contact = await prisma.contact.create({
        data: {
          userId: user.id,
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          email: result.data.email,
          phone: result.data.phone,
          company: result.data.company,
          status: result.data.status,
        },
      });

      return NextResponse.json({ contact }, { status: 201 });
    }
  } catch (error) {
    console.error("Error managing contact:", error);
    return NextResponse.json(
      { error: "Failed to manage contact" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the contact ID from the URL
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("id");

    if (!contactId) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // Check if the contact exists and belongs to the user
    const existingContact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        userId: user.id,
      },
    });

    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Delete in a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async tx => {
      // First delete all associated tasks
      await tx.task.deleteMany({
        where: {
          contactId: contactId,
        },
      });

      // Then delete the contact
      await tx.contact.delete({
        where: {
          id: contactId,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
