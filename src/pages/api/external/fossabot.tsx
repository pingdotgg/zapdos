import { NextApiRequest, NextApiResponse } from "next";
import { pusherServerClient } from "../../../server/common/pusher";
import { prisma } from "../../../server/db/client";

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const validateUrl = req.headers["x-fossabot-validateurl"] as string;
  const channelName = req.headers["x-fossabot-channeldisplayname"] as string;

  if (!validateUrl || !channelName) {
    res.status(400).end("Invalid request");
    return;
  }

  //find user in database
  const user = await prisma.user.findFirst({
    where: { name: { equals: channelName } },
  });

  if (!user) {
    res.status(400).end("User not found");
    return;
  }

  //validate request is coming from fossabot
  const validateResponse = await fetch(validateUrl);

  if (validateResponse.status !== 200) {
    res.status(400).end("Failed to validate request.");
    return;
  }

  const messageDataUrl = await validateResponse
    .json()
    .then((data) => data.context_url);

  const messageDataResponse = await fetch(messageDataUrl);

  if (messageDataResponse.status !== 200) {
    res.status(400).end("Failed to fetch message data");
    return;
  }

  const messageData = await messageDataResponse.json();

  // strip off the command, e.g. !ask
  const [command, ...question] = messageData.message.content?.split(" ");

  if (!question) {
    res
      .status(400)
      .end(`No question provided NotLikeThis Try ${command} How do magnets work?`);
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

  res.status(200).end("Question Added! SeemsGood");
};

export default handleRequest;
