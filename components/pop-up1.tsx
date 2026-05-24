"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { createEventId, getUtmParams, pushGtmEvent, type GtmEventPayload } from "@/lib/gtm-events";

const defaultPhoneNumber = process.env.NEXT_PUBLIC_PAY_PER_CALL_PHONE_NUMBER || "+18882882203";
const defaultRingbaCampaignId = process.env.NEXT_PUBLIC_RINGBA_CAMPAIGN_ID || "";

type PopUp1Props = {
  open: boolean;
  firstName?: string;
  goal?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  leadId?: string;
  phoneNumber?: string;
  ringbaCampaignId?: string;
  ringbaTags?: Record<string, string>;
  continueUrl?: string;
  onClose?: () => void;
};

function normalizePhoneDigits(value?: string | null) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits;
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

function getRingbaPrintedNumber() {
  if (typeof document === "undefined") return "";

  const phoneNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-popup1-ringba-phone]"));

  for (const node of phoneNodes) {
    const href = node instanceof HTMLAnchorElement ? node.href : "";
    const candidate = normalizePhoneDigits(`${node.textContent || ""} ${href}`);
    if (/^1[2-9]\d{2}[2-9]\d{6}$/.test(candidate)) {
      return candidate;
    }
  }

  return "";
}

function getUrlParams() {
  if (typeof window === "undefined") return {};

  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}

export default function PopUp1({
  open,
  firstName = "",
  goal = "",
  title,
  description,
  primaryLabel = "Sí, hablar con un agente",
  secondaryLabel = "Continuar con mi aplicación",
  leadId = "",
  phoneNumber = defaultPhoneNumber,
  ringbaCampaignId = defaultRingbaCampaignId,
  ringbaTags = {},
  continueUrl = "/thanks/call",
  onClose,
}: PopUp1Props) {
  const primaryLinkRef = useRef<HTMLAnchorElement | null>(null);
  const hasSentPrintedNumberRef = useRef(false);
  const printedNumberRef = useRef("");
  const ringbaScriptUrl = /^CA[a-zA-Z0-9]+$/.test(ringbaCampaignId)
    ? `//b-js.ringba.com/${ringbaCampaignId}`
    : "";

  useEffect(() => {
    if (!open) return;

    const basePhoneNumber = normalizePhoneDigits(phoneNumber);
    const sendPrintedNumber = (printedNumber: string) => {
      if (hasSentPrintedNumberRef.current) return;
      if (!/^1[2-9]\d{2}[2-9]\d{6}$/.test(printedNumber)) return;

      hasSentPrintedNumberRef.current = true;
      printedNumberRef.current = printedNumber;
      primaryLinkRef.current?.setAttribute("href", `tel:+${printedNumber}`);

      try {
        window.sessionStorage.setItem("bf_last_printed_number", printedNumber);
        if (leadId) {
          window.sessionStorage.setItem(`bf_printed_number_${leadId}`, printedNumber);
        }
      } catch {
        // Used only to keep the next page visually consistent with the popup.
      }

      if (!leadId) return;

      const applicationId = getUrlParams().application_number || "";

      void fetch("/api/call-attribution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          applicationId,
          printedNumber,
          page: window.location.pathname || "/",
        }),
        keepalive: true,
      }).catch(() => {
        hasSentPrintedNumberRef.current = false;
      });
    };
    const syncPrimaryPhone = () => {
      const printedNumber = getRingbaPrintedNumber();
      if (!printedNumber || printedNumber === basePhoneNumber) return;

      sendPrintedNumber(printedNumber);
    };

    const observer = new MutationObserver(syncPrimaryPhone);
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });

    const intervalId = window.setInterval(syncPrimaryPhone, 250);
    const timeoutId = window.setTimeout(() => {
      sendPrintedNumber(basePhoneNumber);
      window.clearInterval(intervalId);
      observer.disconnect();
    }, 10000);

    syncPrimaryPhone();

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [leadId, open, phoneNumber]);

  if (!open) return null;

  const serializedRingbaTags = JSON.stringify({
    ...getUrlParams(),
    ...(leadId ? { lead_id: leadId } : {}),
    ...ringbaTags,
  });
  const safeFirstName = firstName.trim();
  const fallbackTitle = safeFirstName
    ? `Hola ${safeFirstName}, tu solicitud está lista.`
    : "Hola, tu solicitud está lista.";
  const normalizedGoal = goal.trim().toLowerCase();
  const goalLabel =
    normalizedGoal === "seguro de vida"
      ? "seguro de vida"
      : normalizedGoal === "ahorrar e invertir"
        ? "ahorrar e invertir"
        : normalizedGoal === "planificación de retiro" ||
            normalizedGoal === "planificacion de retiro"
          ? "planificar tu jubilación"
          : "seguro de vida IUL";
  const fallbackDescription = `Ya tenemos preparada la información relacionada con ${goalLabel} que seleccionaste.`;

  function handleCallClick() {
    const printedNumber = printedNumberRef.current || normalizePhoneDigits(phoneNumber);
    const eventPayload: GtmEventPayload = {
      event_id: createEventId("contact"),
      funnel_id: ringbaTags.funnel_id || "popup",
      lead_id: leadId || undefined,
      external_id: leadId || undefined,
      ringba_phone_number: printedNumber,
      country: "us",
      ...getUtmParams(),
    };

    pushGtmEvent("Contact", eventPayload);
  }

  function handleContinueClick() {
    onClose?.();
    window.location.assign(continueUrl);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
      <Script id="pop-up1-ringba-tags" strategy="afterInteractive">
        {`
          window._rgba_tags = window._rgba_tags || [];
          window._rgba_tags.push(${serializedRingbaTags});
        `}
      </Script>
      {ringbaScriptUrl ? (
        <Script id="pop-up1-ringba-number-pool" src={ringbaScriptUrl} strategy="afterInteractive" />
      ) : null}
      <a
        aria-hidden="true"
        data-popup1-ringba-phone
        href={`tel:${phoneNumber}`}
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        tabIndex={-1}
      >
        {phoneNumber}
      </a>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[420px] rounded-[18px] bg-white p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,0.24)]"
      >
        <div className="mx-auto mb-5 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#18bf79] text-white shadow-[0_14px_28px_rgba(24,191,121,0.28)]">
          <svg
            aria-hidden="true"
            viewBox="0 0 64 64"
            className="h-[34px] w-[34px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M22 29v-8a10 10 0 0 1 18.7-5"
              className="origin-[31px_29px] animate-[unlock-shackle_1.25s_ease-in-out_infinite]"
            />
            <rect x="17" y="29" width="30" height="24" rx="6" />
            <path d="M32 39v5" />
          </svg>
        </div>

        <h2 className="text-[24px] font-black leading-[1.12] tracking-[-0.04em] text-[#101820]">
          {title || fallbackTitle}
        </h2>
        <p className="mt-4 text-[16px] leading-[1.45] text-[#5d6674]">
          {description || fallbackDescription}
        </p>
        <div className="mt-6 grid gap-3">
          <a
            ref={primaryLinkRef}
            data-popup1-ringba-phone
            href={`tel:${phoneNumber}`}
            onClick={handleCallClick}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#16a34a] px-5 text-center text-[16px] font-black leading-none text-white shadow-[0_10px_22px_rgba(22,163,74,0.24)] transition hover:bg-[#12813c]"
          >
            {primaryLabel}
          </a>
          <button
            type="button"
            onClick={handleContinueClick}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[var(--brand)] px-5 text-center text-[16px] font-black leading-none text-white shadow-[0_10px_22px_rgba(45,108,223,0.22)] transition hover:bg-[var(--brand-dark)]"
          >
            {secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
