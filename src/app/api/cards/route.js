import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Card from "@/models/Card";
import Account from "@/models/Account";
import { sendEmail, cardEmail, sendAdminAlert, adminAlertEmail } from "@/lib/resend";

function generateCardNumber(network) {
  let num = network === "mastercard" ? "5" : "4";
  for (let i = 0; i < 15; i++) num += Math.floor(Math.random() * 10);
  return num;
}

function generateCVV() {
  return Math.floor(100 + Math.random() * 900).toString();
}

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const cards = await Card.find({ user: session.user.id })
    .select("-cardNumber -cvv")
    .populate("account", "type accountNumber")
    .sort({ createdAt: -1 });

  return NextResponse.json({ cards });
}

export async function POST(request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { accountId, type, network, spendingLimit, purpose, shippingAddress } = body;

  if (!accountId || !type) {
    return NextResponse.json({ error: "Account and card type are required" }, { status: 400 });
  }

  if (!purpose || !purpose.trim()) {
    return NextResponse.json({ error: "Please tell us what this card is for" }, { status: 400 });
  }

  if (type === "physical") {
    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zipCode) {
      return NextResponse.json({ error: "A complete shipping address is required for physical cards" }, { status: 400 });
    }
  }

  const cardNetwork = ["visa", "mastercard"].includes(network) ? network : "visa";

  await connectDB();

  const account = await Account.findOne({ _id: accountId, user: session.user.id });

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const existingCardOnAccount = await Card.findOne({
    account: accountId,
    status: { $nin: ["cancelled", "declined"] },
  });

  if (existingCardOnAccount) {
    return NextResponse.json(
      { error: "This account already has a card or a pending request. Delete it first to request a new one." },
      { status: 400 }
    );
  }

  const fullNumber = generateCardNumber(cardNetwork);
  const now = new Date();
  const expiry = new Date(now.setFullYear(now.getFullYear() + 4));

  const card = await Card.create({
    user: session.user.id,
    account: accountId,
    type,
    network: cardNetwork,
    cardNumber: fullNumber,
    cardNumberLast4: fullNumber.slice(-4),
    cvv: generateCVV(),
    cardholderName: `${session.user.firstName} ${session.user.lastName}`.toUpperCase(),
    expiryMonth: expiry.getMonth() + 1,
    expiryYear: expiry.getFullYear(),
    status: "pending_approval",
    spendingLimit: spendingLimit || null,
    purpose: purpose.trim(),
    shippingAddress: type === "physical" ? shippingAddress : undefined,
  });

  const { cardNumber, cvv, ...safeCard } = card.toObject();

  await sendEmail({
    to: session.user.email,
    subject: "Card request received",
    html: cardEmail({
      firstName: session.user.firstName,
      action: "requested",
      cardType: type,
      last4: card.cardNumberLast4,
    }),
  });

  await sendAdminAlert({
    subject: "Card request",
    html: adminAlertEmail({
      type: "Card request",
      customerName: `${session.user.firstName} ${session.user.lastName}`,
      customerEmail: session.user.email,
      details: `${cardNetwork} ${type} card`,
      link: "https://beltrustbank.com/admin/cards",
    }),
  });

  return NextResponse.json({ card: safeCard }, { status: 201 });
}