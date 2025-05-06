import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Generate a nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

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

  // Add Content Security Policy header with nonce
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || ""};
    upgrade-insecure-requests;
  `;

  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, " ")
    .trim();

  // Add nonce to request headers for access in components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Add CSP header to both request and response
  requestHeaders.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue
  );

  return response;
}

// Apply middleware to specific paths, excluding static assets and prefetches
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
