import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Card from "@/models/Card";

export async function GET(request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";

  await connectDB();

  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;

  const cards = await Card.find(query)
    .select("-cardNumber -cvv")
    .sort({ createdAt: -1 })
    .populate("user", "firstName lastName email")
    .populate("account", "type accountNumber");

  return NextResponse.json({ cards });
}