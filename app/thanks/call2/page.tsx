import { Suspense } from "react";
import ThanksCall2Client from "./thanks-call2-client";
import VercelThankYouTracker from "../vercel-thank-you-tracker";

export default function ThanksCall2Page() {
  return (
    <Suspense fallback={null}>
      <VercelThankYouTracker thankYouType="call" />
      <ThanksCall2Client />
    </Suspense>
  );
}
