import { Tab } from "@headlessui/react";
import clsx from "clsx";
import React from "react";
import Button from "./button";

const TABS = [
  {
    label: "Fossabot",
    content: (
      <>
        <p>
          To connect Fossabot, create a new command with the following{" "}
          <strong>Response</strong> and set the <strong>Response Type</strong>{" "}
          to <kbd>Reply</kbd>.
        </p>
        <pre>{`$(customapi https://ask.ping.gg/api/external/fossabot)`}</pre>
        <p>
          Messages sent to this command on your channel will automagically be
          added to your questions ✨
        </p>
      </>
    ),
  },
  {
    label: "Nightbot",
    content: (
      <>
        <p>
          To connect Nightbot, create a new command with the following{" "}
          <strong>Message</strong>.
        </p>
        <pre>{`@$(user) $(urlfetch https://ask.ping.gg/api/external/chatbots?q=$(querystring)&channel=$(channel)&user=$(user))`}</pre>
        <p>
          Messages sent to this command on your channel will automagically be
          added to your questions ✨
        </p>
      </>
    ),
  },
  {
    label: "StreamElements",
    content: (
      <>
        <p>
          To connect StreamElements, create a new command with the following{" "}
          <strong>Response</strong>.
        </p>
        <pre>
          {
            "@${user} ${urlfetch https://ask.ping.gg/api/external/chatbots?channel=${channel}&q=${queryescape ${1:}}&user=${user}}"
          }
        </pre>
        <p>
          Messages sent to this command on your channel will automagically be
          added to your questions ✨
        </p>
      </>
    ),
  },
  {
    label: "Other",
    content: (
      <>
        <p>
          If your chatbot supports it, you can try configuring it to make an
          HTTP GET request to <code>ask.ping.gg/api/external/chatbots</code>{" "}
          with the following query parameters.
        </p>
        <table>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>q</code>
              </td>
              <td>The question content to be submitted.</td>
            </tr>
            <tr>
              <td>
                <code>channel</code>
              </td>
              <td>
                The Twitch channel (username) where the question is being asked.
              </td>
            </tr>
            <tr>
              <td>
                <code>user</code>
              </td>
              <td>The username of the Twitch user submitting the question.</td>
            </tr>
          </tbody>
        </table>
        <p>
          If you&apos;re having trouble configuring your chatbot, hit us up on{" "}
          <a href="https://ping.gg/discord" target="_blank" rel="noreferrer">
            Discord
          </a>{" "}
          and we&apos;ll do our best to help you get set up 🚀
        </p>
      </>
    ),
  },
];

export const ChatbotWalkthrough: React.FC = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="prose prose-sm px-4 py-2">
        <p>
          Connecting a chatbot allows your viewers to ask questions by typing a
          command directly in your Twitch chat. For example,
          <code>{"!ask How do magnets work?"}</code>.
        </p>
        <p>
          Ping Ask officially supports{" "}
          <a
            href="https://fossabot.com/?ref=ping-gg"
            target="_blank"
            rel="noreferrer"
          >
            Fossabot
          </a>
          ,{" "}
          <a
            href="https://nightbot.tv/?ref=ping-gg"
            target="_blank"
            rel="noreferrer"
          >
            Nightbot
          </a>
          , and{" "}
          <a
            href="https://streamelements.com/features/chatbot?ref=ping-gg"
            target="_blank"
            rel="noreferrer"
          >
            StreamElements
          </a>
          .
        </p>
      </div>
      <Tab.Group>
        <Tab.List className="border-b border-gray-750 px-2">
          {TABS.map(({ label }) => (
            <Tab as={React.Fragment} key={label}>
              {({ selected }) => (
                <Button
                  variant={selected ? "secondary" : "ghost"}
                  className={clsx(
                    "-mb-px rounded-b-none border-b-0",
                    selected ? "border-gray-750 bg-gray-850" : "bg-transparent"
                  )}
                  key={label}
                >
                  {label}
                </Button>
              )}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          {TABS.map(({ label, content }) => (
            <Tab.Panel key={label} className="prose prose-sm p-4">
              {content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
