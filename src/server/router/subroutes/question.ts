import { createRouter } from "../utils/context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import PusherServer from "pusher";
import { env } from "../../env";
import { t } from "../trpc";
import { protectedProcedure } from "../utils/protected-procedure";

const pusherServerClient = new PusherServer({
  appId: env.PUSHER_APP_ID!,
  key: env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: env.PUSHER_APP_SECRET!,
  cluster: env.PUSHER_APP_CLUSTER!,
});

export const newQuestionRouter = t.router({
  submit: t.procedure
    .input(
      z.object({
        userId: z.string(),
        question: z.string().min(0).max(400),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const question = await ctx.prisma.question.create({
        data: {
          userId: input.userId,
          body: input.question,
        },
      });

      return question;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const questions = await ctx.prisma.question.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: { id: "desc" },
    });

    return questions;
  }),

  pin: protectedProcedure
    .input(z.object({ questionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const question = await ctx.prisma.question.findFirst({
        where: { id: input.questionId },
      });
      if (!question || question.userId !== ctx.session.user.id) {
        throw new TRPCError({
          message: "NOT YOUR QUESTION",
          code: "UNAUTHORIZED",
        });
      }

      await pusherServerClient.trigger(
        `user-${question.userId}`,
        "question-pinned",
        {
          question: question.body,
        }
      );
      return question;
    }),

  unpin: protectedProcedure.mutation(async ({ ctx }) => {
    await pusherServerClient.trigger(
      `user-${ctx.session.user?.id}`,
      "question-unpinned",
      {}
    );
  }),
});
