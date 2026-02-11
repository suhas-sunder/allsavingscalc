import * as React from "react";

type MathBlockProps = {
  /**
   * A human-readable LaTeX string for accessibility and copy/paste.
   * This is NOT rendered as KaTeX; it is used as a label + fallback.
   */
  latex: string;

  /**
   * MathML markup to render. MathML is supported by modern browsers and requires no dependencies.
   * Keep this minimal and semantic for best cross-browser rendering.
   */
  mathml: React.ReactNode;

  /**
   * Optional caption rendered below the equation (plain text).
   */
  caption?: string;
};

export function MathBlock({ latex, mathml, caption }: MathBlockProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <div className="overflow-x-auto p-4">
        <div
          className="min-w-max"
          aria-label={latex}
          role="img"
        >
          {mathml}
        </div>
      </div>

      {caption ? (
        <div className="border-t border-slate-200 px-4 py-3 text-sm text-sky-700">
          {caption}
        </div>
      ) : null}

      {/* Fallback LaTeX (visible only when MathML is not rendered well).
          Kept lightweight and non-invasive. */}
      <div className="sr-only">{latex}</div>
    </div>
  );
}
