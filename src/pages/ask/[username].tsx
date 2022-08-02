import {
  GetServerSidePropsContext,
  GetStaticProps,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import { prisma } from "../../server/db/client";
import type { User } from "@prisma/client";

const AskForm = (props: { user: User }) => {
  if (!props.user) throw new Error("user exists Next, sorry");
  const { mutate } = trpc.proxy.questions.submit.useMutation();
  const [question, setQuestion] = useState("");

	return (
		<>
			<Head>
				<title>{`Ask ${props.user?.name} a question!`}</title>
			</Head>
			<div className="flex flex-col items-center text-center">
				<div className="p-14" />
				<form
					className="flex w-full max-w-lg flex-col items-center rounded border border-gray-500 bg-gray-600 p-8"
					onSubmit={() => {
						if (!question) return;

						mutate({ userId: props.user.id, question });

						setQuestion("");
					}}
				>
					{props.user.image && <img src={props.user.image} className="fixed top-14 h-28 w-28 rounded-full border-4 border-gray-500" alt="Pro pic" />}
					<div className="p-4" />
					<h1 className="text-2xl font-bold">Ask {props.user?.name} a question!</h1>
					<div className="p-4" />
					<input placeholder="Type something..." className="w-full rounded px-2 py-1 text-center text-lg text-gray-800" type="text" value={question} onChange={(e) => setQuestion(e.target.value)} />
					<div className="p-4" />
					<button className="flex rounded bg-gray-200 py-2 px-8 font-bold text-gray-800 hover:bg-gray-100" type="submit">
						Submit
					</button>
				</form>
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
