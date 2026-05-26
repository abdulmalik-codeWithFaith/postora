import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: Firebase Auth is client-side only — it does not set server-readable
// cookies by default. Route protection is handled in:
//   - app/dashboard/layout.tsx  → uses AuthContext to redirect unauthenticated
//   - app/admin/layout.tsx      → same for admin routes
//
// This middleware only handles lightweight header tasks (CSP, CORS etc.)
// If you want server-side session cookies, use Firebase Admin SDK + iron-session.
// ─────────────────────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};