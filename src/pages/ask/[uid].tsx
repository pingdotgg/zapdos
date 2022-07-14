import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { trpc } from "../../utils/trpc";
import { prisma } from "../../server/db/client";

const AskForm = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  if (!props.user) throw new Error("user exists Next, sorry");
  const { mutate } = trpc.useMutation("questions.submit-question");
  const [question, setQuestion] = useState("");

  return (
    <>
      <Head>
        <title>Ask {props.user?.name} a question!</title>
      </Head>
      <div className="flex flex-col items-center text-center p-8">
        <div className="flex flex-col p-8 items-center bg-gray-900 border-2 w-full">
          {props.user.image && (
            <img
              src={props.user.image}
              className="w-28 h-28 rounded-full"
              alt="Pro pic"
            />
          )}
          <h1 className="text-2xl font-bold">
            Ask {props.user?.name} a question!
          </h1>
          <h2>And someone pls make this page less ugly</h2>

          <div className="p-4" />

          <input
            placeholder="Question"
            className="p-1 px-2 w-full text-gray-800"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="p-2" />
          <button
            className="bg-gray-200 text-gray-800 p-4 rounded hover:bg-gray-100 font-bold flex gap-2"
            onClick={() => {
              if (!question) return;

              mutate({ userId: props.user.id, question });

              setQuestion("");
            }}
          >
            Submit!
          </button>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { query } = ctx;
  if (!query.uid || typeof query.uid !== "string") {
    return { props: {}, redirect: { pathname: "/" } };
  }

  const userId = query.uid;

  const userInfo = await prisma.user.findFirst({ where: { id: userId } });

  if (!userInfo) {
    return { props: {}, redirect: { pathname: "/" } };
  }

  return { props: { user: userInfo } };
};

export default AskForm;
