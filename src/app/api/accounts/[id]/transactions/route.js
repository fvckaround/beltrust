import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";

export async function GET(request, { params }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const account = await Account.findOne({ _id: id, user: session.user.id });

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const transactions = await Transaction.find({ account: id }).sort({ createdAt: -1 }).limit(50);

  return NextResponse.json({ account, transactions });
}