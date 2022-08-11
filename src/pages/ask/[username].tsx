import { GetStaticProps } from "next";
import Head from "next/head";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { prisma } from "../../server/db/client";
import type { User } from "@prisma/client";
import clsx from "clsx";
import { LoadingSpinner } from "../../components/loading";

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
      <div className="flex flex-col items-center text-center">
        <div className="p-14" />
        <div className="flex w-full max-w-lg flex-col items-center gap-8 rounded border border-gray-500 bg-gray-600 p-8 pt-20">
          {props.user.image && (
            <img
              src={props.user.image}
              className="fixed top-14 h-28 w-28 rounded-full border-4 border-gray-500"
              alt="Pro pic"
            />
          )}
          <h1 className="text-2xl font-bold">
            Ask {props.user?.name} a question!
          </h1>
          {!isSuccess && (
            <>
              <input
                placeholder="Type something..."
                className="w-full rounded px-2 py-1 text-center text-lg text-gray-800"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
              <button
                className="relative flex rounded bg-gray-200 py-2 px-8 font-bold text-gray-800 hover:bg-gray-100"
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                <span className={clsx({ invisible: isLoading })}>Submit</span>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <LoadingSpinner
                    className={clsx("h-5 w-5", { invisible: !isLoading })}
                  />
                </div>
              </button>
            </>
          )}
          {isSuccess && (
            <>
              <div className="rounded px-2 py-1 text-lg">
                Question submitted!
              </div>
              <button
                className="flex rounded bg-gray-200 py-2 px-8 font-bold text-gray-800 hover:bg-gray-100"
                type="button"
                onClick={() => reset()}
              >
                Ask another question
              </button>
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
    where: { name: { equals: twitchName, mode: "insensitive" } },
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
