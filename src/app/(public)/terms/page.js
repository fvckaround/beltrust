export const metadata = {
  title: "Terms of Service | Beltrust Bank",
  description: "Read Beltrust Bank's Terms of Service governing the use of our banking platform.",
};

export default function TermsPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-xs font-semibold tracking-wide text-emerald uppercase">
            Legal
          </span>
          <h1 className="mt-3 font-display font-extrabold text-4xl tracking-tight text-ink leading-tight">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-muted">Last updated: July 2026</p>
        </div>

        <div className="prose-content space-y-8 text-sm text-ink leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">1. Agreement to Terms</h2>
            <p className="text-muted">
              These Terms of Service ("Terms") govern your access to and use of
              Beltrust Bank's website, mobile applications, and banking
              services (collectively, the "Services"). By creating an account
              or using the Services, you agree to be bound by these Terms. If
              you do not agree, do not use the Services.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">2. Eligibility</h2>
            <p className="text-muted">
              You must be at least 18 years old and capable of forming a
              legally binding contract to open an account with Beltrust.
              Accounts are available to individuals who can provide accurate
              identifying information and pass our identity verification
              process. We reserve the right to refuse service to anyone for
              any lawful reason.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">3. Account Registration & Security</h2>
            <p className="text-muted">
              You are responsible for maintaining the confidentiality of your
              login credentials and for all activity that occurs under your
              account. You agree to notify us immediately of any unauthorized
              use of your account or any other breach of security. Beltrust
              is not liable for any loss or damage arising from your failure
              to protect your account credentials.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">4. Deposits, Transfers & Funds Availability</h2>
            <p className="text-muted">
              Funds transferred into your account, whether from an external
              bank, another Beltrust customer, or a deposit, may be subject
              to a hold period before becoming available for withdrawal.
              Transfers initiated through the Services are reviewed prior to
              completion and may be declined at Beltrust's discretion,
              including but not limited to cases of suspected fraud,
              insufficient verification, or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">5. Fees</h2>
            <p className="text-muted">
              Applicable account fees, if any, are disclosed on our Pricing
              page and in your account agreement at the time of account
              opening. We will provide advance notice of any material changes
              to fees before they take effect.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">6. Cards</h2>
            <p className="text-muted">
              Debit cards issued through Beltrust are linked to a specific
              account and subject to the spending limits, if any, that you or
              Beltrust set. All card requests are reviewed and must be
              approved before the card becomes usable. You may freeze or
              cancel your card at any time through your dashboard. Beltrust
              may decline a card request or suspend/cancel an issued card at
              its discretion if fraudulent or unauthorized activity is
              suspected.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">7. Loans</h2>
            <p className="text-muted">
              Loan applications submitted through the Services are subject to
              review and approval at Beltrust's sole discretion. Approval,
              interest rate, and terms offered may differ from the amount
              requested. Beltrust is under no obligation to approve any loan
              application.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">8. Cryptocurrency Services</h2>
            <p className="text-muted">
              Cryptocurrency prices are volatile and subject to significant
              fluctuation. All buy and sell orders submitted through the
              Services are reviewed prior to completion and may be declined
              at Beltrust's discretion. Beltrust does not guarantee the
              value, liquidity, or future performance of any digital asset
              made available through the Services. You acknowledge that
              cryptocurrency transactions carry inherent risk and that you
              are solely responsible for your trading decisions.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">9. Prohibited Uses</h2>
            <p className="text-muted">
              You agree not to use the Services for any unlawful purpose,
              including but not limited to money laundering, fraud, financing
              of illegal activity, or violation of applicable sanctions laws.
              Beltrust reserves the right to suspend or terminate any account
              suspected of violating this provision, and to report such
              activity to relevant authorities as required by law.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">10. Account Suspension & Termination</h2>
            <p className="text-muted">
              Beltrust may suspend, freeze, or close your account at its
              discretion, including in cases of suspected fraud, violation of
              these Terms, or as required by applicable law. You may close
              your account at any time by contacting support, provided all
              balances are settled.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">11. Limitation of Liability</h2>
            <p className="text-muted">
              To the maximum extent permitted by law, Beltrust shall not be
              liable for any indirect, incidental, special, or consequential
              damages arising from your use of the Services, including but
              not limited to loss of funds due to third-party actions,
              technical failures, or events beyond our reasonable control.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">12. Changes to These Terms</h2>
            <p className="text-muted">
              We may update these Terms from time to time. Material changes
              will be communicated to you via email or in-app notice prior to
              taking effect. Continued use of the Services after changes take
              effect constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">13. Contact</h2>
            <p className="text-muted">
              Questions about these Terms can be directed to{" "}
              <a href="mailto:beltrusts@outlook.com" className="text-navy hover:underline">
                beltrusts@outlook.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}