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

export function pushGtmEvent(event: string, payload: GtmEventPayload = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...payload,
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
