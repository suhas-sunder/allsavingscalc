import * as React from "react";

type MathBlockProps = {
  /**
   * A readable LaTeX string (for labeling and copy/paste). This is not rendered as KaTeX.
   */
  latex: string;

  /**
   * MathML markup to render. No dependencies required.
   */
  mathml: React.ReactNode;

  /**
   * Optional caption rendered below the equation.
   */
  caption?: string;
};

export function MathBlock({ latex, mathml, caption }: MathBlockProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto p-3">
        <div className="min-w-max" aria-label={latex} role="img">
          {mathml}
        </div>
      </div>

      {caption ? (
        <div className="border-t border-slate-200 px-3 py-2 text-sm text-slate-700">
          {caption}
        </div>
      ) : null}

      <div className="sr-only">{latex}</div>
    </div>
  );
}
