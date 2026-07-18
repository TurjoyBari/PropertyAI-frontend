import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard", "/properties", "/leads", "/pipeline", "/visits"];
const authPrefixes = ["/login", "/register", "/forgot-password", "/reset-password"];

type SessionPayload = {
  user?: { id?: string } | null;
  session?: { id?: string } | null;
} | null;

async function getSession(request: NextRequest): Promise<SessionPayload> {
  try {
    const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
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
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = authPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  const session = await getSession(request);
  const isLoggedIn = Boolean(session?.user || session?.session);

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
