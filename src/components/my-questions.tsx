import { trpc } from "../utils/trpc";

import { FaEye, FaEyeSlash, FaArchive } from "react-icons/fa";
import {
  PusherProvider,
  useCurrentMemberCount,
  useSubscribeToEvent,
} from "../utils/pusher";
import { useSession } from "next-auth/react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import LoadingSVG from "../assets/puff.svg";
import Image from "next/image";
import { PropsWithChildren, useEffect } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const AnimatedQuestionsWrapper = (
  props: PropsWithChildren<{ className: string }>
) => {
  const [parent] = useAutoAnimate<HTMLDivElement>();

  return (
    <div ref={parent} className={props.className}>
      {props.children}
    </div>
  );
};

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

      // Unpin if this one was pinned
      if (questionId === pinnedId) unpinQuestion();
    },
  });

  if (isLoading)
    return (
      <div className="flex animate-fade-in-delay justify-center p-8">
        <Image src={LoadingSVG} alt="loading..." width={200} height={200} />
      </div>
    );

  return (
    <>
      <div>
        {connectionCount > 0 && (
          <span>Currently connected: {connectionCount}</span>
        )}
      </div>
      <AnimatedQuestionsWrapper className="flex flex-wrap justify-center gap-4 p-8">
        {data?.map((q) => (
          <div
            key={q.id}
            className="flex h-52 w-96 animate-fade-in-down flex-col rounded border border-gray-500 bg-gray-600 shadow-xl"
          >
            <div className="flex justify-between border-b border-gray-500 p-4">
              {dayjs(q.createdAt).fromNow()}
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
          </div>
        ))}
      </AnimatedQuestionsWrapper>
    </>
  );
};

export default function QuestionsViewWrapper() {
  const { data: sesh } = useSession();

  if (!sesh || !sesh.user?.id) return null;

  return (
    <PusherProvider slug={`user-${sesh.user?.id}`}>
      <QuestionsView />
    </PusherProvider>
  );
}
