import * as React from "react";
import { Link, useLocation } from "react-router";
import logoSrc from "../../assets/images/logo.png";

type NavItem =
  | { kind: "route"; to: string; label: string }
  | { kind: "hash"; href: string; label: string };

const NAV_ITEMS: NavItem[] = [
  { kind: "route", to: "/savings-calculator", label: "Savings Calculator" },
  {
    kind: "route",
    to: "/compound-interest-calculator",
    label: "Compound Interest",
  },
  {
    kind: "route",
    to: "/savings-balance-over-time-calculator",
    label: "Savings Balance Over Time",
  },
  { kind: "hash", href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  // Close menu on ESC
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close mobile menu when the route changes
  React.useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="relative">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-3 sm:px-6 sm:py-4">
          {/* Left: Logo + Brand */}
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={logoSrc}
              alt="AllSavingsCalculators"
              className="h-9 w-9 shrink-0 rounded-md"
            />
            <span className="min-w-0 truncate text-base font-black tracking-tight text-slate-800 sm:text-xl">
              AllSavingsCalculators
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 sm:flex">
            {NAV_ITEMS.map((item) => {
              if (item.kind === "hash") {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-sm font-bold text-slate-800 transition-colors hover:text-slate-600 hover:opacity-80"
                  >
                    {item.label}
                  </a>
                );
              }

              const isActive =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "text-sm font-bold transition-colors hover:text-slate-600 hover:opacity-80",
                    isActive ? "text-slate-900" : "text-slate-800",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile burger */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-900 shadow-sm transition hover:bg-slate-50 sm:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-controls="mobile-nav"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <path
                    d="M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M4 7h16"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 12h16"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 17h16"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Backdrop */}
        {open && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-30 bg-black/25 sm:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Mobile dropdown panel (anchored, does not push content) */}
        <div
          id="mobile-nav"
          className={[
            "absolute left-0 right-0 z-40 sm:hidden",
            open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          ].join(" ")}
          style={{ top: "100%" }}
        >
          <div className="mx-auto max-w-6xl px-3 pb-3">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10">
              {NAV_ITEMS.map((item, idx) => {
                if (item.kind === "hash") {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={[
                        "flex items-center justify-between px-4 py-4 text-sm font-bold text-slate-900 transition hover:bg-slate-50",
                        idx !== 0 ? "border-t border-slate-200" : "",
                      ].join(" ")}
                    >
                      {item.label}
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="text-slate-400"
                      >
                        <path
                          d="M9 18l6-6-6-6"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  );
                }

                const isActive =
                  item.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={[
                      "flex items-center justify-between px-4 py-4 text-sm font-bold transition hover:bg-slate-50",
                      idx !== 0 ? "border-t border-slate-200" : "",
                      isActive ? "text-slate-900" : "text-slate-900",
                    ].join(" ")}
                  >
                    {item.label}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="text-slate-400"
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
