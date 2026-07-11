import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import KYC from "@/models/KYC";
import User from "@/models/User";
import { sendEmail, kycReviewedEmail } from "@/lib/resend";

export async function PATCH(request, { params }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action, rejectionReason } = body;

  await connectDB();

  const kyc = await KYC.findById(id);

  if (!kyc) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (kyc.status !== "pending") {
    return NextResponse.json({ error: "This submission has already been reviewed" }, { status: 400 });
  }

  if (action === "approve") {
    kyc.status = "approved";
    kyc.reviewedBy = session.user.id;
    kyc.reviewedAt = new Date();
    await kyc.save();

    await User.findByIdAndUpdate(kyc.user, {
      kycStatus: "approved",
      status: "active",
    });

    const kycUser = await User.findById(kyc.user);
    if (kycUser) {
      await sendEmail({
        to: kycUser.email,
        subject: "You're verified",
        html: kycReviewedEmail({ firstName: kycUser.firstName, status: "approved" }),
      });
    }

    return NextResponse.json({ kyc });
  }

  if (action === "reject") {
    if (!rejectionReason?.trim()) {
      return NextResponse.json({ error: "A rejection reason is required" }, { status: 400 });
    }

    kyc.status = "rejected";
    kyc.rejectionReason = rejectionReason;
    kyc.reviewedBy = session.user.id;
    kyc.reviewedAt = new Date();
    await kyc.save();

    await User.findByIdAndUpdate(kyc.user, { kycStatus: "rejected" });

    const kycUser = await User.findById(kyc.user);
    if (kycUser) {
      await sendEmail({
        to: kycUser.email,
        subject: "Identity verification needs another look",
        html: kycReviewedEmail({ firstName: kycUser.firstName, status: "rejected", reason: rejectionReason }),
      });
    }

    return NextResponse.json({ kyc });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}