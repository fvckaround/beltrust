import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Account from "@/models/Account";
import { sendEmail, userStatusEmail } from "@/lib/resend";

export async function GET(request, { params }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const user = await User.findById(id).select("-password");

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [accounts, cards, loans, recentTransactions] = await Promise.all([
    Account.find({ user: id }),
    (await import("@/models/Card")).default.find({ user: id }).select("-cardNumber -cvv"),
    (await import("@/models/Loan")).default.find({ user: id }),
    (await import("@/models/Transaction")).default.find({ user: id }).sort({ createdAt: -1 }).limit(10),
  ]);

  return NextResponse.json({ user, accounts, cards, loans, recentTransactions });
}

export async function PATCH(request, { params }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (!["active", "suspended", "pending_verification"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select("-password");

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (["active", "suspended"].includes(status)) {
    await sendEmail({
      to: user.email,
      subject: status === "suspended" ? "Your account access has changed" : "Your account has been reactivated",
      html: userStatusEmail({
        firstName: user.firstName,
        action: status === "suspended" ? "suspended" : "activated",
      }),
    });
  }

  return NextResponse.json({ user });
}