// src/app/api/transactions/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit")) || 10;

  await connectDB();

  const transactions = await Transaction.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("account", "type accountNumber nickname");

  return NextResponse.json({ transactions });
}