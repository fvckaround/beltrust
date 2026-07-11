import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

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

  // Protect customer dashboard routes
  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Protect admin routes — require admin role
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  // Redirect logged-in users away from admin login — send by role
  if (isAdminLoginRoute && isLoggedIn) {
    return NextResponse.redirect(
      new URL(userRole === "admin" ? "/admin/dashboard" : "/dashboard", nextUrl)
    );
  }

  // Redirect logged-in users away from customer login/register — send by role
  if (isCustomerAuthRoute && isLoggedIn) {
    return NextResponse.redirect(
      new URL(userRole === "admin" ? "/admin/dashboard" : "/dashboard", nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
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