import { GetServerSidePropsContext } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../../pages/api/auth/[...nextauth]";

export const getZapdosAuthSession = async (ctx: GetServerSidePropsContext) => {
  return await unstable_getServerSession(ctx.req, ctx.res, nextAuthOptions);
};
