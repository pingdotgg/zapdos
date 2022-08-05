import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { t } from "../trpc";
import { protectedProcedure } from "../utils/protected-procedure";
import { pusherServerClient } from "../../common/pusher";

export const newQuestionRouter = t.router({
  submit: t.procedure
    .input(
      z.object({
        userId: z.string(),
        question: z.string().min(0).max(400),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const setting = await ctx.prisma.settings.findFirst({
        where: { userId: input.userId },
        select: { requiresLogin: true },
      })
    
      // If setting is not found, fallback to login not required
      const requiresLogin = setting?.requiresLogin ?? false;

      if (requiresLogin) {
        if (!ctx.session || !ctx.session.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
      }

      const question = await ctx.prisma.question.create({
        data: {
          userId: input.userId,
          body: input.question,
          authorId: ctx.session?.user?.id,
        },
      });

      await pusherServerClient.trigger(
        `user-${input.userId}`,
        "new-question",
        {}
      );

      return question;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const questions = await ctx.prisma.question.findMany({
      select: {
        id: true,
        body: true,
        createdAt: true,
        status: true,
        userId: true,
        authorId: true,

        author: {
          select: {
            name: true,
          }
        }
      },
      where: {
        userId: ctx.session.user.id,
        status: "PENDING",
      },
      orderBy: { id: "asc" },
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

  archive: protectedProcedure
    .input(z.object({ questionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.question.updateMany({
        where: { id: input.questionId, userId: ctx.session.user.id },
        data: {
          status: "ANSWERED",
        },
      });
    }),

  unpin: protectedProcedure.mutation(async ({ ctx }) => {
    await pusherServerClient.trigger(
      `user-${ctx.session.user?.id}`,
      "question-unpinned",
      {}
    );
  }),
});
