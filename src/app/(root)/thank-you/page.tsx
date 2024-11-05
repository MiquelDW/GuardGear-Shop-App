import { Suspense } from "react";
import ThankYouPage from "./ThankYouPage";

const ThankYou = () => {
  return (
    // display fallback UI until the children have finished loading
    // the hook "useSearchParams" inside the "ThankYouPage" component expects to be wrapped in a <Suspense> component
    <Suspense>
      <ThankYouPage />
    </Suspense>
  );
};

export default ThankYou;
