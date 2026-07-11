import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { generateTransactionReference } from "@/lib/utils";
import { sendEmail, fundsAddedEmail } from "@/lib/resend";

export async function POST(request, { params }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { amount, description } = body;

  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    return NextResponse.json({ error: "A valid amount is required" }, { status: 400 });
  }

  await connectDB();

  const dbSession = await mongoose.startSession();

  try {
    let result;

    await dbSession.withTransaction(async () => {
      const account = await Account.findById(id).session(dbSession);

      if (!account) {
        throw new Error("Account not found");
      }

      account.balance += numericAmount;
      await account.save({ session: dbSession });

      await Transaction.create(
        [
          {
            account: account._id,
            user: account.user,
            type: "deposit",
            amount: numericAmount,
            balanceAfter: account.balance,
            description: description || "Deposit by Beltrust Bank",
            status: "completed",
            reference: generateTransactionReference(),
          },
        ],
        { session: dbSession }
      );

      result = { newBalance: account.balance, userId: account.user };
    });

    const fundedUser = await User.findById(result.userId);
    if (fundedUser) {
      await sendEmail({
        to: fundedUser.email,
        subject: "Funds added to your account",
        html: fundsAddedEmail({
          firstName: fundedUser.firstName,
          amount: numericAmount,
          description,
          newBalance: result.newBalance,
        }),
      });
    }

    return NextResponse.json({ message: "Funds added successfully", newBalance: result.newBalance });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to add funds" }, { status: 400 });
  } finally {
    await dbSession.endSession();
  }
}