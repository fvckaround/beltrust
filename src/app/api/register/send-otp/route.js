import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import OtpVerification from "@/models/OtpVerification";
import { sendEmail, otpEmail } from "@/lib/resend";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, phone, dateOfBirth } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "First name, last name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const code = generateOtp();

    // Remove any previous pending OTP for this email before creating a new one
    await OtpVerification.deleteMany({ email: email.toLowerCase() });

    await OtpVerification.create({
      email: email.toLowerCase(),
      code,
      userData: { firstName, lastName, email: email.toLowerCase(), password, phone, dateOfBirth },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await sendEmail({
      to: email,
      subject: "Verify your email — Beltrust Bank",
      html: otpEmail({ firstName, code }),
    });

    return NextResponse.json({ message: "Verification code sent" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}