import * as React from "react";
import { Link } from "react-router";

const LEGAL_LINKS: Array<{ to: string; label: string }> = [
  { to: "/privacy-policy", label: "Privacy" },
  { to: "/terms-of-service", label: "Terms" },
  { to: "/cookies-policy", label: "Cookies" },
  { to: "/contact", label: "Contact" },
];

function FooterRouteLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="rounded-md text-sm font-semibold text-white underline-offset-4 transition hover:text-sky-300 hover:underline focus:outline-none focus:ring-2 focus:ring-sky-300"
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="mt-10 w-full border-t border-sky-200 bg-sky-950">
      <div className="mx-auto max-w-6xl px-3 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="text-base font-black tracking-tight text-white">
              AllSavingsCalculators
              <span className="text-sky-200">.com</span>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-sky-50">
              Fast, straightforward savings calculators that show how balances
              change over time, including interest, contributions, taxes, and
              inflation, with clear assumptions and detailed breakdowns.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-wide text-sky-200">
              Site
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <FooterRouteLink key={l.to} to={l.to}>
                  {l.label}
                </FooterRouteLink>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-sky-200 pt-4 text-xs text-sky-200 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} AllSavingsCalculators</div>
          <div className="leading-relaxed">
            Estimates only. For informational purposes. Not financial advice.
          </div>
        </div>
      </div>
    </footer>
  );
}
