import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { getZapdosAuthSession } from "../../common/get-server-session";
import { prisma } from "../../db/client";

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const req = opts?.req;
  const res = opts?.res;

  const session = req && res && (await getZapdosAuthSession({ req, res }));

  return { session, prisma };
}
export type Context = trpc.inferAsyncReturnType<typeof createContext>;
