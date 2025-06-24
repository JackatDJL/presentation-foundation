// api/webhook/polar/route.ts
import { Webhooks } from "@polar-sh/nextjs";
import { env } from "~/env";

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  onPayload: async (payload) => {
    // Handle the payload
    // No need to return an acknowledge response
  },
});
