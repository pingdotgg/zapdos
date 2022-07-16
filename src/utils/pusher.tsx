/**
 * Section 1: "The Store"
 *
 * This defines a Pusher client and channel connection as a vanilla Zustand store.
 */
import Pusher, { Channel, PresenceChannel } from "pusher-js";
import reactZustandCreate from "zustand";
import vanillaCreate, { StoreApi } from "zustand/vanilla";

const pusher_key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY!;
const cluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!;

interface PusherZustandStore {
  pusherClient: Pusher;
  channel: Channel;
  presenceChannel: PresenceChannel;

  members: { [key: string]: any };
}

// self-contained Pusher state machine that manages:
// - Pusher Client
// - Connected/subscribed channels
// - "Current members" via presence
const createPusherStore = (slug: string, publishPresence?: boolean) => {
  const randomUserId = `random-user-id:${Math.random().toFixed(7)}`;
  const pusherClient = new Pusher(pusher_key, {
    authEndpoint: "/api/pusher/auth-channel",
    auth: {
      headers: { user_id: randomUserId },
    },
    cluster: cluster,
  });
  const channel = pusherClient.subscribe(slug);

  const presenceChannel = pusherClient.subscribe(
    `presence-${slug}`
  ) as PresenceChannel;

  const newStore = vanillaCreate<PusherZustandStore>((set) => {
    return {
      pusherClient: pusherClient,
      channel: channel,
      presenceChannel,

      members: {},
    };
  });

  // Update helper that sets 'members' to contents of presence channel's current members
  const updateMembers = () => {
    newStore.setState(() => ({
      members: presenceChannel.members.members,
    }));
    console.log("Current members updated:", presenceChannel.members.members);
  };

  // Bind all "present users changed" events to trigger updateMembers
  presenceChannel.bind("pusher:subscription_succeeded", updateMembers);
  presenceChannel.bind("pusher:member_added", updateMembers);
  presenceChannel.bind("pusher:member_removed", updateMembers);

  return newStore;
};

/**
 * Section 2: "The Context Provider"
 *
 * This creates a "Zustand React Context" that we can provide in the component tree.
 */
import createContext from "zustand/context";
const { Provider: PusherZustandStoreProvider, useStore: usePusherStore } =
  createContext<StoreApi<PusherZustandStore>>();

import React from "react";

/**
 * This provider is the thing you mount in the app to "give access to Pusher"
 *
 */
export const PusherProvider: React.FC<
  React.PropsWithChildren<{ slug: string }>
> = ({ slug, children }) => {
  const store = React.useMemo<StoreApi<PusherZustandStore>>(
    () => createPusherStore(slug),
    [slug]
  );

  React.useEffect(() => {
    return () => {
      store.getState().pusherClient.disconnect();
    };
  }, [store]);

  return (
    <PusherZustandStoreProvider createStore={() => reactZustandCreate(store)}>
      {children}
    </PusherZustandStoreProvider>
  );
};

/**
 * Section 3: "The Hooks"
 *
 * The exported hooks you use to interact with this store (in this case just an event sub)
 *
 * (I really want useEvent tbh)
 */
export function useSubscribeToEvent<MessageType>(
  eventName: string,
  callback: (data: MessageType) => void
) {
  const channel = usePusherStore((state) => state.channel);

  const stableCallback = React.useRef(callback);

  // Keep callback sync'd
  React.useEffect(() => {
    stableCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    const reference = (data: MessageType) => {
      stableCallback.current(data);
    };
    channel.bind(eventName, reference);
    return () => {
      channel.unbind(eventName, reference);
    };
  }, [channel, eventName]);
}

export const useCurrentMemberCount = () =>
  usePusherStore((s) => Object.keys(s.members).length);
