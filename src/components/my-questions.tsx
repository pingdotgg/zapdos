import { trpc } from "../utils/trpc";

import { FaEye, FaTimes } from "react-icons/fa";
import { PusherProvider, useSubscribeToEvent } from "../utils/pusher";
import { useSession } from "next-auth/react";

export const QuestionsView = () => {
  const { data, isLoading, refetch } = trpc.proxy.questions.getAll.useQuery();

  // Refetch when new questions come through
  useSubscribeToEvent("new-question", () => refetch());

  const client = trpc.useContext();

  const { mutate: pinQuestion } = trpc.proxy.questions.pin.useMutation();

  const { mutate: removeQuestion } = trpc.proxy.questions.remove.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

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
            <button onClick={() => pinQuestion({ questionId: q.id })}>
              <FaEye size={24} />
            </button>
            <button onClick={() => removeQuestion({ questionId: q.id })}>
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
