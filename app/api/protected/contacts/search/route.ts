import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Define a schema for input validation using zod
const searchSchema = z.object({
  query: z.string().trim().min(1).max(100),
});

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameter safely
    const searchParams = request.nextUrl.searchParams;
    const queryParam = searchParams.get("query") || "";

    // Validate the input
    const result = searchSchema.safeParse({ query: queryParam });

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid search query" },
        { status: 400 }
      );
    }

    // Use the validated, sanitized query
    const { query } = result.data;

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use Prisma's built-in sanitization and parameterized queries
    // to prevent SQL injection
    const contacts = await prisma.contact.findMany({
      where: {
        userId: user.id,
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { email: { contains: query } },
          { company: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Error searching contacts:", error);
    return NextResponse.json(
      { error: "Failed to search contacts" },
      { status: 500 }
    );
  }
}
