import { NextApiRequest, NextApiResponse } from "next";
import { pusherServerClient } from "../../../server/common/pusher";
import { prisma } from "../../../server/db/client";

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const channelName = req.query["channel"] as string;
  const question = req.query["q"] as string;
  // const askerName = req.query["user"] as string;

  if (!question || !channelName) {
    res.status(400).json({
      message: "Invalid request",
    });
    return;
  }

  //find user in database
  const user = await prisma.user.findFirst({
    where: { name: { equals: channelName } },
  });

  if (!user) {
    res.status(400).json({ message: "User not found" });
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

  res.status(200).end();
};

export default handleRequest;
