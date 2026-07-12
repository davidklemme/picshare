import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/", "/admin/:path*"],
};

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  return NextResponse.next();
}
