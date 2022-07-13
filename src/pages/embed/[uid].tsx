import { useRouter } from "next/router";

import Pusher from "pusher-js";
import { useEffect, useMemo, useState } from "react";

const pusher_key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY!;
Pusher.logToConsole = true;

const useLatestPusherMessage = (userId: string) => {
  const pusherClient = useMemo(
    () =>
      new Pusher(pusher_key, {
        cluster: "us3",
      }),
    []
  );

  const [latestMessage, setLatestMessage] = useState<string | null>(null);

  useEffect(() => {
    const channel = pusherClient.subscribe(`user-${userId}`);
    console.log("bound to channel?", channel);
    channel.bind("question-pinned", (data: { question: string }) => {
      console.log("message received?", data);
      setLatestMessage(data.question);
    });
    channel.bind("question-unpinned", () => {
      setLatestMessage(null);
    });

    return () => {
      pusherClient.unsubscribe(`user-${userId}`);
    };
  }, [userId, pusherClient]);
  return latestMessage;
};

const BrowserEmbedView: React.FC<{ userId: string }> = ({ userId }) => {
  const latestMessage = useLatestPusherMessage(userId);

  if (!latestMessage) return null;

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      {" "}
      <div className="p-8 bg-gray-800 text-white rounded shadow">
        {latestMessage}
      </div>
    </div>
  );
};

const BrowserEmbedQuestionView = () => {
  const { query } = useRouter();
  if (!query.uid || typeof query.uid !== "string") {
    return null;
  }

  return <BrowserEmbedView userId={query.uid} />;
};

export default BrowserEmbedQuestionView;
