import { createClient } from "npm:@supabase/supabase-js@2";

type JsonRecord = Record<string, unknown>;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ringba-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepFindString(value: unknown, keys: string[]): string {
  if (!isRecord(value)) return "";

  for (const key of keys) {
    const direct = getString(value[key]);
    if (direct) return direct;
  }

  for (const nestedValue of Object.values(value)) {
    if (isRecord(nestedValue)) {
      const found = deepFindString(nestedValue, keys);
      if (found) return found;
    }
  }

  return "";
}

function deepFindNumber(value: unknown, keys: string[]): number | null {
  if (!isRecord(value)) return null;

  for (const key of keys) {
    const direct = getNumber(value[key]);
    if (direct != null) return direct;
  }

  for (const nestedValue of Object.values(value)) {
    if (isRecord(nestedValue)) {
      const found = deepFindNumber(nestedValue, keys);
      if (found != null) return found;
    }
  }

  return null;
}

function normalizeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : "";
}

function isConvertedCall({
  conversionStatus,
  eventName,
  callDurationSeconds,
  payout,
  revenue,
}: {
  conversionStatus: string;
  eventName: string;
  callDurationSeconds: number | null;
  payout: number | null;
  revenue: number | null;
}) {
  const status = conversionStatus.toLowerCase();
  const event = eventName.toLowerCase();
  const minimumDurationSeconds = Number(Deno.env.get("RINGBA_MIN_CONVERSION_SECONDS") || "30");

  if (["converted", "conversion", "paid", "sold", "qualified"].includes(status)) return true;
  if (event.includes("converted") || event.includes("conversion")) return true;
  if (callDurationSeconds != null && callDurationSeconds >= minimumDurationSeconds) return true;
  if ((payout != null && payout > 0) || (revenue != null && revenue > 0)) return true;

  return false;
}

async function parseRingbaPayload(request: Request) {
  const rawBody = await request.text();
  const contentType = request.headers.get("content-type") || "";
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());

  if (!rawBody.trim()) {
    return {
      __content_type: contentType,
      __raw_body: "",
      __query: query,
    };
  }

  try {
    const parsed = JSON.parse(rawBody);

    if (isRecord(parsed)) {
      return {
        ...parsed,
        __content_type: contentType,
        __query: query,
      };
    }

    return {
      value: parsed,
      __content_type: contentType,
      __raw_body: rawBody,
      __query: query,
    };
  } catch {
    const formPayload = Object.fromEntries(new URLSearchParams(rawBody).entries());

    return {
      ...formPayload,
      __content_type: contentType,
      __raw_body: rawBody,
      __query: query,
    };
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "method_not_allowed" }, { status: 405, headers: corsHeaders });
  }

  const expectedSecret = Deno.env.get("RINGBA_WEBHOOK_SECRET")?.trim();
  const receivedSecret = request.headers.get("x-ringba-secret")?.trim();

  if (!expectedSecret || receivedSecret !== expectedSecret) {
    return Response.json({ error: "unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const payload = await parseRingbaPayload(request);

  const leadId = normalizeUuid(
    deepFindString(payload, ["lead_id", "leadId", "LeadId", "LeadID", "external_id", "ExternalId"]),
  );
  const funnelId = deepFindString(payload, ["funnel_id", "funnelId", "FunnelId"]);
  const ringbaCallId = deepFindString(payload, [
    "ringba_call_id",
    "call_id",
    "callId",
    "CallId",
    "InboundCallId",
    "inbound_call_id",
  ]);
  const eventName = deepFindString(payload, ["event_name", "eventName", "event", "EventName"]);
  const conversionStatus =
    deepFindString(payload, ["conversion_status", "conversionStatus", "status", "Status"]);
  const callDurationSeconds = deepFindNumber(payload, [
    "call_duration_seconds",
    "duration_seconds",
    "duration",
    "callDuration",
    "CallDuration",
  ]);
  const callerPhoneNumber = deepFindString(payload, [
    "caller_phone_number",
    "callerPhoneNumber",
    "caller",
    "Caller",
    "CallerNumber",
  ]);
  const dialedPhoneNumber = deepFindString(payload, [
    "dialed_phone_number",
    "dialedPhoneNumber",
    "dialed",
    "Dialed",
    "Number",
    "tracking_number",
  ]);
  const payout = deepFindNumber(payload, ["payout", "Payout", "conversionAmount", "ConversionAmount"]);
  const revenue = deepFindNumber(payload, ["revenue", "Revenue"]);
  const convertedCall = isConvertedCall({
    conversionStatus,
    eventName,
    callDurationSeconds,
    payout,
    revenue,
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error: eventError } = await supabase.from("ringba_call_events").insert({
    lead_id: leadId || null,
    funnel_id: funnelId || null,
    ringba_call_id: ringbaCallId || null,
    event_name: eventName || "ringba_webhook",
    conversion_status: conversionStatus || (convertedCall ? "converted" : "received"),
    call_duration_seconds: callDurationSeconds == null ? null : Math.round(callDurationSeconds),
    caller_phone_number: callerPhoneNumber || null,
    dialed_phone_number: dialedPhoneNumber || null,
    payout,
    revenue,
    raw_payload: payload,
  });

  if (eventError) {
    console.error("ringba_call_events insert failed", eventError);
    return Response.json({ error: "event_insert_failed" }, { status: 500, headers: corsHeaders });
  }

  if (leadId && convertedCall) {
    const { error: leadError } = await supabase
      .from("leads")
      .update({
        lead_status: "sold",
        sold_as: "call",
      })
      .eq("lead_id", leadId);

    if (leadError) {
      console.error("lead call conversion update failed", leadError);
      return Response.json({ error: "lead_update_failed" }, { status: 500, headers: corsHeaders });
    }
  }

  return Response.json(
    { ok: true, lead_id: leadId || null, converted: convertedCall },
    { headers: corsHeaders },
  );
});
