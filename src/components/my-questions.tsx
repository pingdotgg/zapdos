import { trpc } from "../utils/trpc";

import { FaEye } from "react-icons/fa";
import { PusherProvider, useSubscribeToEvent } from "../utils/pusher";
import { useSession } from "next-auth/react";

export const QuestionsView = () => {
  const { data, isLoading, refetch } = trpc.proxy.questions.getAll.useQuery();

  // Refetch when new questions come through
  useSubscribeToEvent("new-question", () => refetch());

  const { mutate: pinQuestion } = trpc.proxy.questions.pin.useMutation();

  if (isLoading) return null;

  return (
    <div className="flex flex-col gap-4">
      {data?.map((q) => (
        <div
          key={q.id}
          className="p-4 bg-gray-600 rounded flex justify-between animate-fade-in-down"
        >
          {q.body}
          <button onClick={() => pinQuestion({ questionId: q.id })}>
            <FaEye size={24} />
          </button>
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
