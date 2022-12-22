import { t } from "../trpc";
import { protectedProcedure } from "../utils/protected-procedure";

export const userRouter = t.router({
  getModeratedChannels: protectedProcedure.query(async ({ ctx }) => {
    const channels = await ctx.prisma.user.findMany({
      where: {
        ModList: {
          has: ctx.session.user.name,
        },
      },
      select: {
        name: true,
      },
    });

    return channels;
  }),
});
