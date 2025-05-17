import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get("token")?.value || "";

  // Define protected paths that require authentication
  const protectedPaths = [
    "/home",
    "/dashboard",
    "/profile",
    "/view-resume",
    "/generated-resume"
  ];

  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Define authentication paths
  const isAuthPath =
    request.nextUrl.pathname.includes("/sign-in") ||
    request.nextUrl.pathname.includes("/sign-up");

  // If trying to access protected path without token, redirect to login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If user is already logged in and tries to access auth pages, redirect to home
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

// Specify which paths this middleware should run for
export const config = {
  matcher: [
    "/home/:path*", 
    "/dashboard/:path*", 
    "/profile/:path*", 
    "/view-resume/:path*", 
    "/generated-resume/:path*", 
    "/sign-in", 
    "/sign-up"
  ],
};
