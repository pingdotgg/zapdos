import dynamic from "next/dynamic";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next/types";

import React, { useState } from "react";
import { PusherProvider, useSubscribeToEvent } from "../../utils/pusher";
import { prisma } from "../../server/db/client";

type ServerSideProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const useLatestPusherMessage = (initialPinnedQuestion: string | null) => {
  const [latestMessage, setLatestMessage] = useState<string | null>(
    initialPinnedQuestion
  );

  useSubscribeToEvent("question-pinned", (data: { question: string }) =>
    setLatestMessage(data.question)
  );
  useSubscribeToEvent("question-unpinned", () => setLatestMessage(null));

  return latestMessage;
};

const BrowserEmbedViewCore: React.FC<ServerSideProps> = ({
  pinnedQuestion,
}) => {
  const latestMessage = useLatestPusherMessage(pinnedQuestion ?? null);

  if (!latestMessage) return null;

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div
        id="question"
        className="w-full rounded border-2 bg-gray-900/70 p-8 text-center text-2xl text-white shadow"
      >
        {latestMessage}
      </div>
    </div>
  );
};

const LazyEmbedView = dynamic(() => Promise.resolve(BrowserEmbedViewCore), {
  ssr: false,
});

const BrowserEmbedView: React.FC<ServerSideProps> = (props) => {
  if (!props.userId) return null;

  return (
    <PusherProvider slug={`user-${props.userId}`}>
      <LazyEmbedView {...props} />
    </PusherProvider>
  );
};

export default BrowserEmbedView;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const uid = context.query.uid;

  if (typeof uid !== "string") return { props: { success: false } };

  const pinnedQuestion = await prisma.question
    .findFirst({
      where: { userId: uid, status: "PINNED" },
    })
    .then((question) => question?.body);

  return {
    props: {
      userId: uid,
      pinnedQuestion: pinnedQuestion ?? null,
    },
  };
};
