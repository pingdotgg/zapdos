import { createRouter } from "../utils/context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import PusherServer from "pusher";
import { env } from "../../env";
import { createProtectedRouter } from "../utils/protected-router";

const pusherServerClient = new PusherServer({
  appId: env.PUSHER_APP_ID!,
  key: env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: env.PUSHER_APP_SECRET!,
  cluster: env.PUSHER_APP_CLUSTER!,
});

const publicQuestionRouter = createRouter().mutation("submit-question", {
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

const privateQuestionRouter = createProtectedRouter()
  .query("get-my-questions", {
    async resolve({ ctx }) {
      const questions = await ctx.prisma.question.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        orderBy: { id: "desc" },
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
  .mutation("pin-question", {
    input: z.object({ questionId: z.string() }),
    async resolve({ ctx, input }) {
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
    },
  })
  .mutation("unpin-question", {
    async resolve({ ctx }) {
      await pusherServerClient.trigger(
        `user-${ctx.session.user?.id}`,
        "question-unpinned",
        {}
      );
    },
  });

export const questionRouter = createRouter()
  .merge(publicQuestionRouter)
  .merge(privateQuestionRouter);
