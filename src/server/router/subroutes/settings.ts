import { z } from "zod";

import { t } from "../trpc";
import { protectedProcedure } from "../utils/protected-procedure";

export const SettingsRouter = t.router({
  getLoginRequired: t.procedure
    .input(
      z.object({
        userId: z.string(),
        username: z.string(),
      })
        .partial()
        .refine(
          data => !!data.userId || !!data.username,
          "userId or username must be provided"
        )
    )
    .query(async ({ ctx, input }) => {
      const selector = !!input.userId
        ? { id: input.userId }
        : { name: input.username };

      const settings = await ctx.prisma.settings.findFirst({
        where: {
          user: selector,
        }
      });

      if (!settings) {
        return false;
      }

      return settings.requiresLogin;
    }),

  setRequiresLogin: protectedProcedure
    .input(
      z.object({
        loginRequired: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return await ctx.prisma.settings.upsert({
        create: {
          requiresLogin: input.loginRequired,
          user: {
            connect: {
              id: userId,
            }
          }
        },
        update: {
          requiresLogin: input.loginRequired,
        },
        where: {
          userId: userId,
        }
      });
    })
});
