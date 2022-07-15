import { NextApiRequest, NextApiResponse } from "next";
import { pusherServerClient } from "../../../server/common/pusher";

export default function pusherAuthUserEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { socket_id } = req.body;
  const { user_id } = req.headers;

  if (!user_id || typeof user_id !== "string") {
    res.status(404).send("lol");
    return;
  }
  const auth = pusherServerClient.authenticateUser(socket_id, {
    id: user_id,
    name: "theo",
  });
  res.send(auth);
}
