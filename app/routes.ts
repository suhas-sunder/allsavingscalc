import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route(
    "compound-interest-calculator",
    "routes/compound-interest-calculator.tsx",
  ),
  route(
    "savings-balance-over-time-calculator",
    "routes/savings-balance-over-time-calculator.tsx",
  ),
  route("savings-calculator", "routes/savings-calculator.tsx"),
  route("cookies-policy", "routes/cookies-policy.tsx"),
  route("privacy-policy", "routes/privacy-policy.tsx"),
  route("terms-of-service", "routes/terms-of-service.tsx"),
  route("contact", "routes/contact.tsx"),
] satisfies RouteConfig;
