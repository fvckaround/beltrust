import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Account from "@/models/Account";
import CryptoWallet from "@/models/CryptoWallet";
import CryptoOrder from "@/models/CryptoOrder";
import Transaction from "@/models/Transaction";
import { generateTransactionReference } from "@/lib/utils";
import { sendEmail, cryptoOrderEmail } from "@/lib/resend";

export async function POST(request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { accountId, action, symbol, name, quantity, price } = body;

  const numericQuantity = Number(quantity);
  const numericPrice = Number(price);
  const total = numericQuantity * numericPrice;

  if (!accountId || !action || !symbol || !numericQuantity || numericQuantity <= 0 || !numericPrice) {
    return NextResponse.json({ error: "Missing or invalid trade details" }, { status: 400 });
  }

  if (!["buy", "sell"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await connectDB();

  const dbSession = await mongoose.startSession();

  try {
    let order;

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

      const reference = generateTransactionReference();
      let holdTx = null;

      if (action === "buy") {
        if (account.balance < total) {
          throw new Error("Insufficient funds in selected account");
        }

        account.balance -= total;
        await account.save({ session: dbSession });

        const created = await Transaction.create(
          [
            {
              account: account._id,
              user: session.user.id,
              type: "withdrawal",
              amount: total,
              balanceAfter: account.balance,
              description: `Pending: Buy ${numericQuantity} ${symbol}`,
              status: "pending",
              reference,
            },
          ],
          { session: dbSession }
        );
        holdTx = created[0];
      } else {
        const holdingIndex = wallet.holdings.findIndex((h) => h.symbol === symbol);

        if (holdingIndex < 0 || wallet.holdings[holdingIndex].quantity < numericQuantity) {
          throw new Error("Insufficient crypto balance to sell");
        }

        wallet.holdings[holdingIndex].quantity -= numericQuantity;
        if (wallet.holdings[holdingIndex].quantity <= 0.00000001) {
          wallet.holdings.splice(holdingIndex, 1);
        }
        await wallet.save({ session: dbSession });
      }

      const created = await CryptoOrder.create(
        [
          {
            user: session.user.id,
            account: account._id,
            action,
            symbol,
            name,
            quantity: numericQuantity,
            price: numericPrice,
            total,
            status: "pending",
            holdTransaction: holdTx?._id,
            reference,
          },
        ],
        { session: dbSession }
      );

      order = created[0];
    });

    await sendEmail({
      to: session.user.email,
      subject: `Crypto ${action} request received`,
      html: cryptoOrderEmail({
        firstName: session.user.firstName,
        action: "requested",
        orderAction: action,
        symbol,
        quantity: numericQuantity,
        total,
      }),
    });

    return NextResponse.json({ message: "Order submitted and pending approval", order }, { status: 201 });
  } catch (error) {
    console.error("Crypto order error:", error.message);
    return NextResponse.json({ error: error.message || "Order failed" }, { status: 400 });
  } finally {
    await dbSession.endSession();
  }
}