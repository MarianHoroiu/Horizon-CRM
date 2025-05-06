import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { Role } from "@/lib/validations/schemas";
import type { NextAuthOptions } from "next-auth";

// Extend the built-in types for NextAuth
declare module "next-auth" {
  interface User {
    role?: string;
    firstName?: string;
    lastName?: string;
  }

  interface Session {
    user: {
      id?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      image?: string;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    firstName?: string;
    lastName?: string;
  }
}

// Define the NextAuth configuration options
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find the user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // If no user was found or the password doesn't match
        if (
          !user ||
          !(await bcrypt.compare(credentials.password, user.password))
        ) {
          return null;
        }

        // Return the user object without the password
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          role: user.role,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt" as const, // Use JWT strategy for session management
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // Include user role and id in the JWT token
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom properties to the session
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle callback URLs correctly, ensuring we respect the original callbackUrl
      // If the URL starts with the base URL, it's safe
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // For absolute URLs that don't start with baseUrl, use the baseUrl (security measure)
      else if (url.startsWith("http")) {
        return baseUrl;
      }
      // For relative URLs, properly resolve them
      return new URL(url, baseUrl).toString();
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET || "default-secret-key-change-in-production",
};

// Create the handler using the authOptions
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
