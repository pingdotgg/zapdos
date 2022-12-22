import NextAuth, { NextAuthOptions } from "next-auth";
import TwitchProvider from "next-auth/providers/twitch";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../server/env";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    TwitchProvider({
      clientId: env.TWITCH_CLIENT_ID,
      clientSecret: env.TWITCH_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid user:read:email moderation:read",
        },
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async signIn(message) {
      const { user, account, profile, isNewUser } = message;

      // If user is new, notify on discord. Don't run if webhook env var is not set
      if (isNewUser && typeof env.DISCORD_NEW_USER_WEBHOOK === "string") {
        const socialLink = () => {
          if (account.provider === "twitch")
            return `[${profile?.name} (${account.provider})](https://twitch.tv/${profile?.name})`;
          if (account.provider === "twitter")
            return `[${profile?.name} (${account.provider})](https://twitter.com/${profile?.name})`;
          return `${profile?.name} (${account.provider})`;
        };

        const content = `${socialLink()} just signed in for the first time!`;

        fetch(env.DISCORD_NEW_USER_WEBHOOK, {
          method: "POST",
          body: JSON.stringify({
            content,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      // fetches latest moderator list from twitch
      if (account.provider === "twitch") {
        const { data: res } = (await fetch(
          `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${profile?.id}&first=100`,
          {
            headers: {
              "Client-ID": env.TWITCH_CLIENT_ID,
              Authorization: `Bearer ${account.access_token}`,
            },
          }
        ).then((r) => r.json())) as { data: { user_login: string }[] };

        const cur = await prisma.user.findUnique({
          where: {
            id: user.id as string,
          },
          select: {
            ModList: true,
          },
        });

        await prisma.user.update({
          where: {
            id: user.id as string,
          },
          data: {
            ModList: {
              set: Array.from(
                new Set([
                  ...(cur?.ModList ?? []),
                  ...res.map((r) => r.user_login),
                ])
              ),
            },
          },
        });

        // if this is a new user, sub to eventsub for mod changes
        // only do this in production
        if (isNewUser && env.NODE_ENV === "production") {
          ["channel.moderator.add", "channel.moderator.remove"].forEach(
            async (type) => {
              await fetch(
                `https://api.twitch.tv/helix/eventsub/subscriptions?broadcaster_id=${profile?.id}`,
                {
                  method: "POST",
                  headers: {
                    "Client-ID": env.TWITCH_CLIENT_ID,
                  },
                  body: JSON.stringify({
                    type,
                    version: "1",
                    condition: {
                      broadcaster_user_id: profile?.id,
                    },
                    transport: {
                      method: "webhook",
                      callback: `https://ask.ping.gg/api/external/twitch/eventsub`,
                      secret: env.NEXTAUTH_SECRET,
                    },
                  }),
                }
              );
            }
          );
        }
      }

      // Updates user record with latest image
      if (user.id) {
        await prisma.user.update({
          where: {
            id: user.id as string,
          },
          data: {
            image: profile?.image,
          },
        });
      }
    },
  },
};

export default NextAuth(authOptions);
