import { NextApiRequest, NextApiResponse } from "next";
import { pusherServerClient } from "../../../server/common/pusher";
import { prisma } from "../../../server/db/client";
import { PREFIX } from "./fossabot";

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const channelName = req.query["channel"] as string;
  const question = req.query["q"] as string;
  // const askerName = req.query["user"] as string;
  if (!question) {
    res
      .status(200)
      .send(
        `${PREFIX}No question provided NotLikeThis Make sure you include a question after the command.`
      );
    return;
  }

  if (!channelName) {
    res.status(200).send(`${PREFIX}Channel name missing, check your bot configuration.`);
    return;
  }

  //find user in database
  const user = await prisma.user.findFirst({
    where: { name: { equals: channelName } },
  });

  if (!user) {
    res
      .status(200)
      .send(
        `${PREFIX}Channel ${channelName} not found, does it match your Ping Ask account?`
      );
    return;
  }

  // insert question into database
  await prisma.question.create({
    data: {
      body: question,
      userId: user.id,
    },
  });

  // inform client of new question
  await pusherServerClient.trigger(`user-${user.id}`, "new-question", {});

  res.status(200).send(`${PREFIX}Question Added! SeemsGood`);
};

export default handleRequest;
