import { Suspense } from "react";
import ThanksCallClient from "./thanks-call-client";

export default function ThanksCallPage() {
  return (
    <Suspense fallback={null}>
      <ThanksCallClient />
    </Suspense>
  );
}
