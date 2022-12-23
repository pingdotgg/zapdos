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
          if (account?.provider === "twitch")
            return `[${profile?.name} (${account.provider})](https://twitch.tv/${profile?.name})`;
          if (account?.provider === "twitter")
            return `[${profile?.name} (${account.provider})](https://twitter.com/${profile?.name})`;
          return `${profile?.name} (${account?.provider})`;
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
