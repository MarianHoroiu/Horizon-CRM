import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Session } from "next-auth";

// Define the interface inline
export interface UserSession extends Session {
  user: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    image?: string;
    role?: string;
  };
}

// Helper function to get the current authenticated session
export async function auth(): Promise<UserSession | null> {
  return getServerSession(authOptions);
}
