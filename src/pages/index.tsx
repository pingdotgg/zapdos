import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { getZapdosAuthSession } from "../server/common/get-server-session";
import Background from "../assets/background.svg";
import {
  FaArrowCircleRight,
  FaCaretSquareRight,
  FaCopy,
  FaSignOutAlt,
  FaSortAlphaDown,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSortNumericDown,
  FaTrash,
  FaTwitch,
} from "react-icons/fa";
import dynamic from "next/dynamic";

import { trpc } from "../utils/trpc";

import { FaEye, FaEyeSlash, FaArchive } from "react-icons/fa";
import {
  PusherProvider,
  useCurrentMemberCount,
  useSubscribeToEvent,
} from "../utils/pusher";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import LoadingSVG from "../assets/puff.svg";
import Image from "next/image";
import { PropsWithChildren, useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Card } from "../components/card";
import { AutoAnimate } from "../components/auto-animate";
import clsx from "clsx";

const QuestionsView = () => {
  const { data, isLoading, refetch } = trpc.proxy.questions.getAll.useQuery();
  // Refetch when new questions come through
  useSubscribeToEvent("new-question", () => refetch());

  const connectionCount = useCurrentMemberCount() - 1;
  const [reverseSort, setReverseSort] = useState(false);

  // Question pinning mutation
  const {
    mutate: pinQuestion,
    variables: currentlyPinned, // The "variables" passed are the currently pinned Q
    reset: resetPinnedQuestionMutation, // The reset allows for "unpinning" on client
  } = trpc.proxy.questions.pin.useMutation();
  const pinnedId = currentlyPinned?.questionId;

  const { mutate: unpinQuestion } = trpc.proxy.questions.unpin.useMutation({
    onMutate: () => {
      resetPinnedQuestionMutation(); // Reset variables from mutation to "unpin"
    },
  });

  const tctx = trpc.useContext();
  const { mutate: removeQuestion } = trpc.proxy.questions.archive.useMutation({
    onMutate: ({ questionId }) => {
      // Optimistic update
      tctx.queryClient.setQueryData(
        ["questions.getAll", null],
        data?.filter((q) => q.id !== questionId)
      );
    },
  });

  if (isLoading)
    return (
      <div className="flex animate-fade-in-delay justify-center p-8">
        <Image src={LoadingSVG} alt="loading..." width={200} height={200} />
      </div>
    );

  const selectedQuestion = data?.find((q) => q.id === pinnedId);
  const otherQuestions = data?.filter((q) => q.id !== pinnedId) || [];

  return (
    <div className="grid min-h-0 flex-1 grid-cols-3">
      <div className="col-span-2 flex py-4 pl-6 pr-3">
        <Card className="flex flex-1 flex-col divide-y divide-gray-800">
          <AutoAnimate className="flex flex-1 items-center justify-center p-4 text-lg font-medium">
            <span key={selectedQuestion?.id}>{selectedQuestion?.body}</span>
          </AutoAnimate>
          <div className="grid grid-cols-2 divide-x divide-gray-800">
            <button
              className="flex items-center justify-center gap-2 rounded-bl p-4 hover:bg-gray-700"
              onClick={() => unpinQuestion()}
            >
              <FaEyeSlash /> Hide
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-br p-4 hover:bg-gray-700"
              onClick={() => {
                if (selectedQuestion)
                  removeQuestion({ questionId: selectedQuestion.id });
                const next = otherQuestions[0]?.id;
                if (next) pinQuestion({ questionId: next });
              }}
            >
              <FaCaretSquareRight />
              Next Question
            </button>
          </div>
        </Card>
      </div>
      <div className="col-span-1 flex flex-col gap-4 overflow-y-auto py-4 pl-3 pr-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 font-medium">
            <span>Questions</span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-xs font-extrabold">
              {otherQuestions.length}
            </span>
          </h2>
          <button
            className="relative z-10 -my-2 flex items-center gap-1.5 rounded py-2 px-2 text-sm hover:bg-gray-900/50 hover:text-white"
            onClick={() => setReverseSort(!reverseSort)}
          >
            {reverseSort ? <FaSortAmountUp /> : <FaSortAmountDown />}
          </button>
        </div>
        <AutoAnimate
          className={clsx(
            "flex gap-4",
            reverseSort ? "flex-col-reverse" : "flex-col"
          )}
        >
          {otherQuestions.map((q) => (
            <Card
              key={q.id}
              className="relative flex animate-fade-in-down flex-col gap-4 p-4"
            >
              <div className="break-words">{q.body}</div>
              <div className="flex items-center justify-between text-gray-300">
                <div className="text-sm">{dayjs(q.createdAt).fromNow()}</div>
                <button
                  className="relative z-10 -my-1 -mx-2 flex items-center gap-1.5 rounded py-1 px-2 text-sm hover:bg-gray-900/50 hover:text-white"
                  onClick={() => removeQuestion({ questionId: q.id })}
                >
                  <FaTrash />
                  <span>Remove</span>
                </button>
              </div>
              <button
                className="absolute inset-0 z-0 flex items-center justify-center bg-gray-900/75 opacity-0 transition-opacity hover:opacity-100"
                onClick={() => pinQuestion({ questionId: q.id })}
              >
                <span className="flex items-center gap-1.5">
                  <FaEye />
                  Show question
                </span>
              </button>
            </Card>
          ))}
        </AutoAnimate>
      </div>
    </div>
  );
};

function QuestionsViewWrapper() {
  const { data: sesh } = useSession();

  if (!sesh || !sesh.user?.id) return null;

  return (
    <PusherProvider slug={`user-${sesh.user?.id}`}>
      <QuestionsView />
    </PusherProvider>
  );
}

const LazyQuestionsView = dynamic(() => Promise.resolve(QuestionsViewWrapper), {
  ssr: false,
});

const copyUrlToClipboard = (path: string) => () => {
  if (!process.browser) return;
  navigator.clipboard.writeText(`${window.location.origin}${path}`);
};

const NavButtons: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: sesh } = useSession();

  return (
    <div className="flex gap-2">
      <button
        onClick={copyUrlToClipboard(`/embed/${userId}`)}
        className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100"
      >
        Copy embed url <FaCopy size={24} />
      </button>
      <button
        onClick={copyUrlToClipboard(`/ask/${sesh?.user?.name?.toLowerCase()}`)}
        className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100"
      >
        Copy Q&A url <FaCopy size={24} />
      </button>
      <button
        onClick={() => signOut()}
        className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100"
      >
        Logout <FaSignOutAlt size={24} />
      </button>
    </div>
  );
};

const HomeContents = () => {
  const { data } = useSession();

  if (!data)
    return (
      <div className="flex grow flex-col items-center justify-center p-4">
        <div className="relative mb-8 text-8xl font-bold">
          Ping Ask{" "}
          <sup className="absolute top-0 left-full text-base text-pink-400">
            [BETA]
          </sup>
        </div>
        <div className="prose max-w-prose text-2xl">
          An easy way to curate questions from your audience and embed them in
          your OBS.
        </div>
        <div className="p-4" />
        <button
          onClick={() => signIn("twitch")}
          className="flex items-center gap-2 rounded bg-gray-200 px-4 py-2 text-2xl text-black"
        >
          <span>Sign in with Twitch</span>
          <FaTwitch />
        </button>
      </div>
    );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between bg-gray-900 py-4 px-8 shadow">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          {data.user?.image && (
            <img
              src={data.user?.image}
              alt="pro pic"
              className="w-16 rounded-full"
            />
          )}
          {data.user?.name}
        </h1>
        <NavButtons userId={data.user?.id!} />
      </div>
      <LazyQuestionsView />
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>{"Stream Q&A Tool"}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className="relative flex h-screen w-screen flex-col justify-between bg-landing"
        style={{ backgroundImage: `url(${Background.src})` }}
      >
        <HomeContents />
        <div className="flex justify-between py-4 px-8">
          <span>
            Made with &hearts; by{" "}
            <a
              href="https://ping.gg"
              className="font-bold text-pink-300 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Ping.gg
            </a>
          </span>
          <div className="flex gap-4">
            <a
              href="https://github.com/t3-oss/zapdos"
              className="font-bold text-pink-300 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Github
            </a>
            <a
              href="https://ping.gg/discord"
              className="font-bold text-pink-300 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Discord
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: {
      session: await getZapdosAuthSession(ctx),
    },
  };
};

export default Home;
