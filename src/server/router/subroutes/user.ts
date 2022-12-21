import { TRPCError } from "@trpc/server";

import { t } from "../trpc";
import { protectedProcedure } from "../utils/protected-procedure";

export const userRouter = t.router({

  getModeratedChannels: protectedProcedure.query(async ({ ctx }) => {
    const res = await fetch(`https://modlookup.3v.fi/api/user-v3/${ctx.session.user.name}?limit=2000`).then((r) => r.json());

    if (!res.channels){
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error fetching moderated channels",
      });
    }

    return res.channels as {name: string}[];
  })
});