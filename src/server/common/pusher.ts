import PusherServer from "pusher";
import { env } from "../env";

export const pusherServerClient = new PusherServer({
  appId: env.PUSHER_APP_ID!,
  key: env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: env.PUSHER_APP_SECRET!,
  host: env.NEXT_PUBLIC_PUSHER_SERVER_HOST!,
  port: env.NEXT_PUBLIC_PUSHER_SERVER_PORT!,
  useTLS: true,
});
