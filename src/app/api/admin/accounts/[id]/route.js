import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Account from "@/models/Account";
import Card from "@/models/Card";
import User from "@/models/User";
import { sendEmail, accountStatusEmail } from "@/lib/resend";

export async function PATCH(request, { params }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (!["active", "frozen"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await connectDB();

  const account = await Account.findById(id);

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  if (account.status === "closed") {
    return NextResponse.json({ error: "This account is closed" }, { status: 400 });
  }

  account.status = status;
  await account.save();

  const accountUser = await User.findById(account.user);
  if (accountUser) {
    await sendEmail({
      to: accountUser.email,
      subject: status === "frozen" ? "Your account has been frozen" : "Your account has been unfrozen",
      html: accountStatusEmail({
        firstName: accountUser.firstName,
        action: status === "frozen" ? "frozen" : "unfrozen",
        accountType: account.type,
      }),
    });
  }

  return NextResponse.json({ account });
}

export async function DELETE(request, { params }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const account = await Account.findById(id);

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  if (account.balance !== 0) {
    return NextResponse.json(
      { error: "Account balance must be $0 before it can be deleted. Transfer or withdraw remaining funds first." },
      { status: 400 }
    );
  }

  const linkedCard = await Card.findOne({ account: id, status: { $ne: "cancelled" } });

  if (linkedCard) {
    return NextResponse.json(
      { error: "This account has an active card linked to it. Cancel the card first." },
      { status: 400 }
    );
  }

  const deletedAccountUser = await User.findById(account.user);

  await Account.deleteOne({ _id: id });

  if (deletedAccountUser) {
    await sendEmail({
      to: deletedAccountUser.email,
      subject: "Your account has been closed",
      html: accountStatusEmail({
        firstName: deletedAccountUser.firstName,
        action: "deleted",
        accountType: account.type,
      }),
    });
  }

  return NextResponse.json({ message: "Account deleted successfully" });
}