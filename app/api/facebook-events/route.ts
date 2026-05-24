import { createHash } from "crypto";
import { ipAddress } from "@vercel/functions";
import { NextResponse } from "next/server";

type FacebookEventPayload = {
  event?: string;
  eventSourceUrl?: string;
  payload?: Record<string, unknown>;
};

const allowedEvents = new Set(["PageView", "ViewContent", "Lead", "Contact"]);
const defaultGraphApiVersion = "v20.0";

function splitEnvList(value?: string) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getPixelConfigs() {
  const pixelIds = splitEnvList(process.env.FACEBOOK_PIXEL_IDS);
  const accessTokens = splitEnvList(process.env.FACEBOOK_PIXEL_ACCESS_TOKENS);

  return pixelIds
    .map((pixelId, index) => ({
      pixelId,
      accessToken: accessTokens[index] || "",
    }))
    .filter((config) => config.pixelId && config.accessToken);
}

function normalizeString(value: unknown) {
  return String(value || "").trim();
}

function normalizeLower(value: unknown) {
  return normalizeString(value).toLowerCase();
}

function normalizePhone(value: unknown) {
  const digits = normalizeString(value).replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

function normalizeZip(value: unknown) {
  return normalizeString(value).replace(/\s+/g, "").toLowerCase();
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hashIfPresent(value: string) {
  return value ? sha256(value) : undefined;
}

function getCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) return "";

  return decodeURIComponent(cookie.slice(name.length + 1));
}

function getFbc(request: Request, eventSourceUrl?: string) {
  const existingFbc = getCookie(request, "_fbc");
  if (existingFbc) return existingFbc;

  try {
    const fbclid = new URL(eventSourceUrl || request.headers.get("referer") || "").searchParams.get("fbclid");
    return fbclid ? `fb.1.${Date.now()}.${fbclid}` : "";
  } catch {
    return "";
  }
}

function getTestEventCode() {
  const value = process.env.FACEBOOK_TEST_EVENT_CODE?.trim();
  if (!value || ["none", "null", "off", "false"].includes(value.toLowerCase())) {
    return "";
  }
  return value;
}

function buildUserData(request: Request, payload: Record<string, unknown>, eventSourceUrl?: string) {
  const requestIp =
    ipAddress(request) ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";
  const userAgent = request.headers.get("user-agent") || "";
  const externalId = normalizeString(payload.external_id || payload.lead_id);

  return Object.fromEntries(
    Object.entries({
      em: hashIfPresent(normalizeLower(payload.email)),
      ph: hashIfPresent(normalizePhone(payload.phone_number)),
      fn: hashIfPresent(normalizeLower(payload.first_name)),
      ln: hashIfPresent(normalizeLower(payload.last_name)),
      ct: hashIfPresent(normalizeLower(payload.city)),
      st: hashIfPresent(normalizeLower(payload.state)),
      zp: hashIfPresent(normalizeZip(payload.zip_code)),
      country: hashIfPresent(normalizeLower(payload.country || "us")),
      external_id: hashIfPresent(externalId),
      client_ip_address: requestIp || undefined,
      client_user_agent: userAgent || undefined,
      fbp: getCookie(request, "_fbp") || undefined,
      fbc: getFbc(request, eventSourceUrl) || undefined,
    }).filter(([, value]) => value)
  );
}

function buildCustomData(payload: Record<string, unknown>) {
  const excludedKeys = new Set([
    "event_id",
    "email",
    "phone_number",
    "first_name",
    "last_name",
    "city",
    "state",
    "zip_code",
    "country",
    "external_id",
  ]);

  return Object.fromEntries(
    Object.entries(payload).filter(
      ([key, value]) => !excludedKeys.has(key) && value != null && value !== ""
    )
  );
}

async function postFacebookEvent({
  pixelId,
  accessToken,
  event,
  eventData,
}: {
  pixelId: string;
  accessToken: string;
  event: Record<string, unknown>;
  eventData: Record<string, unknown>;
}) {
  const graphApiVersion = process.env.FACEBOOK_GRAPH_API_VERSION?.trim() || defaultGraphApiVersion;
  const url = new URL(`https://graph.facebook.com/${graphApiVersion}/${pixelId}/events`);
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [event],
      ...eventData,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const responseBody = await response.text().catch(() => "");
    throw new Error(`Meta CAPI rejected pixel ${pixelId} with ${response.status}: ${responseBody}`);
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as FacebookEventPayload | null;
  const eventName = normalizeString(body?.event);
  const payload = body?.payload || {};
  const funnelId = normalizeLower(payload.funnel_id);

  if (!allowedEvents.has(eventName)) {
    return NextResponse.json({ ok: true, skipped: "unsupported_event" });
  }

  if (funnelId !== "iul-v4") {
    return NextResponse.json({ ok: true, skipped: "not_iul_v4" });
  }

  const pixelConfigs = getPixelConfigs();
  if (pixelConfigs.length === 0) {
    return NextResponse.json({ ok: true, skipped: "missing_pixel_config" });
  }

  const testEventCode = getTestEventCode();
  const eventData = testEventCode ? { test_event_code: testEventCode } : {};
  const eventSourceUrl = normalizeString(body?.eventSourceUrl) || request.headers.get("referer") || undefined;
  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: normalizeString(payload.event_id) || undefined,
    action_source: "website",
    event_source_url: eventSourceUrl,
    user_data: buildUserData(request, payload, eventSourceUrl),
    custom_data: buildCustomData(payload),
  };

  const results = await Promise.allSettled(
    pixelConfigs.map((config) =>
      postFacebookEvent({
        ...config,
        event,
        eventData,
      })
    )
  );
  const rejected = results.filter((result) => result.status === "rejected");

  if (rejected.length > 0) {
    rejected.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Facebook CAPI event failed", result.reason);
      }
    });
  }

  return NextResponse.json({
    ok: true,
    sent: results.length - rejected.length,
    failed: rejected.length,
  });
}
