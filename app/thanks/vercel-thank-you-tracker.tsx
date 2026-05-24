"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { pageview, track } from "@vercel/analytics";

export default function VercelThankYouTracker({
  thankYouType,
}: {
  thankYouType: "lead" | "call";
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("funnel_id") !== "iul-v4") return;

    const eventName = `v4_thankyou_${thankYouType}`;

    track(eventName, {
      funnel_id: "iul-v4",
      thank_you_type: thankYouType,
      lead_id_present: Boolean(searchParams.get("lead_id")),
    });
    pageview({
      route: `/iul-v4/${eventName}`,
      path: `/iul-v4/${eventName}`,
    });
  }, [searchParams, thankYouType]);

  return null;
}
