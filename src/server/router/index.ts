// src/server/router/index.ts
import { t } from "./trpc";

import { newQuestionRouter } from "./subroutes/question";
import { userRouter } from "./subroutes/user";

export const appRouter = t.router({
  questions: newQuestionRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
