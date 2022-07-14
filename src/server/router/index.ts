// src/server/router/index.ts
import { newQuestionRouter } from "./subroutes/question";
import { t } from "./trpc";

export const appRouter = t.router({
  questions: newQuestionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
