import React, { useState } from 'react';
import { PusherProvider, useSubscribeToEvent } from "../utils/pusher";

interface PinnedQuestion {
  author: string;
  message: string;
}

const useLatestPusherMessage = () => {
  const [latestMessage, setLatestMessage] = useState<PinnedQuestion | null>(null);

  useSubscribeToEvent("question-pinned", (data: { question: string, author: string }) =>
    setLatestMessage({
      author: data.author,
      message: data.question
    })
  );
  useSubscribeToEvent("question-unpinned", () => setLatestMessage(null));

  return latestMessage;
};

const BrowserEmbedViewCore: React.FC = () => {
  const latestMessage = useLatestPusherMessage();

  if (!latestMessage) return null;

  const isAnonymous = latestMessage.author === "Anonymous";

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="w-full rounded border-2 bg-gray-900/70 p-8 text-center text-2xl text-white shadow">
        <span className={isAnonymous ? "italic" : undefined}>{latestMessage.author}: </span>
        {latestMessage.message}
      </div>
    </div>
  );
};

const BrowserEmbedView: React.FC<{ userId: string }> = (props) => {
  return (
    <PusherProvider slug={`user-${props.userId}`}>
      <BrowserEmbedViewCore />
    </PusherProvider>
  );
};

export default BrowserEmbedView;
