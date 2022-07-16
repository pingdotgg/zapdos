// src/server/router/index.ts
import { newQuestionRouter } from "./subroutes/question";
import { SettingsRouter } from "./subroutes/settings";
import { t } from "./trpc";

export const appRouter = t.router({
  questions: newQuestionRouter,
  settings: SettingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
