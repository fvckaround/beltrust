import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import { sendAdminAlert, adminAlertEmail } from "@/lib/resend";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const loans = await Loan.find({ user: session.user.id }).sort({ createdAt: -1 });

  return NextResponse.json({ loans });
}

export async function POST(request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, amountRequested, termMonths, purpose } = body;

  const numericAmount = Number(amountRequested);
  const numericTerm = Number(termMonths);

  if (!type || !numericAmount || numericAmount <= 0 || !numericTerm || numericTerm <= 0) {
    return NextResponse.json(
      { error: "Loan type, amount, and term are required" },
      { status: 400 }
    );
  }

  if (!["personal", "business"].includes(type)) {
    return NextResponse.json({ error: "Invalid loan type" }, { status: 400 });
  }

  await connectDB();

  const loan = await Loan.create({
    user: session.user.id,
    type,
    amountRequested: numericAmount,
    termMonths: numericTerm,
    purpose,
    status: "pending",
  });

  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numericAmount);

  await sendAdminAlert({
    subject: "Loan application",
    html: adminAlertEmail({
      type: "Loan application",
      customerName: `${session.user.firstName} ${session.user.lastName}`,
      customerEmail: session.user.email,
      details: `${currency} — ${type} loan, ${numericTerm} months`,
      link: "https://beltrustbank.com/admin/loans",
    }),
  });

  return NextResponse.json({ loan }, { status: 201 });
}