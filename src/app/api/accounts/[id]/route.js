import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Account from "@/models/Account";

export async function GET(request, { params }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const account = await Account.findOne({ _id: id, user: session.user.id }).select(
    "accountNumber routingNumber type"
  );

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  return NextResponse.json({
    accountNumber: account.accountNumber,
    routingNumber: account.routingNumber,
  });
}