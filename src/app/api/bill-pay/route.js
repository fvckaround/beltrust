import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import BillPay from "@/models/BillPay";
import { sendEmail, billPayEmail } from "@/lib/resend";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const bills = await BillPay.find({ user: session.user.id }).sort({ nextPaymentDate: 1 });

  return NextResponse.json({ bills });
}

export async function POST(request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { accountId, payeeName, category, amount, frequency, nextPaymentDate } = body;

  const numericAmount = Number(amount);

  if (!accountId || !payeeName || !numericAmount || numericAmount <= 0 || !nextPaymentDate) {
    return NextResponse.json(
      { error: "Account, payee, amount, and date are required" },
      { status: 400 }
    );
  }

  await connectDB();

  const bill = await BillPay.create({
    user: session.user.id,
    account: accountId,
    payeeName,
    category: category || "other",
    amount: numericAmount,
    frequency: frequency || "one_time",
    nextPaymentDate,
    status: "scheduled",
  });

  await sendEmail({
    to: session.user.email,
    subject: "Bill payment scheduled",
    html: billPayEmail({
      firstName: session.user.firstName,
      action: "scheduled",
      payeeName: bill.payeeName,
      amount: bill.amount,
    }),
  });

  return NextResponse.json({ bill }, { status: 201 });
}