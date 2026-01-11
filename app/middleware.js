import { NextResponse } from "next/server";

/**
 * ROLE → BASE PATH MAP
 * This is the single source of truth for routing by role
 */
const ROLE_ROUTES = {
  super_admin: "/client/super-admin",
  admin: "/client/admin",
  operator: "/client/operator",
};

/**
 * Routes that do NOT require authentication
 */
const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
];

/**
 * Utility: check if path is public
 */
function isPublicRoute(pathname) {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read auth cookie (set by backend on login)
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  /**
   * 1️⃣ USER NOT LOGGED IN
   */
  if (!token) {
    // Allow only auth pages
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }

    // Block everything else
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  /**
   * 2️⃣ USER LOGGED IN BUT VISITING AUTH PAGES
   * Redirect them to their dashboard
   */
  if (isPublicRoute(pathname)) {
    const dashboardPath = ROLE_ROUTES[role];
    return NextResponse.redirect(
      new URL(`${dashboardPath}/dashboard`, request.url)
    );
  }

  /**
   * 3️⃣ ROLE-BASED ACCESS CONTROL
   * User can ONLY access their own role routes
   */
  const allowedBasePath = ROLE_ROUTES[role];
  if (!allowedBasePath || !pathname.startsWith(allowedBasePath)) {
    return NextResponse.redirect(
      new URL(`${allowedBasePath || "/auth"}/dashboard`, request.url)
    );
  }

  /**
   * 4️⃣ ACCESS GRANTED
   */
  return NextResponse.next();
}

/**
 * Middleware matcher
 * Excludes static files and Next.js internals
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
