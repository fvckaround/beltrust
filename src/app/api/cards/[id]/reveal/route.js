// src/app/api/cards/[id]/reveal/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Card from "@/models/Card";

export async function GET(request, { params }) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectDB();

  const card = await Card.findOne({ _id: id, user: session.user.id }).select("cardNumber cvv status");

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  if (card.status === "cancelled") {
    return NextResponse.json({ error: "This card is cancelled" }, { status: 400 });
  }

  return NextResponse.json({ cardNumber: card.cardNumber, cvv: card.cvv });
}