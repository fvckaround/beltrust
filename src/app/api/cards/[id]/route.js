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
  const { action, reviewNotes, trackingNumber } = body;

  await connectDB();

  const card = await Card.findById(id);

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  if (action === "approve") {
    if (card.status !== "pending_approval") {
      return NextResponse.json({ error: "This card request has already been reviewed" }, { status: 400 });
    }

    card.status = card.type === "physical" ? "pending_activation" : "active";
    card.reviewedBy = session.user.id;
    card.reviewNotes = reviewNotes || "";
    await card.save();

    const cardUser = await User.findById(card.user);
    if (cardUser) {
      await sendEmail({
        to: cardUser.email,
        subject: "Your card request was approved",
        html: cardEmail({
          firstName: cardUser.firstName,
          action: "approved",
          cardType: card.type,
          last4: card.cardNumberLast4,
        }),
      });
    }

    return NextResponse.json({ card: excludeSensitive(card) });
  }

  if (action === "decline") {
    if (card.status !== "pending_approval") {
      return NextResponse.json({ error: "This card request has already been reviewed" }, { status: 400 });
    }

    if (!reviewNotes?.trim()) {
      return NextResponse.json({ error: "A reason for declining is required" }, { status: 400 });
    }

    card.status = "declined";
    card.reviewedBy = session.user.id;
    card.reviewNotes = reviewNotes;
    await card.save();

    const cardUserDeclined = await User.findById(card.user);
    if (cardUserDeclined) {
      await sendEmail({
        to: cardUserDeclined.email,
        subject: "Your card request was declined",
        html: cardEmail({
          firstName: cardUserDeclined.firstName,
          action: "declined",
          cardType: card.type,
          last4: card.cardNumberLast4,
          reason: reviewNotes,
        }),
      });
    }

    return NextResponse.json({ card: excludeSensitive(card) });
  }

  if (action === "ship") {
    if (card.status !== "pending_activation") {
      return NextResponse.json({ error: "This card isn't ready to ship" }, { status: 400 });
    }

    if (!trackingNumber?.trim()) {
      return NextResponse.json({ error: "A tracking number is required" }, { status: 400 });
    }

    card.status = "shipped";
    card.trackingNumber = trackingNumber.trim();
    card.shippedAt = new Date();
    await card.save();

    const cardUserShipped = await User.findById(card.user);
    if (cardUserShipped) {
      await sendEmail({
        to: cardUserShipped.email,
        subject: "Your card has shipped",
        html: cardEmail({
          firstName: cardUserShipped.firstName,
          action: "shipped",
          cardType: card.type,
          last4: card.cardNumberLast4,
        }),
      });
    }

    return NextResponse.json({ card: excludeSensitive(card) });
  }

  if (action === "activate") {
    if (!["pending_activation", "shipped"].includes(card.status)) {
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