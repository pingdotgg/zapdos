import type { NextApiRequest, NextApiResponse } from "next/types";
import crypto from "crypto";

import { env } from "../../../../server/env";
import { prisma } from "../../../../server/db/client";

const isVerified = (req: NextApiRequest) => {
  const signature = req.headers["twitch-eventsub-message-signature"] as string;
  const timestamp = req.headers["twitch-eventsub-message-timestamp"] as string;
  const messageid = req.headers["twitch-eventsub-message-id"] as string;

  const hmac = crypto.createHmac("sha256", env.NEXTAUTH_SECRET);
  const hash = hmac.update(`${messageid}${timestamp}${req.body}`).digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${hash}`),
    Buffer.from(signature)
  );
};

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!isVerified(req)) {
    return res.status(403).send("Signature verification failed");
  }
  const notification = JSON.parse(req.body);

  // if the request is a challenge, respond with the challenge
  if (
    req.headers["twitch-eventsub-message-type"] ===
    "webhook_callback_verification"
  ) {
    return res.status(200).send(notification.challenge);
  }

  if (notification.subscription.type === "channel.moderator.add") {
    console.log(
      `[Twitch EventSub] Moderator added to channel ${notification.subscription.condition.broadcaster_user_login}`
    );

    const { user_login } = notification.event;

    const userId = await prisma.account
      .findFirst({
        where: {
          providerAccountId:
            notification.subscription.condition.broadcaster_user_id,
        },
      })
      .then((r) => {
        if (r) return r.userId;
      });

    if (!userId) {
      // It should never happen, but just in case
      console.log("[Twitch EventSub][Add Mod] User not found. Skipping...");
      // Twitch doesn't care about our app logic
      return res.status(200).send("OK");
    }

    const cur = await prisma.user.findUnique({
      where: {
        id: userId as string,
      },
      select: {
        ModList: true,
      },
    });

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ModList: {
          set: Array.from(new Set([...(cur?.ModList ?? []), user_login])),
        },
      },
    });
  }

  if (notification.subscription.type === "channel.moderator.remove") {
    console.log(
      `[Twitch EventSub] Moderator removed from channel ${notification.subscription.condition.broadcaster_user_login}`
    );

    const { user_login } = notification.event;

    const userId = await prisma.account
      .findFirst({
        where: {
          providerAccountId:
            notification.subscription.condition.broadcaster_user_id,
        },
      })
      .then((r) => {
        if (r) return r.userId;
      });

    if (!userId) {
      // It should never happen, but just in case
      console.log("[Twitch EventSub][Remove Mod] User not found. Skipping...");
      // Twitch doesn't care about our app logic
      return res.status(200).send("OK");
    }

    const cur = await prisma.user.findUnique({
      where: {
        id: userId as string,
      },
      select: {
        ModList: true,
      },
    });

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ModList: {
          set: (cur?.ModList ?? []).filter((u) => u !== user_login),
        },
      },
    });
  }

  res.status(200).send("OK");
};
