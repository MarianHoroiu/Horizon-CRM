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

  // Get the token with more reliable settings
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  // Redirect unauthenticated users to login page if trying to access protected routes
  if (isProtectedRoute && !token) {
    // Store the original URL to redirect after login
    const url = new URL("/login", request.url);
    const callbackUrl = encodeURIComponent(request.url);
    url.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users to dashboard or callbackUrl if trying to access auth routes
  if (isAuthRoute && token) {
    // Get the callback URL or default to dashboard
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    let redirectUrl = "/dashboard";

    if (callbackUrl) {
      try {
        // Try to decode and use the callback URL
        redirectUrl = decodeURIComponent(callbackUrl);

        // Make sure it's a relative URL for security
        if (redirectUrl.startsWith("http")) {
          const urlObj = new URL(redirectUrl);
          // Only use pathname and search to avoid open redirect vulnerabilities
          redirectUrl = urlObj.pathname + urlObj.search;
        }
      } catch (e) {
        // If there's an error parsing the URL, default to dashboard
        redirectUrl = "/dashboard";
      }
    }

    const finalRedirectUrl = new URL(redirectUrl, request.url);
    return NextResponse.redirect(finalRedirectUrl);
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
