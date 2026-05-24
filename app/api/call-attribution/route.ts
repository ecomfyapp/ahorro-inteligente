import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CallAttributionPayload = {
  leadId?: string;
  printedNumber?: string;
  applicationId?: string;
  page?: string;
};

function normalizeString(value: unknown) {
  return String(value || "").trim();
}

function normalizePhone(value: unknown) {
  const digits = normalizeString(value).replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits;
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CallAttributionPayload | null;
  const leadId = normalizeString(body?.leadId);
  const printedNumber = normalizePhone(body?.printedNumber);
  const applicationId = normalizeString(body?.applicationId);

  if (!leadId || !isUuid(leadId)) {
    return NextResponse.json({ ok: true, skipped: "missing_or_invalid_lead_id" });
  }

  if (!/^1[2-9]\d{2}[2-9]\d{6}$/.test(printedNumber)) {
    return NextResponse.json({ ok: true, skipped: "missing_or_invalid_printed_number" });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server credentials are not configured" },
      { status: 500 }
    );
  }

  const rawPayload = {
    source: "thanks_call_printed_number_capture",
    page: normalizeString(body?.page) || "/thanks/call",
    application_id: applicationId || null,
    printed_number: printedNumber,
    captured_at: new Date().toISOString(),
  };

  if (applicationId) {
    const metadataTableName = process.env.SUPABASE_LEAD_METADATA_TABLE?.trim() || "lead_metadata";
    const { error: metadataError } = await supabase
      .from(metadataTableName)
      .update({ application_id: applicationId })
      .eq("lead_id", leadId);

    if (metadataError) {
      console.error("Application ID metadata update failed", metadataError);
    }
  }

  const { data: existingEvent } = await supabase
    .from("ringba_call_events")
    .select("id")
    .eq("lead_id", leadId)
    .eq("event_name", "printed_number_captured")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingEvent?.id) {
    const { error } = await supabase
      .from("ringba_call_events")
      .update({
        printed_number: printedNumber,
        raw_payload: rawPayload,
      })
      .eq("id", existingEvent.id);

    if (error) {
      console.error("Printed number update failed", error);
      return NextResponse.json({ error: "printed_number_update_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, updated: true });
  }

  const { error } = await supabase.from("ringba_call_events").insert({
    lead_id: leadId,
    funnel_id: "iul-v4",
    event_name: "printed_number_captured",
    conversion_status: "captured",
    printed_number: printedNumber,
    raw_payload: rawPayload,
  });

  if (error) {
    console.error("Printed number insert failed", error);
    return NextResponse.json({ error: "printed_number_insert_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, inserted: true });
}
