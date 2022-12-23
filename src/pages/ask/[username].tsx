import { GetStaticProps } from "next";
import Head from "next/head";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { prisma } from "../../server/db/client";
import type { User } from "@prisma/client";
import clsx from "clsx";
import { LoadingSpinner } from "../../components/loading";
import Button from "../../components/button";
import { TextInput } from "../../components/text-input";

const AskForm = (props: { user: User }) => {
  if (!props.user) throw new Error("user exists Next, sorry");
  const { mutate, isLoading, isSuccess, reset } =
    trpc.proxy.questions.submit.useMutation();
  const [question, setQuestion] = useState("");
  const handleSubmit = () => {
    if (!question) return;
    mutate({ userId: props.user.id, question });
    setQuestion("");
  };

  return (
    <>
      <Head>
        <title>{`Ask ${props.user?.name} a question!`}</title>
      </Head>
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="relative mb-12 flex w-full max-w-lg flex-col items-center gap-8 rounded border border-gray-750 bg-gray-800 p-8 pt-20">
          {props.user.image && (
            <img
              src={props.user.image}
              className="absolute -top-14 h-28 w-28 rounded-full border-4 border-gray-800"
              alt="Profile picture"
            />
          )}
          <h1 className="text-2xl font-medium">
            Ask {props.user?.name} a question!
          </h1>
          {!isSuccess && (
            <>
              <TextInput
                placeholder="Type something..."
                className="w-full"
                type="text"
                value={question}
                maxLength={400}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                loading={isLoading}
                size="lg"
                variant="primary"
              >
                Submit
              </Button>
            </>
          )}
          {isSuccess && (
            <>
              <div className="rounded px-2 py-1 text-lg">
                Question submitted!
              </div>

              <Button onClick={() => reset()} size="lg">
                Ask another question
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params || !params.username || typeof params.username !== "string") {
    return {
      notFound: true,
    };
  }
  const twitchName = params.username.toLowerCase();

  const userInfo = await prisma.user.findFirst({
    where: { name: { equals: twitchName } },
  });

  if (!userInfo) {
    return {
      notFound: true,
    };
  }

  return { props: { user: userInfo }, revalidate: 60 };
};

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export default AskForm;
