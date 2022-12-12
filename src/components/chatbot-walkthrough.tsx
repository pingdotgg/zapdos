import { Tab } from "@headlessui/react";
import clsx from "clsx";
import React from "react";
import Button from "./button";

const TABS = [
  {
    label: "Fossabot",
    content: (
      <>
        <p>Fossabot is our recommended bot (says Mark).</p>
        <pre>{`$(customapi https://ask.ping.gg/api/external/fossabot)`}</pre>
        <p>
          Messages sent to this command on your channel will be added to your
          question queue.
        </p>
      </>
    ),
  },
  {
    label: "Nightbot",
    content: (
      <>
        <p>Fossabot is our recommended bot (says Mark).</p>
        <pre>{`$(customapi https://ask.ping.gg/api/external/fossabot)`}</pre>
        <p>
          Messages sent to this command on your channel will be added to your
          question queue.
        </p>
      </>
    ),
  },
  {
    label: "StreamElements",
    content: (
      <>
        <p>Fossabot is our recommended bot (says Mark).</p>
        <pre>{`$(customapi https://ask.ping.gg/api/external/fossabot)`}</pre>
        <p>
          Messages sent to this command on your channel will be added to your
          question queue.
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
          Ping Ask currently supports Fossabot, Nightbot, and StreamElements.
        </p>
      </div>
      <Tab.Group>
        <Tab.List className="border-b border-gray-700 px-2">
          {TABS.map(({ label }) => (
            <Tab as={React.Fragment} key={label}>
              {({ selected }) => (
                /* Use the `selected` state to conditionally style the selected tab. */
                <Button
                  variant={selected ? "secondary" : "ghost"}
                  className={clsx(
                    "-mb-px rounded-b-none border-b-0 ",
                    selected ? "bg-gray-850" : "bg-transparent"
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
