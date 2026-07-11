import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Account from "@/models/Account";

export async function GET(request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  await connectDB();

  const query = { role: "customer" };

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query).select("-password").sort({ createdAt: -1 });

  // Attach total balance per user
  const userIds = users.map((u) => u._id);
  const accounts = await Account.find({ user: { $in: userIds } });

  const usersWithBalances = users.map((user) => {
    const userAccounts = accounts.filter((a) => a.user.toString() === user._id.toString());
    const totalBalance = userAccounts.reduce((sum, a) => sum + a.balance, 0);
    return { ...user.toObject(), totalBalance, accountCount: userAccounts.length };
  });

  return NextResponse.json({ users: usersWithBalances });
}