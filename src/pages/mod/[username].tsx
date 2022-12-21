import { unstable_getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import type { GetServerSidePropsContext } from "next/types";
import { getZapdosAuthSession } from "../../server/common/get-server-session";
import { trpc } from "../../utils/trpc";
import { authOptions } from "../api/auth/[...nextauth]";


const ModView = (props: {channels?: any}) => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
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

  const {channels} = await fetch(`https://modlookup.3v.fi/api/user-v3/${session.user?.name}?limit=2000`).then((r) => r.json()) as {channels: {name: string}[]};

  if (!channels || !channels.find(c=>c.name === username)) return { notFound: true };

  return {
    props: {
      session: await getZapdosAuthSession(context),
    }
  }


}