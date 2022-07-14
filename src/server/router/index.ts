// src/server/router/index.ts
import { createRouter } from "./utils/context";
import { questionRouter } from "./subroutes/question";
import { t } from "./trpc";

const legacyAppRouter = createRouter()
  .merge("questions.", questionRouter)
  .interop();

const greetingRouter = t.router({
  greeting: t.procedure.query(() => "world"),
});

export const appRouter = t.mergeRouters(legacyAppRouter, greetingRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
