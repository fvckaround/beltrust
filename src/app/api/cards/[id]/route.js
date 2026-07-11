import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Card from "@/models/Card";
import { sendEmail, cardEmail } from "@/lib/resend";

export async function PATCH(request, { params }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, spendingLimit } = body;

  await connectDB();

  const card = await Card.findOne({ _id: id, user: session.user.id });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  if (status && ["active", "frozen"].includes(status) && card.status !== "cancelled") {
    card.status = status;
  }

  if (spendingLimit !== undefined) {
    card.spendingLimit = spendingLimit === "" ? null : Number(spendingLimit);
  }

  await card.save();

  const { cardNumber, cvv, ...safeCard } = card.toObject();

  if (status && ["active", "frozen"].includes(status)) {
    await sendEmail({
      to: session.user.email,
      subject: status === "frozen" ? "Your card has been frozen" : "Your card has been unfrozen",
      html: cardEmail({
        firstName: session.user.firstName,
        action: status === "frozen" ? "frozen" : "unfrozen",
        cardType: card.type,
        last4: card.cardNumberLast4,
      }),
    });
  }

  return NextResponse.json({ card: safeCard });
}

export async function DELETE(request, { params }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const card = await Card.findOne({ _id: id, user: session.user.id });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  await Card.deleteOne({ _id: id });

  await sendEmail({
    to: session.user.email,
    subject: "Your card has been deleted",
    html: cardEmail({
      firstName: session.user.firstName,
      action: "deleted",
      cardType: card.type,
      last4: card.cardNumberLast4,
    }),
  });

  return NextResponse.json({ message: "Card deleted successfully" });
}