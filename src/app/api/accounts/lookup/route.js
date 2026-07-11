import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Account from "@/models/Account";
import User from "@/models/User";

export async function GET(request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const accountNumber = searchParams.get("accountNumber");

  if (!accountNumber || accountNumber.length < 10) {
    return NextResponse.json({ error: "Invalid account number" }, { status: 400 });
  }

  await connectDB();

  const account = await Account.findOne({ accountNumber, status: "active" });

  if (!account) {
    return NextResponse.json({ error: "No account found" }, { status: 404 });
  }

  const user = await User.findById(account.user).select("firstName lastName");

  if (!user) {
    return NextResponse.json({ error: "No account found" }, { status: 404 });
  }

  // Only reveal first name + last initial — full name isn't necessary and is a privacy consideration
  return NextResponse.json({
    name: `${user.firstName} ${user.lastName[0]}.`,
    accountType: account.type,
  });
}