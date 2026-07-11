import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Beltrust Bank <onboarding@resend.dev>";

function wrapper(title, bodyHtml) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#FAFAF9; padding:32px 16px;">
    <div style="max-width:480px; margin:0 auto; background:#FFFFFF; border-radius:16px; overflow:hidden; border:1px solid #E7E5E4;">
      <div style="background:#14213D; padding:24px 32px;">
        <span style="color:#FAFAF9; font-size:18px; font-weight:700;">Beltrust Bank</span>
      </div>
      <div style="padding:32px;">
        <h1 style="font-size:20px; font-weight:700; color:#0A0A0B; margin:0 0 16px;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:20px 32px; border-top:1px solid #E7E5E4;">
        <p style="font-size:12px; color:#6B7280; margin:0;">
          Beltrust Bank · This is an automated message, please don't reply directly to this email.
        </p>
      </div>
    </div>
  </div>`;
}

export async function sendEmail({ to, subject, html }) {
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    console.error("Email send failed:", error);
  }
}

export function welcomeEmail({ firstName }) {
  return wrapper(
    `Welcome to Beltrust, ${firstName}`,
    `<p style="font-size:14px; color:#374151; line-height:1.6;">
      Your account is ready. You now have a Checking and Savings account set up,
      and you can start managing your money right from your dashboard.
    </p>
    <p style="font-size:14px; color:#374151; line-height:1.6;">
      To unlock the full range of features, don't forget to verify your identity
      from Settings.
    </p>`
  );
}

export function transferReviewedEmail({ firstName, amount, status, reason }) {
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const approved = status === "approved";

  return wrapper(
    approved ? "Your transfer was approved" : "Your transfer was declined",
    `<p style="font-size:14px; color:#374151; line-height:1.6;">
      Hi ${firstName}, your transfer of <strong>${currency}</strong> has been
      ${approved ? "approved and completed" : "declined"}.
    </p>
    ${!approved && reason ? `<p style="font-size:14px; color:#B91C1C; background:#FEF2F2; padding:12px 16px; border-radius:8px; line-height:1.6;">${reason}</p>` : ""}
    <p style="font-size:14px; color:#374151; line-height:1.6;">
      You can view the full details in your Transfers history.
    </p>`
  );
}

export function loanReviewedEmail({ firstName, status, amountApproved, interestRate, reason }) {
  const approved = status === "active";
  const currency = amountApproved
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amountApproved)
    : "";

  return wrapper(
    approved ? "Your loan was approved" : "Your loan application was declined",
    `<p style="font-size:14px; color:#374151; line-height:1.6;">
      Hi ${firstName}, your loan application has been
      ${approved ? `approved for <strong>${currency}</strong> at ${interestRate}% APR and disbursed to your checking account` : "declined"}.
    </p>
    ${!approved && reason ? `<p style="font-size:14px; color:#B91C1C; background:#FEF2F2; padding:12px 16px; border-radius:8px; line-height:1.6;">${reason}</p>` : ""}`
  );
}

export function kycReviewedEmail({ firstName, status, reason }) {
  const approved = status === "approved";

  return wrapper(
    approved ? "You're verified" : "Identity verification needs another look",
    `<p style="font-size:14px; color:#374151; line-height:1.6;">
      Hi ${firstName}, your identity verification has been
      ${approved ? "approved. Your account now has full access to all Beltrust features" : "rejected"}.
    </p>
    ${!approved && reason ? `<p style="font-size:14px; color:#B91C1C; background:#FEF2F2; padding:12px 16px; border-radius:8px; line-height:1.6;">${reason}</p>` : ""}
    ${!approved ? `<p style="font-size:14px; color:#374151; line-height:1.6;">You can resubmit your documents from Settings → Identity verification.</p>` : ""}`
  );
}

export function cardEmail({ firstName, action, cardType, last4, reason }) {
  const titles = {
    requested: "Card request received",
    approved: "Your card request was approved",
    declined: "Your card request was declined",
    activated: "Your card has been activated",
    frozen: "Your card has been frozen",
    unfrozen: "Your card has been unfrozen",
    cancelled: "Your card has been cancelled",
    deleted: "Your card has been deleted",
  };

  const messages = {
    requested: `Your request for a ${cardType} card has been received and is under review.`,
    approved: `Your ${cardType} card ending in ${last4} has been approved.`,
    declined: `Your request for a ${cardType} card has been declined.`,
    activated: `Your ${cardType} card ending in ${last4} is now active and ready to use.`,
    frozen: `Your ${cardType} card ending in ${last4} has been frozen. It cannot be used until unfrozen.`,
    unfrozen: `Your ${cardType} card ending in ${last4} has been unfrozen and is active again.`,
    cancelled: `Your ${cardType} card ending in ${last4} has been cancelled and can no longer be used.`,
    deleted: `Your ${cardType} card ending in ${last4} has been removed from your account.`,
  };

  return wrapper(
    titles[action],
    `<p style="font-size:14px; color:#374151; line-height:1.6;">
      Hi ${firstName}, ${messages[action]}
    </p>
    ${reason ? `<p style="font-size:14px; color:#B91C1C; background:#FEF2F2; padding:12px 16px; border-radius:8px; line-height:1.6;">${reason}</p>` : ""}
    <p style="font-size:14px; color:#374151; line-height:1.6;">
      If you didn't request this change, please contact support immediately.
    </p>`
  );
}

export function billPayEmail({ firstName, action, payeeName, amount }) {
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const title = action === "scheduled" ? "Bill payment scheduled" : "Bill payment sent";
  const message =
    action === "scheduled"
      ? `A payment of <strong>${currency}</strong> to ${payeeName} has been scheduled.`
      : `A payment of <strong>${currency}</strong> to ${payeeName} has been completed.`;

  return wrapper(
    title,
    `<p style="font-size:14px; color:#374151; line-height:1.6;">
      Hi ${firstName}, ${message}
    </p>`
  );
}

export function cryptoOrderEmail({ firstName, action, orderAction, symbol, quantity, total, reason }) {
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total);
  const verb = orderAction === "buy" ? "purchase" : "sale";

  const titles = {
    requested: `Crypto ${verb} request received`,
    approved: `Your crypto ${verb} was approved`,
    declined: `Your crypto ${verb} was declined`,
  };

  const messages = {
    requested: `Your request to ${orderAction} <strong>${quantity} ${symbol}</strong> for <strong>${currency}</strong> is under review.`,
    approved: `Your ${orderAction} of <strong>${quantity} ${symbol}</strong> for <strong>${currency}</strong> has been approved and completed.`,
    declined: `Your ${orderAction} of <strong>${quantity} ${symbol}</strong> for <strong>${currency}</strong> has been declined.`,
  };

  return wrapper(
    titles[action],
    `<p style="font-size:14px; color:#374151; line-height:1.6;">
      Hi ${firstName}, ${messages[action]}
    </p>
    ${reason ? `<p style="font-size:14px; color:#B91C1C; background:#FEF2F2; padding:12px 16px; border-radius:8px; line-height:1.6;">${reason}</p>` : ""}`
  );
}

export function accountStatusEmail({ firstName, action, accountType, reason }) {
  const titles = {
    frozen: "Your account has been frozen",
    unfrozen: "Your account has been unfrozen",
    deleted: "Your account has been closed",
  };

  const messages = {
    frozen: `Your ${accountType} account has been frozen and cannot be used for transactions until unfrozen.`,
    unfrozen: `Your ${accountType} account has been unfrozen and is active again.`,
    deleted: `Your ${accountType} account has been closed.`,
  };

  return wrapper(
    titles[action],
    `<p style="font-size:14px; color:#374151; line-height:1.6;">
      Hi ${firstName}, ${messages[action]}
    </p>
    ${reason ? `<p style="font-size:14px; color:#374151; line-height:1.6;">Reason: ${reason}</p>` : ""}
    <p style="font-size:14px; color:#374151; line-height:1.6;">
      If you have questions, please contact support.
    </p>`
  );
}

export function fundsAddedEmail({ firstName, amount, description, newBalance }) {
  const currency = (val) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  return wrapper(
    "Funds added to your account",
    `<p style="font-size:14px; color:#374151; line-height:1.6;">
      Hi ${firstName}, <strong>${currency(amount)}</strong> has been added to your account
      ${description ? `— ${description}` : ""}.
    </p>
    <p style="font-size:14px; color:#374151; line-height:1.6;">
      New balance: <strong>${currency(newBalance)}</strong>
    </p>`
  );
}

export function userStatusEmail({ firstName, action, reason }) {
  const title = action === "suspended" ? "Your account access has changed" : "Your account has been reactivated";
  const message =
    action === "suspended"
      ? "Your Beltrust account has been suspended. You will not be able to log in or access your accounts until this is resolved."
      : "Your Beltrust account has been reactivated. You can now log in and use all features as normal.";

  return wrapper(
    title,
    `<p style="font-size:14px; color:#374151; line-height:1.6;">
      Hi ${firstName}, ${message}
    </p>
    ${reason ? `<p style="font-size:14px; color:#374151; line-height:1.6;">Reason: ${reason}</p>` : ""}
    <p style="font-size:14px; color:#374151; line-height:1.6;">
      If you believe this is a mistake, please contact support.
    </p>`
  );
}