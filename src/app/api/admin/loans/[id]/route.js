import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { generateTransactionReference } from "@/lib/utils";
import { sendEmail, loanReviewedEmail } from "@/lib/resend";

export async function PATCH(request, { params }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action, amountApproved, interestRate, reviewNotes } = body;

  await connectDB();

  const loan = await Loan.findById(id);

  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }

  if (loan.status !== "pending") {
    return NextResponse.json({ error: "This loan has already been reviewed" }, { status: 400 });
  }

  if (action === "reject") {
    loan.status = "rejected";
    loan.reviewedBy = session.user.id;
    loan.reviewNotes = reviewNotes || "Application did not meet approval criteria";
    await loan.save();

    const loanUser = await User.findById(loan.user);
    if (loanUser) {
      await sendEmail({
        to: loanUser.email,
        subject: "Your loan application was declined",
        html: loanReviewedEmail({ firstName: loanUser.firstName, status: "rejected", reason: loan.reviewNotes }),
      });
    }

    return NextResponse.json({ loan });
  }

  if (action === "approve") {
    const approvedAmount = Number(amountApproved) || loan.amountRequested;
    const rate = Number(interestRate);

    if (!rate || rate <= 0) {
      return NextResponse.json({ error: "A valid interest rate is required" }, { status: 400 });
    }

    const monthlyRate = rate / 100 / 12;
    const n = loan.termMonths;
    const monthlyPayment =
      (approvedAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1);

    const dbSession = await mongoose.startSession();

    try {
      await dbSession.withTransaction(async () => {
        const account = await Account.findOne({ user: loan.user, type: "checking" }).session(dbSession);

        if (!account) {
          throw new Error("No checking account found to disburse funds into");
        }

        account.balance += approvedAmount;
        await account.save({ session: dbSession });

        await Transaction.create(
          [
            {
              account: account._id,
              user: loan.user,
              type: "deposit",
              amount: approvedAmount,
              balanceAfter: account.balance,
              description: `Loan disbursement — ${loan.type} loan`,
              status: "completed",
              reference: generateTransactionReference(),
            },
          ],
          { session: dbSession }
        );

        loan.status = "active";
        loan.amountApproved = approvedAmount;
        loan.interestRate = rate;
        loan.monthlyPayment = Math.round(monthlyPayment * 100) / 100;
        loan.remainingBalance = approvedAmount;
        loan.disbursedToAccount = account._id;
        loan.reviewedBy = session.user.id;
        loan.reviewNotes = reviewNotes || "";

        await loan.save({ session: dbSession });
      });

      const loanUser = await User.findById(loan.user);
      if (loanUser) {
        await sendEmail({
          to: loanUser.email,
          subject: "Your loan was approved",
          html: loanReviewedEmail({
            firstName: loanUser.firstName,
            status: "active",
            amountApproved: loan.amountApproved,
            interestRate: loan.interestRate,
          }),
        });
      }

      return NextResponse.json({ loan });
    } catch (error) {
      return NextResponse.json({ error: error.message || "Approval failed" }, { status: 400 });
    } finally {
      await dbSession.endSession();
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}