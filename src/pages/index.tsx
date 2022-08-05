import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { getZapdosAuthSession } from "../server/common/get-server-session";

import {
  FaCaretSquareRight,
  FaCopy,
  FaSignOutAlt,
  FaTwitch,
  FaLock,
  FaLockOpen,
  FaEye, 
  FaEyeSlash, 
  FaArchive,
} from "react-icons/fa";

import dynamic from "next/dynamic";
import { trpc } from "../utils/trpc";

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
import { PropsWithChildren, useEffect } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Card } from "../components/card";
import { AutoAnimate } from "../components/auto-animate";

const QuestionsView = () => {
  const { data, isLoading, refetch } = trpc.proxy.questions.getAll.useQuery();
  // Refetch when new questions come through
  useSubscribeToEvent("new-question", () => refetch());

  const connectionCount = useCurrentMemberCount() - 1;

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
            {
              selectedQuestion && (
                <span key={selectedQuestion?.id}>
                  <span className={!!!selectedQuestion.authorId || !selectedQuestion.author?.name ? "italic" : ""}>
                    {!!selectedQuestion.authorId && selectedQuestion.author?.name || "Anonymous"}:
                  </span> {selectedQuestion.body}
                </span>
              )
            }
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
      <AutoAnimate className="col-span-1 flex flex-col gap-4 overflow-y-auto py-4 pl-3 pr-6">
        {otherQuestions.map((q) => (
          <Card
            key={q.id}
            className="flex animate-fade-in-down flex-col divide-y divide-gray-800"
          >
            <div className="flex justify-between p-4">
              <div>
                <span className={!!!q.authorId || !q.author?.name ? "italic" : ""}>
                  {!!q.authorId && q.author?.name || "Anonymous"}
                </span> | {dayjs(q.createdAt).fromNow()}
              </div>
              <div className="flex gap-4">
                {pinnedId === q.id && (
                  <button onClick={() => unpinQuestion()}>
                    <FaEyeSlash size={24} />
                  </button>
                )}
                {pinnedId !== q.id && (
                  <button onClick={() => pinQuestion({ questionId: q.id })}>
                    <FaEye size={24} />
                  </button>
                )}
                <button onClick={() => removeQuestion({ questionId: q.id })}>
                  <FaArchive size={24} />
                </button>
              </div>
            </div>
            <div className="p-4">{q.body}</div>
          </Card>
        ))}
      </AutoAnimate>
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

const SwitchLoginRequiredButton: React.FC<{ userId: string }> = ({ userId }) => {
  const { data, refetch } = trpc.proxy.settings.getLoginRequired.useQuery({ userId });
  const { mutateAsync } = trpc.proxy.settings.setRequiresLogin.useMutation();

  const loginRequired = !!data; // defaults to null

  return (
    <button
      onClick={() => {
        mutateAsync({ loginRequired: !loginRequired }).finally(() => refetch());
      }}
      className="flex gap-2 rounded bg-gray-200 p-4 font-bold text-gray-800 hover:bg-gray-100"
    >
      Switch to {" "}
      {
        loginRequired && <>
          open questions <FaLockOpen size={24} />
        </>
      }
      {
        !loginRequired && <>
          login required <FaLock size={24} />
        </>
      }
    </button>
  )
}

const NavButtons: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: sesh } = useSession();

  return (
    <div className="flex gap-2">
      <SwitchLoginRequiredButton userId={userId} />

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
      <div className="flex grow flex-col items-center justify-center">
        <div className="text-2xl font-bold">Please log in below</div>
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
      <div className="flex items-center justify-between bg-gray-800 py-4 px-8 shadow">
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

      <div className="relative flex h-screen w-screen flex-col justify-between">
        <HomeContents />
        <div className="flex justify-between bg-black/40 py-4 px-8">
          <span>
            Quickly created by{" "}
            <a href="https://twitter.com/t3dotgg" className="text-blue-300">
              Theo
            </a>
          </span>
          <div className="flex gap-4">
            <a
              href="https://github.com/theobr/zapdos"
              className="text-blue-300"
            >
              Github
            </a>
            <a href="https://t3.gg/discord" className="text-blue-300">
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
