"use client";

import { useSearchParams } from "next/navigation";
import BenchCallPage from "@/app/call-5/bench-call-page";

export default function ThanksCallClient() {
  const searchParams = useSearchParams();

  return (
    <BenchCallPage
      funnelId={searchParams.get("funnel_id") || ""}
      ageGroup={searchParams.get("age_group") || ""}
      insuranceGoal={searchParams.get("insurance_goal") || ""}
      leadId={searchParams.get("lead_id") || ""}
    />
  );
}
