import { NextRequest, NextResponse } from "next/server";

// ─── Protected route prefixes ─────────────────────────────────────────────────
const DASHBOARD_ROUTES = ["/dashboard"];
const ADMIN_ROUTES     = ["/admin"];
const AUTH_ROUTES      = ["/login", "/signup", "/forgot-password"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read session cookie set by Firebase on login
  const session = req.cookies.get("__session")?.value;

  const isDashboard = DASHBOARD_ROUTES.some((r) => pathname.startsWith(r));
  const isAdmin     = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthPage  = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminLogin = pathname === "/admin/login";

  // ── Redirect unauthenticated users away from protected routes ──────────────
  if ((isDashboard || (isAdmin && !isAdminLogin)) && !session) {
    const loginUrl = isAdmin
      ? new URL("/admin/login", req.url)
      : new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Redirect authenticated users away from auth pages ─────────────────────
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/forgot-password",
  ],
};