import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const variableNames = [
  "NEXT_PUBLIC_PAY_PER_CALL_STATUS",
  "NEXT_PUBLIC_PAY_PER_CALL_START_TIME",
  "NEXT_PUBLIC_PAY_PER_CALL_END_TIME",
  "NEXT_PUBLIC_RINGBA_CAMPAIGN_ID",
  "NEXT_PUBLIC_PAY_PER_CALL_PHONE_NUMBER",
] as const;

const defaults = {
  payPerCallStatus: "OFF",
  payPerCallStartTime: "",
  payPerCallEndTime: "",
  ringbaCampaignId: "",
  payPerCallPhoneNumber: "",
};

function normalizeString(value: unknown) {
  return String(value || "").trim();
}

function mapConfig(values: Record<string, string>) {
  const payPerCallStatus = normalizeString(values.NEXT_PUBLIC_PAY_PER_CALL_STATUS).toUpperCase();
  const payPerCallStartTime = normalizeString(values.NEXT_PUBLIC_PAY_PER_CALL_START_TIME);
  const payPerCallEndTime = normalizeString(values.NEXT_PUBLIC_PAY_PER_CALL_END_TIME);
  const ringbaCampaignId = normalizeString(values.NEXT_PUBLIC_RINGBA_CAMPAIGN_ID);
  const payPerCallPhoneNumber = normalizeString(values.NEXT_PUBLIC_PAY_PER_CALL_PHONE_NUMBER);
  const hasCompletePayPerCallConfig =
    payPerCallStatus === "ON" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(payPerCallStartTime) &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(payPerCallEndTime) &&
    /^CA[a-zA-Z0-9]+$/.test(ringbaCampaignId) &&
    /^1?[2-9]\d{2}[2-9]\d{6}$/.test(payPerCallPhoneNumber.replace(/\D/g, ""));

  if (!hasCompletePayPerCallConfig) {
    return defaults;
  }

  return {
    payPerCallStatus,
    payPerCallStartTime,
    payPerCallEndTime,
    ringbaCampaignId,
    payPerCallPhoneNumber,
  };
}

export async function GET() {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(defaults);
  }

  const { data, error } = await supabase
    .from("environment_variables")
    .select("variable_name, variable_value")
    .in("variable_name", variableNames);

  if (error) {
    console.error("Runtime config lookup failed", error);
    return NextResponse.json(defaults);
  }

  const values = Object.fromEntries(
    (data || []).map((row) => [
      normalizeString(row.variable_name),
      normalizeString(row.variable_value),
    ]),
  );

  return NextResponse.json(mapConfig(values), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
