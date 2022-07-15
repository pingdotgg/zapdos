import { useState } from "react";
import { PusherProvider, useSubscribeToEvent } from "../utils/pusher";

const useLatestPusherMessage = (userId: string) => {
  const [latestMessage, setLatestMessage] = useState<string | null>(null);

  useSubscribeToEvent("question-pinned", (data: { question: string }) =>
    setLatestMessage(data.question)
  );
  useSubscribeToEvent("question-unpinned", () => setLatestMessage(null));

  return latestMessage;
};

const BrowserEmbedViewCore: React.FC<{ userId: string }> = ({ userId }) => {
  const latestMessage = useLatestPusherMessage(userId);

  if (!latestMessage) return null;

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="p-8 bg-gray-900/70 text-white rounded shadow border-2 w-full text-center text-2xl">
        {latestMessage}
      </div>
    </div>
  );
};

const BrowserEmbedView: React.FC<{ userId: string }> = (props) => {
  return (
    <PusherProvider slug={`user-${props.userId}`}>
      <BrowserEmbedViewCore {...props} />
    </PusherProvider>
  );
};

export default BrowserEmbedView;
