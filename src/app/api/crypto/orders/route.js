import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CryptoOrder from "@/models/CryptoOrder";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const orders = await CryptoOrder.find({ user: session.user.id }).sort({ createdAt: -1 }).limit(30);

  return NextResponse.json({ orders });
}