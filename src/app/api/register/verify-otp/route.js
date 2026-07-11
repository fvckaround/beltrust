import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Account from "@/models/Account";
import OtpVerification from "@/models/OtpVerification";
import { sendEmail, welcomeEmail } from "@/lib/resend";

function generateAccountNumber() {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    await connectDB();

    const otpRecord = await OtpVerification.findOne({ email: email.toLowerCase() });

    if (!otpRecord) {
      return NextResponse.json({ error: "Code expired or not found. Please request a new one." }, { status: 400 });
    }

    if (otpRecord.attempts >= 5) {
      await OtpVerification.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({ error: "Too many incorrect attempts. Please request a new code." }, { status: 400 });
    }

    if (otpRecord.code !== code) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
    }

    const { firstName, lastName, password, phone, dateOfBirth } = otpRecord.userData;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await OtpVerification.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      dateOfBirth,
      role: "customer",
      status: "pending_verification",
      kycStatus: "not_started",
      emailVerified: true,
    });

    async function uniqueAccountNumber() {
      let num;
      let exists = true;
      while (exists) {
        num = generateAccountNumber();
        exists = await Account.findOne({ accountNumber: num });
      }
      return num;
    }

    const checkingNumber = await uniqueAccountNumber();
    const savingsNumber = await uniqueAccountNumber();

    await Account.create([
      {
        user: user._id,
        accountNumber: checkingNumber,
        type: "checking",
        nickname: "Primary Checking",
        balance: 0,
      },
      {
        user: user._id,
        accountNumber: savingsNumber,
        type: "savings",
        nickname: "Savings",
        balance: 0,
        interestRate: 2.5,
      },
    ]);

    await OtpVerification.deleteOne({ _id: otpRecord._id });

    await sendEmail({
      to: user.email,
      subject: "Welcome to Beltrust Bank",
      html: welcomeEmail({ firstName: user.firstName }),
    });

    return NextResponse.json({ message: "Account created successfully", userId: user._id }, { status: 201 });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}