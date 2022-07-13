import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const questionRouter = createRouter().query("get-my-questions", {
  async resolve({ ctx }) {
    if (!ctx.session || !ctx.session.user?.id) {
      throw new TRPCError({
        message: "You are not signed in",
        code: "UNAUTHORIZED",
      });
    }

    const questions = await ctx.prisma.question.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });

    return questions;
  },
});
