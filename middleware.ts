import { NextRequest, NextResponse } from "next/server";
import { canAccessAdmin, canAccessOps, homeForRole } from "@/lib/roles";

const opsPrefixes = [
  "/dashboard",
  "/properties",
  "/leads",
  "/pipeline",
  "/visits",
  "/reports",
  "/notifications",
  "/ai",
];
const customerPrefixes = ["/customer"];
const adminPrefixes = ["/admin"];
const authPrefixes = ["/login", "/register", "/forgot-password", "/reset-password"];

type SessionPayload = {
  user?: { id?: string; role?: string } | null;
  session?: { id?: string } | null;
} | null;

async function getSession(request: NextRequest): Promise<SessionPayload> {
  try {
    const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isOps = opsPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isCustomer = customerPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAdmin = adminPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAuthRoute = authPrefixes.some((p) => pathname.startsWith(p));

  if (!isOps && !isCustomer && !isAdmin && !isAuthRoute) {
    return NextResponse.next();
  }

  const session = await getSession(request);
  const isLoggedIn = Boolean(session?.user || session?.session);
  const role = session?.user?.role;

  if ((isOps || isCustomer || isAdmin) && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(homeForRole(role), request.url));
  }

  if (isAdmin && !canAccessAdmin(role)) {
    return NextResponse.redirect(new URL(homeForRole(role), request.url));
  }

  if (isOps && !canAccessOps(role)) {
    return NextResponse.redirect(new URL("/customer", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/properties",
    "/properties/:path*",
    "/leads",
    "/leads/:path*",
    "/pipeline",
    "/pipeline/:path*",
    "/visits",
    "/visits/:path*",
    "/reports",
    "/reports/:path*",
    "/notifications",
    "/notifications/:path*",
    "/ai",
    "/ai/:path*",
    "/customer",
    "/customer/:path*",
    "/admin",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
