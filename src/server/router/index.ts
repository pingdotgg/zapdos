// src/server/router/index.ts
import { createRouter } from "./utils/context";
import { legacyQuestionRouter, newQuestionRouter } from "./subroutes/question";
import { t } from "./trpc";

const legacyAppRouter = createRouter()
  .merge("questions.", legacyQuestionRouter)
  .interop();

const primaryRouter = t.router({
  questions: newQuestionRouter,
});

export const appRouter = t.mergeRouters(legacyAppRouter, primaryRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
