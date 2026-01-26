import * as React from "react";
import { Link } from "react-router";

export function SimplePageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm leading-relaxed text-slate-700">{subtitle}</p>
        ) : null}
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link className="text-slate-700 underline" to="/">
            Home
          </Link>
          <Link className="text-slate-700 underline" to="/privacy-policy">
            Privacy
          </Link>
          <Link className="text-slate-700 underline" to="/terms-of-service">
            Terms
          </Link>
          <Link className="text-slate-700 underline" to="/cookies-policy">
            Cookies
          </Link>
          <Link className="text-slate-700 underline" to="/contact">
            Contact
          </Link>
        </nav>
      </header>

      <main className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {children}
      </main>
    </div>
  );
}
