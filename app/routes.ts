import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  // route("savings-calculator", "routes/savings-calculator.tsx"),
  route(
    "compound-interest-calculator",
    "routes/compound-interest-calculator.tsx",
  ),
  route(
    "savings-balance-over-time-calculator",
    "routes/savings-balance-over-time-calculator.tsx",
  ),
] satisfies RouteConfig;
