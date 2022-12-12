import React from "react";

export const ChatbotWalkthrough: React.FC = () => {
  return (
    <div>
      <div className="prose prose-sm px-4 py-2">
        <p>
          Connecting a chatbot allows your viewers to ask questions by typing a
          command directly in your Twitch chat. For example,
          <code>{"!ask How do magnets work?"}</code>.
        </p>
        <p>
          Ping Ask currently supports Fossabot, Nightbot, and StreamElements.
        </p>
        <h3>Fossabot</h3>
        <p>
          <pre>{`$(customapi https://ask.ping.gg/api/external/fossabot)`}</pre>
        </p>
        <h3>Nightbot</h3>
        <p>
          <pre>
            {`$(urlfetch https://ask.ping.gg/api/external/chatbots?q=$(querystring)&channel=$(channel)&user=$(user))`}
          </pre>
        </p>
        <h3>StreamElementst</h3>
        <p>
          <pre>{`$\{urlfetch https://ask.ping.gg/api/external/chatbots?channel=$\{channel}&q=$\{queryescape $\{1:}}&user=$\{user}}`}</pre>
        </p>
        <p>
          Messages sent to this command on your channel will be added to your
          question queue.
        </p>
      </div>
    </div>
  );
};
