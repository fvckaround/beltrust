import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/accounts") ||
    nextUrl.pathname.startsWith("/transfers") ||
    nextUrl.pathname.startsWith("/cards") ||
    nextUrl.pathname.startsWith("/loans") ||
    nextUrl.pathname.startsWith("/crypto") ||
    nextUrl.pathname.startsWith("/bill-pay") ||
    nextUrl.pathname.startsWith("/settings");

  const isAdminRoute = nextUrl.pathname.startsWith("/admin") &&
    !nextUrl.pathname.startsWith("/admin/login");

  const isAdminLoginRoute = nextUrl.pathname.startsWith("/admin/login");

  const isCustomerAuthRoute = nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  if (isAdminLoginRoute && isLoggedIn) {
    return NextResponse.redirect(
      new URL(userRole === "admin" ? "/admin/dashboard" : "/dashboard", nextUrl)
    );
  }

  if (isCustomerAuthRoute && isLoggedIn) {
    return NextResponse.redirect(
      new URL(userRole === "admin" ? "/admin/dashboard" : "/dashboard", nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  runtime: "nodejs",
  matcher: [
    "/dashboard/:path*",
    "/accounts/:path*",
    "/transfers/:path*",
    "/cards/:path*",
    "/loans/:path*",
    "/crypto/:path*",
    "/bill-pay/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};