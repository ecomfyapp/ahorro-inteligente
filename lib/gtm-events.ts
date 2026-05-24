import { pageview, track } from "@vercel/analytics";

export type GtmEventPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: GtmEventPayload[];
  }
}

export function createEventId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const iulV4StepEvents: Record<string, string> = {
  age: "v4_step1_age",
  goal: "v4_step2_goal",
  state: "v4_step3_zip",
  name: "v4_step4_name",
  phone: "v4_step5_contact",
};

function trackVercelVirtualPage(name: string) {
  pageview({
    route: `/iul-v4/${name}`,
    path: `/iul-v4/${name}`,
  });
}

function getVercelFunnelProperties(event: string, payload: GtmEventPayload) {
  if (payload.funnel_id !== "iul-v4") return null;

  return {
    event,
    funnel_id: "iul-v4",
    step: typeof payload.step === "string" ? payload.step : undefined,
    step_number: typeof payload.step_number === "number" ? payload.step_number : undefined,
    country: typeof payload.country === "string" ? payload.country : undefined,
    state: typeof payload.state === "string" ? payload.state : undefined,
    lead_id_present: Boolean(payload.lead_id || payload.external_id),
  };
}

function trackVercelFunnelEvent(event: string, payload: GtmEventPayload) {
  const properties = getVercelFunnelProperties(event, payload);
  if (!properties) return;

  if (event === "PageView" || event === "ViewContent") {
    const stepEvent = typeof payload.step === "string" ? iulV4StepEvents[payload.step] : undefined;
    if (stepEvent) {
      track(stepEvent, properties);
      trackVercelVirtualPage(stepEvent);
    }
    return;
  }

  if (event === "Lead") {
    track("v4_lead_submitted", properties);
    trackVercelVirtualPage("v4_lead_submitted");
    return;
  }

  if (event === "Contact") {
    track("v4_contact_click", properties);
    trackVercelVirtualPage("v4_contact_click");
  }
}

export function pushGtmEvent(event: string, payload: GtmEventPayload = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...payload,
  });

  trackVercelFunnelEvent(event, payload);

  if (!["PageView", "ViewContent", "Lead", "Contact"].includes(event)) return;

  const facebookEventPayload = JSON.stringify({
    event,
    payload,
    eventSourceUrl: window.location.href,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/facebook-events",
      new Blob([facebookEventPayload], { type: "application/json" }),
    );
    return;
  }

  void fetch("/api/facebook-events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: facebookEventPayload,
    keepalive: true,
  }).catch(() => {
    // Facebook CAPI should never block the funnel.
  });
}

export function getUtmParams() {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const utmPayload: GtmEventPayload = {};

  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((key) => {
    const value = params.get(key);
    if (value) utmPayload[key] = value;
  });

  return utmPayload;
}

export function trackVercelIulV4VirtualPage(
  name: string,
  properties: GtmEventPayload = {},
) {
  if (typeof window === "undefined") return;

  track(name, {
    funnel_id: "iul-v4",
    ...properties,
  });
  pageview({
    route: `/iul-v4/${name}`,
    path: `/iul-v4/${name}`,
  });
}
