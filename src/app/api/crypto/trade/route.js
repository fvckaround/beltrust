import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Account from "@/models/Account";
import CryptoWallet from "@/models/CryptoWallet";
import Transaction from "@/models/Transaction";
import { generateTransactionReference } from "@/lib/utils";
import { sendEmail, cryptoTradeEmail } from "@/lib/resend";

export async function POST(request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { accountId, action, symbol, name, quantity, price } = body;

  const numericQuantity = Number(quantity);
  const numericPrice = Number(price);
  const totalCost = numericQuantity * numericPrice;

  if (!accountId || !action || !symbol || !numericQuantity || numericQuantity <= 0 || !numericPrice) {
    return NextResponse.json({ error: "Missing or invalid trade details" }, { status: 400 });
  }

  if (!["buy", "sell"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await connectDB();

  const dbSession = await mongoose.startSession();

  try {
    let result;

    await dbSession.withTransaction(async () => {
      const account = await Account.findOne({ _id: accountId, user: session.user.id }).session(dbSession);

      if (!account) {
        throw new Error("Account not found");
      }

      if (account.status !== "active") {
        throw new Error("This account is frozen and cannot be used for trading");
      }

      let wallet = await CryptoWallet.findOne({ user: session.user.id }).session(dbSession);
      if (!wallet) {
        [wallet] = await CryptoWallet.create([{ user: session.user.id, holdings: [] }], { session: dbSession });
      }

      const holdingIndex = wallet.holdings.findIndex((h) => h.symbol === symbol);

      if (action === "buy") {
        if (account.balance < totalCost) {
          throw new Error("Insufficient funds in selected account");
        }

        account.balance -= totalCost;

        if (holdingIndex >= 0) {
          const existing = wallet.holdings[holdingIndex];
          const newQuantity = existing.quantity + numericQuantity;
          const newAvgPrice =
            (existing.quantity * existing.averageBuyPrice + numericQuantity * numericPrice) / newQuantity;
          existing.quantity = newQuantity;
          existing.averageBuyPrice = newAvgPrice;
        } else {
          wallet.holdings.push({ symbol, name, quantity: numericQuantity, averageBuyPrice: numericPrice });
        }

        wallet.totalInvestedUSD += totalCost;
      } else {
        if (holdingIndex < 0 || wallet.holdings[holdingIndex].quantity < numericQuantity) {
          throw new Error("Insufficient crypto balance to sell");
        }

        wallet.holdings[holdingIndex].quantity -= numericQuantity;
        if (wallet.holdings[holdingIndex].quantity <= 0.00000001) {
          wallet.holdings.splice(holdingIndex, 1);
        }

        account.balance += totalCost;
      }

      await account.save({ session: dbSession });
      await wallet.save({ session: dbSession });

      const txType = action === "buy" ? "withdrawal" : "deposit";

      await Transaction.create(
        [
          {
            account: account._id,
            user: session.user.id,
            type: txType,
            amount: totalCost,
            balanceAfter: account.balance,
            description: `${action === "buy" ? "Bought" : "Sold"} ${numericQuantity} ${symbol}`,
            status: "completed",
            reference: generateTransactionReference(),
          },
        ],
        { session: dbSession }
      );

      result = { wallet, newBalance: account.balance };
    });

    await sendEmail({
      to: session.user.email,
      subject: action === "buy" ? "Crypto purchase confirmed" : "Crypto sale confirmed",
      html: cryptoTradeEmail({
        firstName: session.user.firstName,
        action,
        symbol,
        quantity: numericQuantity,
        total: totalCost,
      }),
    });

    return NextResponse.json({ message: "Trade completed", ...result }, { status: 201 });
  } catch (error) {
    console.error("Crypto trade error:", error.message);
    return NextResponse.json({ error: error.message || "Trade failed" }, { status: 400 });
  } finally {
    await dbSession.endSession();
  }
}