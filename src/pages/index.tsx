import { PropsWithChildren, useEffect, useState } from "react";
import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import dynamic from "next/dynamic";
import { signIn, signOut, useSession } from "next-auth/react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import { useAutoAnimate } from "@formkit/auto-animate/react";
import clsx from "clsx";

import {
  FaCaretSquareRight,
  FaCopy,
  FaSignOutAlt,
  FaSortAlphaDown,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSortNumericDown,
  FaTrash,
  FaTwitch,
  FaWindowRestore,
  FaQuestionCircle,
  FaEye,
  FaEyeSlash,
  FaArchive,
} from "react-icons/fa";

import { getZapdosAuthSession } from "../server/common/get-server-session";

import Background from "../assets/background.svg";
import LoadingSVG from "../assets/puff.svg";

import { Button } from "../components/button";
import { Card } from "../components/card";
import { AutoAnimate } from "../components/auto-animate";

import {
  PusherProvider,
  useCurrentMemberCount,
  useSubscribeToEvent,
} from "../utils/pusher";
import { trpc } from "../utils/trpc";

const QuestionsView = () => {
  const { data: sesh } = useSession();
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

  const otherQuestionsSorted = reverseSort
    ? [...otherQuestions].reverse()
    : otherQuestions;

  return (
    <div className="grid min-h-0 flex-1 grid-rows-3 gap-4 p-4 sm:grid-cols-3 sm:grid-rows-1 sm:gap-8 sm:p-8">
      <div className="row-span-1 flex sm:col-span-2">
        <Card className="flex flex-1 flex-col divide-y divide-gray-750">
          <div className="flex flex-1 flex-col p-4">
            <div className="flex flex-1 flex-col">
              <div className="flex items-baseline justify-between">
                <h2 className="font-bold">Active Question</h2>
                <Button
                  className="-m-2 !p-2"
                  onClick={copyUrlToClipboard(
                    `/embed/${sesh?.user?.name?.toLowerCase()}`
                  )}
                  variant="ghost"
                >
                  <div className="flex items-center">
                    <FaWindowRestore />
                    &nbsp; Copy embed url
                  </div>
                </Button>
              </div>
              <AutoAnimate className="flex flex-1 items-center justify-center">
                <span
                  key={selectedQuestion?.id}
                  className="max-w-md break-all text-lg font-medium"
                >
                  {selectedQuestion?.body}
                </span>
              </AutoAnimate>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-750">
            <button
              className="flex items-center justify-center gap-2 rounded-bl p-3 text-sm hover:bg-gray-700 sm:p-4 sm:text-base"
              onClick={() => unpinQuestion()}
            >
              <FaEyeSlash /> Hide
            </button>
            <button
              className="flex items-center justify-center gap-2 rounded-br p-3 text-sm hover:bg-gray-700 sm:p-4 sm:text-base"
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
      <div className="row-span-2 flex flex-col gap-2 sm:col-span-1 sm:row-span-1">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 font-medium">
            <span>Questions</span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-xs font-extrabold">
              {otherQuestions.length}
            </span>
            <button
              className="relative z-10 -my-2 flex items-center gap-1.5 rounded py-2 px-2 text-sm hover:bg-gray-900/50 hover:text-white"
              onClick={() => setReverseSort(!reverseSort)}
            >
              {reverseSort ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
          </h2>

          <Button
            onClick={copyUrlToClipboard(
              `/ask/${sesh?.user?.name?.toLowerCase()}`
            )}
            variant="secondary"
            size="base"
          >
            <div className="flex items-center">
              <FaQuestionCircle />
              &nbsp; Copy Q&A url
            </div>
          </Button>
        </div>
        <AutoAnimate
          as="ul"
          className="flex flex-1 flex-col gap-2 overflow-y-scroll rounded-lg bg-gray-950/25 p-2"
        >
          {otherQuestionsSorted.map((q) => (
            <li key={q.id}>
              <Card className="relative flex animate-fade-in-down flex-col gap-4 p-4">
                <div className="break-words">{q.body}</div>
                <div className="flex items-center justify-between text-gray-300">
                  <div className="text-sm">{dayjs(q.createdAt).fromNow()}</div>
                  <button
                    className="relative z-10 -my-1 -mx-2 flex items-center gap-1.5 rounded py-1 px-2 text-sm hover:bg-gray-900/50"
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
            </li>
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
    <div className="flex gap-6">
      <h1 className="flex items-center gap-2 text-base font-medium">
        {sesh?.user?.image && (
          <img
            src={sesh?.user?.image}
            alt="pro pic"
            className="w-8 rounded-full"
          />
        )}
        <span className="sr-only sm:not-sr-only">{sesh?.user?.name}</span>
      </h1>

      <Button onClick={() => signOut()} variant="secondary" size="lg">
        <div className="flex items-center">
          <FaSignOutAlt />
          <span className="sr-only sm:not-sr-only">&nbsp; Logout</span>
        </div>
      </Button>
    </div>
  );
};

const HomeContents = () => {
  const { data } = useSession();

  if (!data)
    return (
      <div className="flex grow flex-col items-center justify-center p-4">
        <div className="relative mb-8 text-6xl font-bold">
          Ping Ask{" "}
          <sup className="absolute top-0 left-full text-xs text-pink-400">
            [BETA]
          </sup>
        </div>
        <div className="mb-8 text-center text-lg">
          An easy way to curate questions from your audience and embed them in
          your OBS.
        </div>
        <Button
          variant="secondary-inverted"
          size="xl"
          onClick={() => signIn("twitch")}
        >
          <div className="flex items-center">
            <FaTwitch /> &nbsp; Sign In
          </div>
        </Button>
      </div>
    );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2 sm:py-4 sm:px-8">
        <div className="relative whitespace-nowrap text-2xl font-bold">
          Ping Ask{" "}
          <sup className="absolute top-0 left-[calc(100%+.25rem)] text-xs font-extrabold text-pink-400">
            [BETA]
          </sup>
        </div>
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
        <meta name="description" content="Ping Ask" />
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
