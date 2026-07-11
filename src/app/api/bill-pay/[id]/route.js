import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { addWeeks, addMonths } from "date-fns";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import BillPay from "@/models/BillPay";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import { generateTransactionReference } from "@/lib/utils";
import { sendEmail, billPayEmail } from "@/lib/resend";

export async function PATCH(request, { params }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action } = body;

  await connectDB();

  const bill = await BillPay.findOne({ _id: id, user: session.user.id });

  if (!bill) {
    return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  }

  if (action === "cancel") {
    bill.status = "cancelled";
    await bill.save();
    return NextResponse.json({ bill });
  }

  if (action === "pay") {
    if (bill.status !== "scheduled") {
      return NextResponse.json({ error: "This bill isn't payable" }, { status: 400 });
    }

    const dbSession = await mongoose.startSession();

    try {
      await dbSession.withTransaction(async () => {
        const account = await Account.findOne({ _id: bill.account, user: session.user.id }).session(dbSession);

        if (!account) {
          throw new Error("Account not found");
        }

        if (account.status !== "active") {
          throw new Error("This account is frozen and cannot be used for payments");
        }

        if (account.balance < bill.amount) {
          throw new Error("Insufficient funds to pay this bill");
        }

        account.balance -= bill.amount;
        await account.save({ session: dbSession });

        await Transaction.create(
          [
            {
              account: account._id,
              user: session.user.id,
              type: "bill_pay",
              amount: bill.amount,
              balanceAfter: account.balance,
              description: `Bill payment — ${bill.payeeName}`,
              status: "completed",
              reference: generateTransactionReference(),
            },
          ],
          { session: dbSession }
        );

        bill.lastPaidDate = new Date();

        if (bill.frequency === "one_time") {
          bill.status = "paid";
        } else {
          bill.nextPaymentDate =
            bill.frequency === "weekly" ? addWeeks(new Date(), 1) : addMonths(new Date(), 1);
        }

        await bill.save({ session: dbSession });
      });

      await sendEmail({
        to: session.user.email,
        subject: "Bill payment sent",
        html: billPayEmail({
          firstName: session.user.firstName,
          action: "paid",
          payeeName: bill.payeeName,
          amount: bill.amount,
        }),
      });

      return NextResponse.json({ bill });
    } catch (error) {
      return NextResponse.json({ error: error.message || "Payment failed" }, { status: 400 });
    } finally {
      await dbSession.endSession();
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}