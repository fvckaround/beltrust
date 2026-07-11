import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Account from "@/models/Account";
import Loan from "@/models/Loan";
import KYC from "@/models/KYC";

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const [totalUsers, accounts, pendingLoans, pendingKyc] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Account.find({}, "balance"),
    Loan.countDocuments({ status: "pending" }),
    KYC.countDocuments({ status: "pending" }),
  ]);

  const totalDeposits = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return NextResponse.json({ totalUsers, totalDeposits, pendingLoans, pendingKyc });
}