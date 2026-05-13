import { geolocation, ipAddress, waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";

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

async function postWebhook(url: string, payload: unknown) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}

const PHONE_WINDOW_MS = 6 * 60 * 60 * 1000;
const VELOCITY_WINDOW_MS = 30 * 60 * 1000;
const CLEANUP_EVERY_SUBMISSIONS = 100;
const MAX_TRACKED_KEYS_PER_STORE = 50000;
const deviceCookieName = "bf_iul_device_id";
const phoneAttempts = new Map<string, number[]>();
const ipAttempts = new Map<string, number[]>();
const deviceAttempts = new Map<string, number[]>();
let submissionsSinceCleanup = 0;

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
  const body = (await request.json().catch(() => null)) as LeadPayload | null;

  if (!body?.answers) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const webhookUrl = process.env.IUL_V4?.trim();
  const backupWebhookUrl = process.env.WBK_TEST_URL2?.trim() || process.env.TEST_WEBHOOK_URL_ONLY?.trim();
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
  const payload = {
    submittedAt: new Date().toISOString(),
    source: "better-life-next",
    pagina: body.page || "home",
    ipAddress: requestIp,
    geolocation: geo,
    ...restAnswers,
    phoneNumber: phoneValidation.normalized,
    validation: {
      phoneCountry: "US",
      duplicatePhoneCount,
      ipVelocityCount,
      deviceVelocityCount,
      flags: riskFlags,
    },
  };

  if (!webhookUrl) {
    return NextResponse.json({
      ok: true,
      forwarded: false,
      saved: true,
      payload,
    });
  }

  try {
    if (backupWebhookUrl && backupWebhookUrl !== webhookUrl) {
      waitUntil(
        postWebhook(backupWebhookUrl, payload).then((backupResponse) => {
          if (!backupResponse.ok) {
            throw new Error(`Backup webhook rejected payload with ${backupResponse.status}`);
          }
        }).catch((error) => {
          console.error("Backup webhook failed", error);
        })
      );
    }

    const response = await postWebhook(webhookUrl, payload);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Webhook rejected payload" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      forwarded: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Webhook request failed" },
      { status: 502 }
    );
  }
}
