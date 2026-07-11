import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import KYC from "@/models/KYC";
import User from "@/models/User";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const kyc = await KYC.findOne({ user: session.user.id });

  return NextResponse.json({ kyc });
}

export async function POST(request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { idType, idNumber, idFrontImage, idBackImage, selfieImage } = body;

  if (!idType || !idNumber || !idFrontImage) {
    return NextResponse.json(
      { error: "ID type, number, and front image are required" },
      { status: 400 }
    );
  }

  await connectDB();

  const existing = await KYC.findOne({ user: session.user.id });

  const kyc = existing
    ? Object.assign(existing, { idType, idNumber, idFrontImage, idBackImage, selfieImage, status: "pending" })
    : new KYC({
        user: session.user.id,
        idType,
        idNumber,
        idFrontImage,
        idBackImage,
        selfieImage,
        status: "pending",
      });

  await kyc.save();

  await User.findByIdAndUpdate(session.user.id, { kycStatus: "pending" });

  return NextResponse.json({ kyc }, { status: 201 });
}