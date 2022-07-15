import { trpc } from "../utils/trpc";

import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { PusherProvider, useSubscribeToEvent } from "../utils/pusher";
import { useSession } from "next-auth/react";
import { useState } from "react";

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

  const { mutate: removeQuestionMutation } =
    trpc.proxy.questions.remove.useMutation({
      onSuccess: () => {
        refetch();
      },
    });
  const removeQuestion = (questionId: string) => {
    removeQuestionMutation({ questionId });
    if (questionId === currentlyPinned) unpinQuestion();
  };

  if (isLoading) return null;

  return (
    <div className="flex flex-col gap-4">
      {data?.map((q) => (
        <div
          key={q.id}
          className="p-4 bg-gray-600 rounded flex justify-between animate-fade-in-down"
        >
          {q.body}
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
              <FaTimes size={24} />
            </button>
          </div>
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
