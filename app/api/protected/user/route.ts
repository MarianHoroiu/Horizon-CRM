import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// This is a protected route that can only be accessed by authenticated users
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to access this endpoint" },
      { status: 401 }
    );
  }

  // Return the user data from the session
  return NextResponse.json({
    user: {
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    },
    message: "This is a protected API route",
  });
}
