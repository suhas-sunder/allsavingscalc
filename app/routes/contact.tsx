import type { Route } from "./+types/contact";
import { SimplePageShell } from "~/client/components/legal/simple-page-shell";

export function meta({ data }: Route.MetaArgs) {
  const canonical = data?.canonical ?? "https://www.allsavingscalculators.com/";
  const title = "Contact | AllSavingsCalculators";
  const description =
    "Contact AllSavingsCalculators for feedback, corrections, or partnership inquiries. No account required.";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index,follow" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { tagName: "link", rel: "canonical", href: canonical },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    { property: "og:site_name", content: "AllSavingsCalculators" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:url", content: canonical },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { canonicalFromRequest } = await import(
    "~/client/components/home/site-url.server"
  );
  return { canonical: canonicalFromRequest(request.url) };
}

export default function Contact() {
  return (
    <SimplePageShell
      title="Contact"
      subtitle="Send feedback, report an issue, or request a new calculator. We read everything."
    >
      <div className="space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          AllSavingsCalculators is a collection of finance utilities designed to
          be fast, mobile-friendly, and transparent about assumptions. If you
          notice a bug, a confusing label, or a calculation edge case, please
          email us with a short description and the input values you used.
        </p>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-black uppercase tracking-wide text-slate-700">
            Email
          </div>
          <div className="mt-1">
            <a
              className="break-all font-semibold text-slate-900 underline"
              href="mailto:contact@allsavingscalculators.com"
            >
              contact@allsavingscalculators.com
            </a>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            Please do not send sensitive personal information. If you are
            contacting us about a specific calculation, include the tool name,
            the inputs, and what you expected to see.
          </p>
        </div>

        <h2 className="text-base font-black text-slate-900">
          What we can help with
        </h2>
        <ul className="ml-5 list-disc space-y-2">
          <li>Calculation questions and interpretation of results</li>
          <li>Bug reports and edge-case inputs</li>
          <li>Requests for new tools or features</li>
          <li>Content corrections (definitions, assumptions, examples)</li>
        </ul>

        <h2 className="text-base font-black text-slate-900">
          About ads and cookies
        </h2>
        <p>
          This site may show ads and use cookies for measurement and relevance.
          You can read more in our Cookies Policy and Privacy Policy.
        </p>
      </div>
    </SimplePageShell>
  );
}
