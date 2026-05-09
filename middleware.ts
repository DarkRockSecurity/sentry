import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Match all routes except static assets and the auth callback (which
  // sets cookies during the OAuth/email-link exchange and must run
  // without our session-refresh wrapper interfering).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|marketing/|api/auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
