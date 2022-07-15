import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const LazyEmbedView = dynamic(() => import("../../components/embed"), {
  ssr: false,
});

const BrowserEmbedQuestionView = () => {
  const { query } = useRouter();
  if (!query.uid || typeof query.uid !== "string") {
    return null;
  }

  return <LazyEmbedView userId={query.uid} />;
};

export default BrowserEmbedQuestionView;
