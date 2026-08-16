import { NextRequest, NextResponse } from "next/server";
import { getServerSession, type TokenPayload } from "@/lib/auth";

/**
 * API-safe require session helper for route handlers.
 * Returns the session payload or throws an Error with code property.
 * Callers should catch errors and translate to JSON responses.
 */
export async function requireApiSession(allowedRoles?: string[]): Promise<TokenPayload> {
  const session = await getServerSession();
  if (!session) {
    const err: any = new Error("Unauthenticated");
    err.code = "UNAUTHENTICATED";
    throw err;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    const err: any = new Error("Forbidden");
    err.code = "FORBIDDEN";
    throw err;
  }

  return session;
}

export function apiUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function apiForbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
