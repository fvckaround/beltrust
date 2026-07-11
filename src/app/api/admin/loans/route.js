import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";

export async function GET(request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";

  await connectDB();

  const query = {};
  if (status) query.status = status;

  const loans = await Loan.find(query)
    .sort({ createdAt: -1 })
    .populate("user", "firstName lastName email");

  return NextResponse.json({ loans });
}