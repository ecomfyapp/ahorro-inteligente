import { geolocation, ipAddress } from "@vercel/functions";
import { NextResponse } from "next/server";
import { leadTokenCookieName } from "@/app/api/lead-token/route";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type LeadPayload = {
  page?: string;
  answers?: Record<string, unknown>;
  meta?: {
    deviceId?: string;
  };
};

type PhoneValidationResult = {
  isValid: boolean;
  normalized: string;
  flags: string[];
  reason?: string;
};

const PHONE_WINDOW_MS = 6 * 60 * 60 * 1000;
const VELOCITY_WINDOW_MS = 30 * 60 * 1000;
const CLEANUP_EVERY_SUBMISSIONS = 100;
const MAX_TRACKED_KEYS_PER_STORE = 50000;
const deviceCookieName = "bf_iul_device_id";
const phoneAttempts = new Map<string, number[]>();
const ipAttempts = new Map<string, number[]>();
const deviceAttempts = new Map<string, number[]>();
let submissionsSinceCleanup = 0;
const stateAbbreviations: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return false;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

function hasValidLeadToken(request: Request) {
  const headerToken = request.headers.get("x-lead-token")?.trim();
  const cookieToken = getRequestCookie(request, leadTokenCookieName).trim();

  return !!headerToken && !!cookieToken && headerToken === cookieToken;
}

function pruneAndCount(store: Map<string, number[]>, key: string, windowMs: number, now: number) {
  const recent = (store.get(key) || []).filter((timestamp) => now - timestamp <= windowMs);
  recent.push(now);
  store.set(key, recent);
  return recent.length;
}

function pruneStore(store: Map<string, number[]>, windowMs: number, now: number) {
  for (const [key, timestamps] of store) {
    const recent = timestamps.filter((timestamp) => now - timestamp <= windowMs);

    if (recent.length === 0) {
      store.delete(key);
    } else {
      store.set(key, recent);
    }
  }

  if (store.size <= MAX_TRACKED_KEYS_PER_STORE) return;

  const oldestFirst = [...store.entries()]
    .map(([key, timestamps]) => ({
      key,
      latest: Math.max(...timestamps),
    }))
    .sort((a, b) => a.latest - b.latest);
  const keysToDelete = store.size - MAX_TRACKED_KEYS_PER_STORE;

  for (let index = 0; index < keysToDelete; index += 1) {
    store.delete(oldestFirst[index].key);
  }
}

function maybePruneAttemptStores(now: number) {
  submissionsSinceCleanup += 1;

  if (submissionsSinceCleanup < CLEANUP_EVERY_SUBMISSIONS) return;

  submissionsSinceCleanup = 0;
  pruneStore(phoneAttempts, PHONE_WINDOW_MS, now);
  pruneStore(ipAttempts, VELOCITY_WINDOW_MS, now);
  pruneStore(deviceAttempts, VELOCITY_WINDOW_MS, now);
}

function getRequestCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) return "";

  return decodeURIComponent(cookie.slice(name.length + 1));
}

function normalizeUsPhone(value: unknown) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  return digits;
}

function normalizeString(value: unknown) {
  return String(value || "").trim();
}

function normalizeState(value: unknown) {
  const state = normalizeString(value);
  if (/^[A-Za-z]{2}$/.test(state)) return state.toUpperCase();
  return stateAbbreviations[state] || "";
}

function normalizeZipCode(value: unknown) {
  return String(value || "").replace(/\D/g, "").slice(0, 5);
}

function getFunnelId(page?: string) {
  const normalizedPage = normalizeString(page).replace(/^\/+/, "");
  return normalizedPage || "home";
}

function isSequential(digits: string) {
  return digits === "0123456789" || digits === "1234567890" || digits === "9876543210";
}

function isRepeatingPattern(digits: string) {
  return /^(\d)\1{9}$/.test(digits) || /^(\d{2})\1{4}$/.test(digits) || /^(\d{5})\1$/.test(digits);
}

function validateUsPhone(value: unknown): PhoneValidationResult {
  const normalized = normalizeUsPhone(value);
  const flags: string[] = [];

  if (normalized.length !== 10) {
    return {
      isValid: false,
      normalized,
      flags: ["invalid_length"],
      reason: "Ingresa un numero valido de EE.UU. con 10 digitos.",
    };
  }

  const areaCode = normalized.slice(0, 3);
  const exchange = normalized.slice(3, 6);

  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(normalized)) {
    return {
      isValid: false,
      normalized,
      flags: ["invalid_nanp"],
      reason: "Ingresa un numero movil o residencial valido de EE.UU.",
    };
  }

  if (areaCode.endsWith("11") || exchange.endsWith("11")) {
    flags.push("service_code_pattern");
  }

  if (areaCode === "555" || exchange === "555") {
    flags.push("fictional_555");
  }

  if (isSequential(normalized)) {
    flags.push("sequential_digits");
  }

  if (isRepeatingPattern(normalized)) {
    flags.push("repeating_digits");
  }

  const zeroCount = normalized.split("").filter((digit) => digit === "0").length;
  if (zeroCount >= 7) {
    flags.push("too_many_zeros");
  }

  const tail = normalized.slice(4);
  if (/^12345|23456|34567|45678|56789|67890$/.test(tail)) {
    flags.push("synthetic_tail");
  }

  if (flags.length > 0) {
    return {
      isValid: false,
      normalized,
      flags,
      reason: "Ingresa un numero real de EE.UU. Evita secuencias o numeros de ejemplo.",
    };
  }

  return { isValid: true, normalized, flags };
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request) || !hasValidLeadToken(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as LeadPayload | null;

  if (!body?.answers) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server credentials are not configured" },
      { status: 500 }
    );
  }

  const geo = geolocation(request);
  const requestIp =
    ipAddress(request) ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const phoneValidation = validateUsPhone(body.answers.phoneNumber);
  const deviceId = String(body.meta?.deviceId || getRequestCookie(request, deviceCookieName)).trim();
  const now = Date.now();
  maybePruneAttemptStores(now);
  const duplicatePhoneCount = phoneValidation.normalized
    ? pruneAndCount(phoneAttempts, phoneValidation.normalized, PHONE_WINDOW_MS, now)
    : 0;
  const ipVelocityCount = requestIp !== "unknown"
    ? pruneAndCount(ipAttempts, requestIp, VELOCITY_WINDOW_MS, now)
    : 0;
  const deviceVelocityCount = deviceId
    ? pruneAndCount(deviceAttempts, deviceId, VELOCITY_WINDOW_MS, now)
    : 0;
  const cleanedAnswers = Object.fromEntries(
    Object.entries(body.answers).filter(([, value]) => value !== "" && value != null)
  );
  const riskFlags = [
    ...phoneValidation.flags,
    ...(duplicatePhoneCount >= 3 ? ["duplicate_phone"] : []),
    ...(ipVelocityCount >= 6 ? ["high_velocity_ip"] : []),
    ...(deviceVelocityCount >= 4 ? ["high_velocity_device"] : []),
  ];

  if (!phoneValidation.isValid) {
    return NextResponse.json(
      {
        error: phoneValidation.reason || "Ingresa un numero valido de EE.UU.",
        riskFlags,
      },
      { status: 422 }
    );
  }

  const restAnswers = Object.fromEntries(
    Object.entries(cleanedAnswers).filter(([key]) => key !== "phoneNumber")
  );
  const submittedAt = new Date().toISOString();
  const funnelId = getFunnelId(body.page);
  const state = normalizeState(restAnswers.state);
  const zipCode = normalizeZipCode(restAnswers.zipCode);
  const lead = {
    submittedAt,
    source: "best-money-next",
    pagina: body.page || "home",
    funnelId,
    ipAddress: requestIp,
    geolocation: geo,
    ...restAnswers,
    state,
    zipCode,
    phoneNumber: phoneValidation.normalized,
    validation: {
      phoneCountry: "US",
      duplicatePhoneCount,
      ipVelocityCount,
      deviceVelocityCount,
      flags: riskFlags,
    },
  };
  const tableName = process.env.SUPABASE_LEADS_TABLE?.trim() || "leads";
  const { data, error } = await supabase
    .from(tableName)
    .insert({
      funnel_id: funnelId,
      age_group: normalizeString(restAnswers.ageGroup),
      insurance_goal: normalizeString(restAnswers.insuranceGoal),
      state,
      zip_code: zipCode,
      first_name: normalizeString(restAnswers.firstName),
      last_name: normalizeString(restAnswers.lastName),
      phone_number: phoneValidation.normalized,
      email: normalizeString(restAnswers.email),
      lead_status: "pending_call",
      payload: lead,
    })
    .select("lead_id")
    .single();

  if (error) {
    console.error("Supabase lead insert failed", error);
    return NextResponse.json(
      { error: "No pudimos guardar el lead en Supabase" },
      { status: 502 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    saved: true,
    leadId: data?.lead_id ?? null,
  });

  response.cookies.delete(leadTokenCookieName);
  return response;
}
