import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Transfer from "@/models/Transfer";
import Account from "@/models/Account";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { generateTransactionReference } from "@/lib/utils";
import { sendEmail, transferReviewedEmail } from "@/lib/resend";

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
    let result;

    await dbSession.withTransaction(async () => {
      const transfer = await Transfer.findById(id).session(dbSession);

      if (!transfer) {
        throw new Error("Transfer not found");
      }

      if (transfer.status !== "pending") {
        throw new Error("This transfer has already been reviewed");
      }

      const holdTx = await Transaction.findById(transfer.holdTransaction).session(dbSession);

      if (action === "decline") {
        const sourceAccount = await Account.findById(transfer.sourceAccount).session(dbSession);
        sourceAccount.balance += transfer.amount;
        await sourceAccount.save({ session: dbSession });

        if (holdTx) {
          holdTx.status = "reversed";
          await holdTx.save({ session: dbSession });
        }

        transfer.status = "declined";
        transfer.reviewedBy = session.user.id;
        transfer.reviewNotes = reviewNotes || "Declined by admin";
        await transfer.save({ session: dbSession });

        result = { transfer };
        return;
      }

      if (action === "approve") {
        if (holdTx) {
          holdTx.status = "completed";
          await holdTx.save({ session: dbSession });
        }

        if (transfer.transferType !== "external_bank") {
          const destinationAccount = transfer.destinationAccountId
            ? await Account.findById(transfer.destinationAccountId).session(dbSession)
            : await Account.findOne({ accountNumber: transfer.destinationAccountNumber }).session(dbSession);

          if (!destinationAccount) {
            throw new Error("Destination account no longer exists");
          }

          destinationAccount.balance += transfer.amount;
          await destinationAccount.save({ session: dbSession });

          await Transaction.create(
            [
              {
                account: destinationAccount._id,
                user: destinationAccount.user,
                type: "transfer_in",
                amount: transfer.amount,
                balanceAfter: destinationAccount.balance,
                description: transfer.description || "Incoming transfer",
                counterpartyAccountNumber: holdTx?.account?.toString(),
                status: "completed",
                reference: `${transfer.reference}-IN`,
              },
            ],
            { session: dbSession }
          );
        }

        transfer.status = "approved";
        transfer.reviewedBy = session.user.id;
        transfer.reviewNotes = reviewNotes || "";
        await transfer.save({ session: dbSession });

        result = { transfer };
      }
    });

    if (!result) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const transferUser = await User.findById(result.transfer.user);
    if (transferUser) {
      await sendEmail({
        to: transferUser.email,
        subject: result.transfer.status === "approved" ? "Your transfer was approved" : "Your transfer was declined",
        html: transferReviewedEmail({
          firstName: transferUser.firstName,
          amount: result.transfer.amount,
          status: result.transfer.status,
          reason: result.transfer.reviewNotes,
        }),
      });
    }

    // Notify the receiving customer for approved Beltrust-to-Beltrust transfers
    if (result.transfer.status === "approved" && result.transfer.transferType === "beltrust") {
      const destinationAccount = result.transfer.destinationAccountId
        ? await Account.findById(result.transfer.destinationAccountId)
        : await Account.findOne({ accountNumber: result.transfer.destinationAccountNumber });

      if (destinationAccount) {
        const receivingUser = await User.findById(destinationAccount.user);
        if (receivingUser && transferUser && receivingUser._id.toString() !== transferUser._id.toString()) {
          await sendEmail({
            to: receivingUser.email,
            subject: "You've received a transfer",
            html: transferReviewedEmail({
              firstName: receivingUser.firstName,
              amount: result.transfer.amount,
              status: "approved",
              isReceiver: true,
            }),
          });
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Transfer review error:", error.message);
    return NextResponse.json({ error: error.message || "Review failed" }, { status: 400 });
  } finally {
    await dbSession.endSession();
  }
}