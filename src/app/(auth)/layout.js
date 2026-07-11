import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-6 lg:px-8 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-background" strokeWidth={2.25} />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-ink">
            Beltrust
          </span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  );
}