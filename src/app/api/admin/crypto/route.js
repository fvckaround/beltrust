import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CryptoOrder from "@/models/CryptoOrder";

export async function GET(request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

  await connectDB();

  const query = status ? { status } : {};

  const orders = await CryptoOrder.find(query)
    .sort({ createdAt: -1 })
    .populate("user", "firstName lastName email")
    .populate("account", "type accountNumber");

  return NextResponse.json({ orders });
}