import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { Session } from "next-auth";
import { getZapdosAuthSession } from "../../common/get-server-session";
import { prisma } from "../../db/client";
interface CreateContextOptions {
  session: Session | null;
  prisma: typeof prisma;
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(opts: CreateContextOptions) {
  return { session: opts.session, prisma };
}

export type Context = trpc.inferAsyncReturnType<typeof createContextInner>;

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(
  opts: trpcNext.CreateNextContextOptions
): Promise<Context> {
  // for API-response caching see https://trpc.io/docs/caching

  const req = opts?.req;
  const res = opts?.res;

  const session = req && res && (await getZapdosAuthSession({ req, res }));

  return await createContextInner({ session, prisma });
}
