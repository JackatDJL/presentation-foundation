// portal/route.ts
import { CustomerPortal } from "@polar-sh/nextjs";
import { type NextRequest } from "next/server";
import { env } from "~/env";

export const GET = CustomerPortal({
  accessToken: env.POLAR_ACCESS_TOKEN,
  getCustomerId: (req: NextRequest) => Promise.resolve(""),
  server: "sandbox", // Use sandbox if you're testing Polar - omit the parameter or pass 'production' otherwise
});
