import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CryptoWallet from "@/models/CryptoWallet";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  let wallet = await CryptoWallet.findOne({ user: session.user.id });

  if (!wallet) {
    wallet = await CryptoWallet.create({ user: session.user.id, holdings: [] });
  }

  return NextResponse.json({ wallet });
}