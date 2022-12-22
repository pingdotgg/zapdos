import { unstable_getServerSession } from "next-auth";

import type { GetServerSidePropsContext } from "next/types";

import { getZapdosAuthSession } from "../../server/common/get-server-session";
import { authOptions } from "../api/auth/[...nextauth]";
import { prisma } from "../../server/db/client";

const ModView = (props: { channels?: any }) => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <h1>Congrats, you moderate this channel.</h1>
    </div>
  );
};

export default ModView;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const username = context.params?.username;
  if (!username || typeof username !== "string") return { notFound: true };

  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );
  if (!session) return { notFound: true };

  const channels = await prisma.user.findMany({
    where: {
      ModList: {
        has: session!.user?.name,
      },
    },
    select: {
      name: true,
    },
  });

  if (!channels || !channels.find((c) => c.name === username))
    return { notFound: true };

  return {
    props: {
      session: await getZapdosAuthSession(context),
    },
  };
};
