"use client";

import { useSearchParams } from "next/navigation";
import BenchCall2Page from "./bench-call2-page";

export default function ThanksCall2Client() {
  const searchParams = useSearchParams();

  return (
    <BenchCall2Page
      funnelId={searchParams.get("funnel_id") || ""}
      ageGroup={searchParams.get("age_group") || ""}
      insuranceGoal={searchParams.get("insurance_goal") || ""}
      leadId={searchParams.get("lead_id") || ""}
      firstName={searchParams.get("first_name") || ""}
      applicationNumber={searchParams.get("application_number") || ""}
      phoneNumber={searchParams.get("ppc_phone") || ""}
      ringbaCampaignId={searchParams.get("ringba_campaign_id") || ""}
    />
  );
}
