import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "";
  const status = searchParams.get("status") || "";
  const limit = Number(searchParams.get("limit")) || 50;

  await connectDB();

  const query = {};

  if (type) query.type = type;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { reference: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { counterpartyName: { $regex: search, $options: "i" } },
    ];
  }

  const transactions = await Transaction.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", "firstName lastName email")
    .populate("account", "type accountNumber");

  return NextResponse.json({ transactions });
}