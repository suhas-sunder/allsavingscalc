import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "react-router";

export function loader({ request }: LoaderFunctionArgs) {
  return redirect("/", { status: 301 });
}
