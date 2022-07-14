// src/server/router/index.ts
import { createRouter } from "./utils/context";
import superjson from "superjson";

import { questionRouter } from "./subroutes/question";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("questions.", questionRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
