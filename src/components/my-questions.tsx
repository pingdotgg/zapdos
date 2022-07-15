import { trpc } from "../utils/trpc";

import { FaEye, FaEyeSlash, FaArchive } from "react-icons/fa";
import { PusherProvider, useSubscribeToEvent } from "../utils/pusher";
import { useSession } from "next-auth/react";
import { useState } from "react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const QuestionsView = () => {
  const { data, isLoading, refetch } = trpc.proxy.questions.getAll.useQuery();
  // Refetch when new questions come through
  useSubscribeToEvent("new-question", () => refetch());

  const [currentlyPinned, setCurrentlyPinnedQuestion] = useState<
    string | undefined
  >();
  const { mutate: pinQuestionMutation } =
    trpc.proxy.questions.pin.useMutation();
  const pinQuestion = (questionId: string) => {
    pinQuestionMutation({
      questionId,
    });
    setCurrentlyPinnedQuestion(questionId);
  };

  const { mutate: unpinQuestionMutation } =
    trpc.proxy.questions.unpin.useMutation();

  const unpinQuestion = () => {
    unpinQuestionMutation();
    setCurrentlyPinnedQuestion(undefined);
  };

  const tctx = trpc.useContext();

  const { mutate: removeQuestionMutation } =
    trpc.proxy.questions.archive.useMutation();

  const removeQuestion = (questionId: string) => {
    // Optimistic update
    tctx.queryClient.setQueryData(
      ["questions.getAll", null],
      data?.filter((q) => q.id !== questionId)
    );

    // Mutation to archive question
    removeQuestionMutation({ questionId });

    // Unpin if this one was pinned
    if (questionId === currentlyPinned) unpinQuestion();
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4 p-8">
      {data?.map((q) => (
        <div
          key={q.id}
          className="flex h-52 w-96 animate-fade-in-down flex-col rounded border border-gray-500 bg-gray-600 shadow-xl"
        >
          <div className="flex justify-between border-b border-gray-500 p-4">
            {dayjs(q.createdAt).fromNow()}
            <div className="flex gap-4">
              {currentlyPinned === q.id && (
                <button onClick={() => unpinQuestion()}>
                  <FaEyeSlash size={24} />
                </button>
              )}
              {currentlyPinned !== q.id && (
                <button onClick={() => pinQuestion(q.id)}>
                  <FaEye size={24} />
                </button>
              )}
              <button onClick={() => removeQuestion(q.id)}>
                <FaArchive size={24} />
              </button>
            </div>
          </div>
          <div className="p-4">{q.body}</div>
        </div>
      ))}
    </div>
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
