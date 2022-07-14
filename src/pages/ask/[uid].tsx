import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "../../utils/trpc";

const AskForm: React.FC<{ userId: string }> = ({ userId }) => {
  const { data, isLoading } = trpc.useQuery([
    "questions.get-user-metadata",
    { userId },
  ]);

  const [question, setQuestion] = useState("");

  const { mutate } = trpc.useMutation("questions.submit-question");

  if (isLoading) return null;

  return (
    <>
      <Head>
        <title>Ask {data?.name} a question!</title>
      </Head>
      <div className="flex flex-col items-center text-center">
        <div className="flex flex-col p-8 items-center bg-gray-900 border-2 w-full md:w-96 m-8">
          <h1 className="text-2xl font-bold">Ask {data?.name} a question!</h1>
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

              mutate({ userId, question });

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

const AskPage = () => {
  const { query } = useRouter();
  if (!query.uid || typeof query.uid !== "string") {
    return null;
  }

  return <AskForm userId={query.uid} />;
};

export default AskPage;
