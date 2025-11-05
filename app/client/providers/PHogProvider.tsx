import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

export function PHogProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    posthog.init("phc_bM7udiE9SpQQnyERjIjmXBMGHaaesURgTEfdjLD0GBZ", {
      api_host: "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
    });

    setHydrated(true);
  }, []);

  if (!hydrated) return <>{children}</>;
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
