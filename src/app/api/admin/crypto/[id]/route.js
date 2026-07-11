import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import CryptoOrder from "@/models/CryptoOrder";
import Account from "@/models/Account";
import CryptoWallet from "@/models/CryptoWallet";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { sendEmail, cryptoOrderEmail } from "@/lib/resend";

export async function PATCH(request, { params }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action, reviewNotes } = body;

  await connectDB();

  const dbSession = await mongoose.startSession();

  try {
    let order;

    await dbSession.withTransaction(async () => {
      order = await CryptoOrder.findById(id).session(dbSession);

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status !== "pending") {
        throw new Error("This order has already been reviewed");
      }

      if (action === "decline") {
        const account = await Account.findById(order.account).session(dbSession);

        if (order.action === "buy") {
          account.balance += order.total;
          await account.save({ session: dbSession });

          if (order.holdTransaction) {
            await Transaction.findByIdAndUpdate(order.holdTransaction, { status: "reversed" }, { session: dbSession });
          }
        } else {
          let wallet = await CryptoWallet.findOne({ user: order.user }).session(dbSession);
          if (!wallet) {
            [wallet] = await CryptoWallet.create([{ user: order.user, holdings: [] }], { session: dbSession });
          }
          const holdingIndex = wallet.holdings.findIndex((h) => h.symbol === order.symbol);
          if (holdingIndex >= 0) {
            wallet.holdings[holdingIndex].quantity += order.quantity;
          } else {
            wallet.holdings.push({ symbol: order.symbol, name: order.name, quantity: order.quantity, averageBuyPrice: order.price });
          }
          await wallet.save({ session: dbSession });
        }

        order.status = "declined";
        order.reviewedBy = session.user.id;
        order.reviewNotes = reviewNotes || "Declined by admin";
        await order.save({ session: dbSession });
        return;
      }

      if (action === "approve") {
        if (order.action === "buy") {
          let wallet = await CryptoWallet.findOne({ user: order.user }).session(dbSession);
          if (!wallet) {
            [wallet] = await CryptoWallet.create([{ user: order.user, holdings: [] }], { session: dbSession });
          }
          const holdingIndex = wallet.holdings.findIndex((h) => h.symbol === order.symbol);
          if (holdingIndex >= 0) {
            const existing = wallet.holdings[holdingIndex];
            const newQuantity = existing.quantity + order.quantity;
            existing.averageBuyPrice =
              (existing.quantity * existing.averageBuyPrice + order.quantity * order.price) / newQuantity;
            existing.quantity = newQuantity;
          } else {
            wallet.holdings.push({ symbol: order.symbol, name: order.name, quantity: order.quantity, averageBuyPrice: order.price });
          }
          wallet.totalInvestedUSD += order.total;
          await wallet.save({ session: dbSession });

          if (order.holdTransaction) {
            await Transaction.findByIdAndUpdate(order.holdTransaction, { status: "completed" }, { session: dbSession });
          }
        } else {
          const account = await Account.findById(order.account).session(dbSession);
          account.balance += order.total;
          await account.save({ session: dbSession });

          await Transaction.create(
            [
              {
                account: account._id,
                user: order.user,
                type: "deposit",
                amount: order.total,
                balanceAfter: account.balance,
                description: `Sold ${order.quantity} ${order.symbol}`,
                status: "completed",
                reference: `${order.reference}-SELL`,
              },
            ],
            { session: dbSession }
          );
        }

        order.status = "approved";
        order.reviewedBy = session.user.id;
        order.reviewNotes = reviewNotes || "";
        await order.save({ session: dbSession });
      }
    });

    const orderUser = await User.findById(order.user);
    if (orderUser) {
      await sendEmail({
        to: orderUser.email,
        subject: order.status === "approved" ? `Your crypto ${order.action} was approved` : `Your crypto ${order.action} was declined`,
        html: cryptoOrderEmail({
          firstName: orderUser.firstName,
          action: order.status,
          orderAction: order.action,
          symbol: order.symbol,
          quantity: order.quantity,
          total: order.total,
          reason: order.reviewNotes,
        }),
      });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Crypto order review error:", error.message);
    return NextResponse.json({ error: error.message || "Review failed" }, { status: 400 });
  } finally {
    await dbSession.endSession();
  }
}