import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  const validateUrl = req.headers["x-fossabot-validateurl"] as string;
  const channelName = req.headers["x-fossabot-channeldisplayname"] as string;

  if (!validateUrl || !channelName) {
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

  //validate request is coming from fossabot
  const validateResponse = await fetch(validateUrl);

  if (validateResponse.status !== 200) {
    res.status(400).json({
      message: "Failed to validate request.",
    });
    return;
  }

  const messageDataUrl = await validateResponse
    .json()
    .then((data) => data.context_url);

  const messageDataResponse = await fetch(messageDataUrl);

  if (messageDataResponse.status !== 200) {
    res.status(400).json({ message: "Failed to fetch message data" });
    return;
  }

  const messageData = await messageDataResponse.json();

  // strip off the command, e.g. !ask
  const question = messageData.message.content.match(/(?<=\s).*/)[0];

  // insert question into database
  await prisma.question.create({
    data: {
      body: question,
      userId: user.id,
    },
  });

  res.status(200).end();
};

export default handleRequest;
