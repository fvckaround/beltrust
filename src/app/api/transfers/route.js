import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import Transfer from "@/models/Transfer";
import { generateTransactionReference } from "@/lib/utils";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const transfers = await Transfer.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .populate("sourceAccount", "type accountNumber")
    .populate("destinationAccountId", "type accountNumber");

  return NextResponse.json({ transfers });
}

export async function POST(request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    sourceAccountId,
    transferType, // "internal" | "beltrust" | "external_bank"
    destinationAccountId,
    destinationAccountNumber,
    destinationBankName,
    destinationRoutingNumber,
    recipientName,
    amount,
    description,
  } = body;

  const numericAmount = Number(amount);

  if (!sourceAccountId || !transferType || !numericAmount || numericAmount <= 0) {
    return NextResponse.json({ error: "Source account, type, and a valid amount are required" }, { status: 400 });
  }

  if (transferType === "internal" && !destinationAccountId) {
    return NextResponse.json({ error: "Select a destination account" }, { status: 400 });
  }

  if (transferType === "beltrust" && !destinationAccountNumber) {
    return NextResponse.json({ error: "Enter the recipient's account number" }, { status: 400 });
  }

  if (transferType === "external_bank") {
    if (!destinationBankName || !destinationAccountNumber || !destinationRoutingNumber || !recipientName) {
      return NextResponse.json(
        { error: "Bank name, routing number, account number, and recipient name are required" },
        { status: 400 }
      );
    }
  }

  await connectDB();

  const dbSession = await mongoose.startSession();

  try {
    let result;

    await dbSession.withTransaction(async () => {
      const sourceAccount = await Account.findOne({ _id: sourceAccountId, user: session.user.id }).session(dbSession);

      if (!sourceAccount) {
        throw new Error("Source account not found");
      }

      if (sourceAccount.status !== "active") {
        throw new Error("This account is not active");
      }

      if (sourceAccount.balance < numericAmount) {
        throw new Error("Insufficient funds");
      }

      let destinationAccount = null;
      let recipientLabel = recipientName || "";

      if (transferType === "internal") {
        destinationAccount = await Account.findOne({ _id: destinationAccountId, user: session.user.id }).session(dbSession);
        if (!destinationAccount) {
          throw new Error("Destination account not found");
        }
        if (destinationAccount._id.toString() === sourceAccount._id.toString()) {
          throw new Error("Choose a different destination account");
        }
      }

      if (transferType === "beltrust") {
        destinationAccount = await Account.findOne({ accountNumber: destinationAccountNumber }).session(dbSession);
        if (!destinationAccount) {
          throw new Error("No Beltrust account found with that account number");
        }
        if (destinationAccount._id.toString() === sourceAccount._id.toString()) {
          throw new Error("Choose a different destination account");
        }
      }

      // Place hold — debit the source account immediately, funds released or refunded on admin review
      sourceAccount.balance -= numericAmount;
      await sourceAccount.save({ session: dbSession });

      const reference = generateTransactionReference();

      const holdTx = await Transaction.create(
        [
          {
            account: sourceAccount._id,
            user: session.user.id,
            type: "transfer_out",
            amount: numericAmount,
            balanceAfter: sourceAccount.balance,
            description:
              description ||
              (transferType === "external_bank"
                ? `Transfer to ${destinationBankName} — ${recipientName}`
                : `Transfer to •••• ${destinationAccount.accountNumber.slice(-4)}`),
            counterpartyName: recipientLabel || undefined,
            counterpartyAccountNumber: destinationAccount?.accountNumber || destinationAccountNumber,
            status: "pending",
            reference,
          },
        ],
        { session: dbSession }
      );

      const transfer = await Transfer.create(
        [
          {
            user: session.user.id,
            sourceAccount: sourceAccount._id,
            transferType,
            destinationAccountId: transferType === "internal" ? destinationAccount._id : undefined,
            destinationAccountNumber:
              transferType !== "internal" ? destinationAccount?.accountNumber || destinationAccountNumber : undefined,
            destinationBankName: transferType === "external_bank" ? destinationBankName : undefined,
            destinationRoutingNumber: transferType === "external_bank" ? destinationRoutingNumber : undefined,
            recipientName: recipientLabel || undefined,
            amount: numericAmount,
            description,
            status: "pending",
            holdTransaction: holdTx[0]._id,
            reference,
          },
        ],
        { session: dbSession }
      );

      result = { transfer: transfer[0], newBalance: sourceAccount.balance };
    });

    return NextResponse.json(
      { message: "Transfer submitted and pending admin approval", ...result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Transfer error:", error.message);
    return NextResponse.json({ error: error.message || "Transfer failed" }, { status: 400 });
  } finally {
    await dbSession.endSession();
  }
}