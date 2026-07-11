import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Accounts", href: "/#accounts" },
    { label: "Cards", href: "/#cards" },
    { label: "Loans", href: "/#loans" },
    { label: "Crypto", href: "/#crypto" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Security", href: "/security" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-navy flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-background" strokeWidth={2.25} />
              </div>
              <span className="font-display font-bold text-base tracking-tight text-ink">
                Beltrust
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              Banking built on trust — accounts, cards, loans, and crypto,
              all in one secure place.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-ink mb-4">{heading}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-ink transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Beltrust Bank. All rights reserved.
          </p>
          <p className="text-xs text-muted">
            Member FDIC-eligible partner banks · Equal Housing Lender
          </p>
        </div>
      </div>
    </footer>
  );
}