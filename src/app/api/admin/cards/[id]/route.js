import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Card from "@/models/Card";
import User from "@/models/User";
import { sendEmail, cardEmail } from "@/lib/resend";

export async function PATCH(request, { params }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action } = body;

  await connectDB();

  const card = await Card.findById(id);

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  if (action === "activate") {
    if (card.status !== "pending_activation") {
      return NextResponse.json({ error: "This card isn't pending activation" }, { status: 400 });
    }
    card.status = "active";
    await card.save();

    const cardUser = await User.findById(card.user);
    if (cardUser) {
      await sendEmail({
        to: cardUser.email,
        subject: "Your card has been activated",
        html: cardEmail({
          firstName: cardUser.firstName,
          action: "activated",
          cardType: card.type,
          last4: card.cardNumberLast4,
        }),
      });
    }

    return NextResponse.json({ card: excludeSensitive(card) });
  }

  if (action === "cancel") {
    card.status = "cancelled";
    await card.save();

    const cardUserCancel = await User.findById(card.user);
    if (cardUserCancel) {
      await sendEmail({
        to: cardUserCancel.email,
        subject: "Your card has been cancelled",
        html: cardEmail({
          firstName: cardUserCancel.firstName,
          action: "cancelled",
          cardType: card.type,
          last4: card.cardNumberLast4,
        }),
      });
    }

    return NextResponse.json({ card: excludeSensitive(card) });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

function excludeSensitive(card) {
  const { cardNumber, cvv, ...safeCard } = card.toObject();
  return safeCard;
}