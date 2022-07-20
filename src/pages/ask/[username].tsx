import {
  GetServerSidePropsContext,
  GetStaticProps,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { prisma } from "../../server/db/client";
import type { User } from "@prisma/client";
import { signIn, signOut, useSession } from "next-auth/react";
import { FaTwitch } from "react-icons/fa";

const InputForm: React.FC<{
  userId: string;
  requiresLogin: boolean;
}> = ({ userId, requiresLogin }) => {
  const { mutate } = trpc.proxy.questions.submit.useMutation();
  const [question, setQuestion] = useState("");

  const { data: session } = useSession();

  if (requiresLogin && !session) {
    return (
      <div className="flex grow flex-col items-center justify-center">
        <div className="text-lg font-medium">You must login to ask a question</div>
        <div className="p-1" />
        <button
          onClick={() => signIn("twitch")}
          className="flex items-center gap-2 rounded bg-gray-200 py-2 px-8 font-bold text-gray-800 hover:bg-gray-100"
        >
          <span>Sign in with Twitch</span>
          <FaTwitch />
        </button>
      </div>
    )
  }

  return (
    <>
      <input
        placeholder="Type something..."
        className="w-full rounded px-2 py-1 text-center text-lg text-gray-800"
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <div className="p-4 flex gap-2">
        <button
          className="flex items-center rounded bg-gray-200 py-2 px-8 font-bold text-gray-800 hover:bg-gray-100"
          onClick={() => {
            if (!question) return;

            mutate({ userId, question });

            setQuestion("");
          }}
        >
          Submit
        </button>

        {
          requiresLogin && <button
            onClick={() => signOut()}
            className="flex items-center rounded border-2 border-gray-200 py-2 px-8 font-bold text-gray-200 hover:bg-gray-100 hover:text-gray-800"
          >
            Logout
          </button>
        }
      </div>
    </>
  )
}

const AskForm = (props: { user: User, requiresLogin: boolean }) => {
  if (!props.user) throw new Error("user exists Next, sorry");

  return (
    <>
      <Head>
        <title>{`Ask ${props.user?.name} a question!`}</title>
      </Head>
      <div className="flex flex-col items-center text-center">
        <div className="p-14" />
        <div className="flex w-full max-w-lg flex-col items-center rounded border border-gray-500 bg-gray-600 p-8">
          {props.user.image && (
            <img
              src={props.user.image}
              className="fixed top-14 h-28 w-28 rounded-full border-4 border-gray-500"
              alt="Pro pic"
            />
          )}
          <div className="p-4" />
          <h1 className="text-2xl font-bold">
            Ask {props.user?.name} a question!
          </h1>
          <div className="p-4" />
          <InputForm userId={props.user.id} requiresLogin={props.requiresLogin} />
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params || !params.username || typeof params.username !== "string") {
    return {
      notFound: true,
    };
  }
  const twitchName = params.username.toLowerCase();

  const userInfo = await prisma.user.findFirst({
    where: { name: { equals: twitchName, mode: "insensitive" } },
  });

  if (!userInfo) {
    return {
      notFound: true,
    };
  }

  const setting = await prisma.settings.findFirst({
    where: { userId: userInfo.id },
    select: { requiresLogin: true },
  })

  // If setting is not found, fallback to login not required
  const requiresLogin = setting?.requiresLogin ?? false;

  return { props: { user: userInfo, requiresLogin }, revalidate: 60 };
};

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export default AskForm;
