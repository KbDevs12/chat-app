import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_COOKIE } from "@/lib/auth/constants";
import { clearAuthCookies } from "@/lib/auth/cookies";

const AUTH_PAGES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE);
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (!hasSession && !isAuthPage) {
    await clearAuthCookies();
    return NextResponse.json({ message: "Berhasil keluar." });
  }

  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
