import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const filesRouter = createTRPCRouter({
  write: publicProcedure
    .input(
      z.object({
        needtofill: z.string(),
      }),
    )
    .query(({ input }) => {
      return {
        response: input.needtofill,
      };
    }),
});
