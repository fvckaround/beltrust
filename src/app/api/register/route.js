import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Account from "@/models/Account";
import { sendEmail, welcomeEmail } from "@/lib/resend";

function generateAccountNumber() {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
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
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
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

    await sendEmail({
      to: user.email,
      subject: "Welcome to Beltrust Bank",
      html: welcomeEmail({ firstName: user.firstName }),
    });

    return NextResponse.json(
      { message: "Account created successfully", userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}