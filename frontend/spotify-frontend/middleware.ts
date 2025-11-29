import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value; // read cookie

  const { pathname } = request.nextUrl;

  // Public routes
  const publicPaths = ["/", "/login", "/register"];

  const isPublic = publicPaths.includes(pathname);

  // If NOT logged in and trying to access a protected page → redirect to login
  if (!token && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in & trying to access login/register → redirect to dashboard or home
  if (token && (pathname === "/login" || pathname === "/register")) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
