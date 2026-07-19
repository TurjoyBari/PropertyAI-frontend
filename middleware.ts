import { NextRequest, NextResponse } from "next/server";
import {
  canAccessAdmin,
  canAccessAgentHome,
  canAccessCustomerHome,
  canAccessOps,
  homeForRole,
} from "@/lib/roles";

const opsPrefixes = [
  "/dashboard",
  "/properties",
  "/leads",
  "/pipeline",
  "/visits",
  "/reports",
  "/notifications",
  "/ai",
  "/messages",
];
const customerPrefixes = ["/customer"];
const adminPrefixes = ["/admin"];
const agentPrefixes = ["/agent"];
const accountPrefixes = ["/account"];
const authPrefixes = ["/login", "/register", "/forgot-password", "/reset-password"];

/** Personal tools under /customer/* that any authenticated role may use. */
const customerPersonalPaths = [
  "/customer/favorites",
  "/customer/visits",
  "/customer/messages",
  "/customer/notifications",
  "/customer/settings",
  "/customer/profile",
  "/customer/ai",
];

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

function isCustomerPersonal(pathname: string) {
  return customerPersonalPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isOps = opsPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isCustomer = customerPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isAdmin = adminPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAgentArea = agentPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isAccount = accountPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isAuthRoute = authPrefixes.some((p) => pathname.startsWith(p));

  if (
    !isOps &&
    !isCustomer &&
    !isAdmin &&
    !isAgentArea &&
    !isAuthRoute &&
    !isAccount
  ) {
    return NextResponse.next();
  }

  const session = await getSession(request);
  const isLoggedIn = Boolean(session?.user || session?.session);
  const role = session?.user?.role;

  if (
    (isOps || isCustomer || isAdmin || isAgentArea || isAccount) &&
    !isLoggedIn
  ) {
    const loginUrl = new URL("/login", request.url);
    const nextTarget = `${pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set("next", nextTarget);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    const next = request.nextUrl.searchParams.get("next");
    if (next?.startsWith("/") && !next.startsWith("//")) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    return NextResponse.redirect(new URL(homeForRole(role), request.url));
  }

  if (isAdmin && !canAccessAdmin(role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isAgentArea && !canAccessAgentHome(role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isOps && !canAccessOps(role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Customer home dashboard is customers-only; agents/admins use their own dashboards.
  if (isCustomer && !isCustomerPersonal(pathname) && !canAccessCustomerHome(role)) {
    return NextResponse.redirect(new URL(homeForRole(role), request.url));
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
    "/messages",
    "/messages/:path*",
    "/agent",
    "/agent/:path*",
    "/customer",
    "/customer/:path*",
    "/admin",
    "/admin/:path*",
    "/account",
    "/account/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
