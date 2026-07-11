export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="mb-12">
          <span className="text-xs font-semibold tracking-wide text-emerald uppercase">
            Legal
          </span>
          <h1 className="mt-3 font-display font-extrabold text-4xl tracking-tight text-ink leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-muted">Last updated: July 2026</p>
        </div>

        <div className="space-y-8 text-sm text-ink leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">1. Introduction</h2>
            <p className="text-muted">
              This Privacy Policy explains how Beltrust Bank ("Beltrust,"
              "we," "us") collects, uses, shares, and protects your personal
              information when you use our website, mobile applications, and
              banking services (the "Services").
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">2. Information We Collect</h2>
            <p className="text-muted mb-3">We collect the following categories of information:</p>
            <ul className="list-disc list-inside space-y-2 text-muted">
              <li><span className="text-ink font-medium">Identity information</span> — name, date of birth, government-issued ID, and identity verification documents.</li>
              <li><span className="text-ink font-medium">Contact information</span> — email address, phone number, and mailing address.</li>
              <li><span className="text-ink font-medium">Financial information</span> — account balances, transaction history, card details, and loan application data.</li>
              <li><span className="text-ink font-medium">Device and usage information</span> — IP address, browser type, device identifiers, and activity logs collected automatically when you use the Services.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">3. How We Use Your Information</h2>
            <p className="text-muted mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted">
              <li>Open, maintain, and service your account</li>
              <li>Process transactions, transfers, and payments</li>
              <li>Verify your identity and comply with legal and regulatory obligations, including anti-money laundering (AML) and know-your-customer (KYC) requirements</li>
              <li>Detect, investigate, and prevent fraud and unauthorized activity</li>
              <li>Communicate with you about your account, including security alerts and service updates</li>
              <li>Improve and personalize the Services</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">4. How We Share Your Information</h2>
            <p className="text-muted mb-3">
              We do not sell your personal information. We may share your
              information with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted">
              <li>Service providers who perform functions on our behalf, such as identity verification, cloud hosting, and email delivery, under contractual confidentiality obligations</li>
              <li>Regulators, law enforcement, or other parties when required by law, subpoena, or legal process</li>
              <li>Other financial institutions when necessary to complete a transaction you've initiated, such as an external bank transfer</li>
              <li>Successors in the event of a merger, acquisition, or sale of assets, subject to the same privacy commitments described here</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">5. Data Security</h2>
            <p className="text-muted">
              We use industry-standard security measures, including
              encryption in transit and at rest, access controls, and
              continuous monitoring, to protect your information. However, no
              method of transmission or storage is completely secure, and we
              cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">6. Data Retention</h2>
            <p className="text-muted">
              We retain your information for as long as your account is
              active and for a period afterward as required to comply with
              legal, tax, and regulatory recordkeeping obligations typical of
              financial institutions.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">7. Your Rights</h2>
            <p className="text-muted">
              Depending on your jurisdiction, you may have the right to
              access, correct, or request deletion of your personal
              information, subject to our legal and regulatory obligations to
              retain certain financial records. To exercise these rights,
              contact us at{" "}
              <a href="mailto:support@beltrustbank.com" className="text-navy hover:underline">
                support@beltrustbank.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">8. Cookies & Tracking</h2>
            <p className="text-muted">
              We use cookies and similar technologies to keep you signed in,
              remember your preferences, and understand how the Services are
              used. You can control cookie settings through your browser,
              though disabling certain cookies may affect functionality.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">9. Children's Privacy</h2>
            <p className="text-muted">
              The Services are not directed to individuals under the age of
              18, and we do not knowingly collect personal information from
              children.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">10. Changes to This Policy</h2>
            <p className="text-muted">
              We may update this Privacy Policy from time to time. Material
              changes will be communicated to you via email or in-app notice
              prior to taking effect.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg text-ink mb-3">11. Contact Us</h2>
            <p className="text-muted">
              Questions about this Privacy Policy can be directed to{" "}
              <a href="mailto:support@beltrustbank.com" className="text-navy hover:underline">
                support@beltrustbank.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}