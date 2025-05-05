import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a protected route
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/api/protected");

  // Check if the path is an auth route
  const isAuthRoute = pathname.startsWith("/login");

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect unauthenticated users to login page if trying to access protected routes
  if (isProtectedRoute && !token) {
    // Store the original URL to redirect after login
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users to dashboard if trying to access auth routes
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Apply middleware to specific paths
export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/api/protected/:path*",
    // Auth routes
    "/login",
  ],
};
