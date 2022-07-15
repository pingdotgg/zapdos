import PusherServer from "pusher";
import { env } from "../env";
export const pusherServerClient = new PusherServer({
  appId: env.PUSHER_APP_ID!,
  key: env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: env.PUSHER_APP_SECRET!,
  cluster: "us3",
  // host: "zback-production.up.railway.app",
  useTLS: true,
});
