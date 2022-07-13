import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const questionRouter = createRouter()
  .query("get-my-questions", {
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
  })
  .query("get-user-metadata", {
    input: z.object({ userId: z.string() }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.user.findFirst({ where: { id: input.userId } });
    },
  })
  .mutation("submit-question", {
    input: z.object({
      userId: z.string(),

      question: z.string().min(0).max(400),
    }),
    async resolve({ ctx, input }) {
      const question = await ctx.prisma.question.create({
        data: {
          userId: input.userId,
          body: input.question,
        },
      });

      return question;
    },
  });
