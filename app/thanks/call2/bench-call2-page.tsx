"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildApplicationNumber } from "@/lib/application-number";
import { createEventId, getUtmParams, pushGtmEvent } from "@/lib/gtm-events";

const fallbackPhoneNumber = process.env.NEXT_PUBLIC_PAY_PER_CALL_PHONE_NUMBER || "+18882882203";
const fallbackRingbaCampaignId = process.env.NEXT_PUBLIC_RINGBA_CAMPAIGN_ID || "";

type BenchCall2PageProps = {
  funnelId?: string;
  ageGroup?: string;
  insuranceGoal?: string;
  leadId?: string;
  firstName?: string;
  applicationNumber?: string;
  phoneNumber?: string;
  ringbaCampaignId?: string;
};

const benefits = [
  "Protección para tu familia",
  "Pago de hipoteca",
  "Mensualidades para tus seres queridos",
  "Beneficios para jubilación",
  "Acumulación de cash value",
  "Apoyo económico en vida",
  "Gastos finales y protección familiar",
];

function normalizePhoneDigits(value?: string | null) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits;
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

function formatPhone(value: string) {
  const digits = normalizePhoneDigits(value);
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length !== 10) return fallbackPhoneNumber;
  return `+1 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}

function getVisiblePrintedPhoneNumber() {
  if (typeof document === "undefined") return "";

  const phoneNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-call2-ringba-phone]"));

  for (const node of phoneNodes) {
    const href = node instanceof HTMLAnchorElement ? node.href : "";
    const candidate = normalizePhoneDigits(`${node.textContent || ""} ${href}`);
    if (/^1[2-9]\d{2}[2-9]\d{6}$/.test(candidate)) return candidate;
  }

  return "";
}

function getGoalLabel(goal: string) {
  const normalized = goal.trim().toLowerCase();
  if (normalized === "ahorrar e invertir") return "ahorro e inversión";
  if (normalized === "planificación de retiro" || normalized === "planificacion de retiro") {
    return "planificación para tu jubilación";
  }
  if (normalized === "no estoy seguro aún" || normalized === "no estoy seguro aun") {
    return "seguro de vida IUL";
  }
  return normalized || "seguro de vida IUL";
}

export default function BenchCall2Page({
  funnelId = "",
  ageGroup = "",
  insuranceGoal = "",
  leadId = "",
  firstName = "",
  applicationNumber = "",
  phoneNumber = fallbackPhoneNumber,
  ringbaCampaignId = fallbackRingbaCampaignId,
}: BenchCall2PageProps) {
  const resolvedPhoneNumber = phoneNumber || fallbackPhoneNumber;
  const resolvedRingbaCampaignId = ringbaCampaignId || fallbackRingbaCampaignId;
  const [printedNumber, setPrintedNumber] = useState(() => normalizePhoneDigits(resolvedPhoneNumber));
  const [secondsLeft, setSecondsLeft] = useState(180);
  const hasSentPrintedNumberRef = useRef(false);
  const basePhoneNumber = normalizePhoneDigits(resolvedPhoneNumber);
  const ringbaScriptUrl = /^CA[a-zA-Z0-9]+$/.test(resolvedRingbaCampaignId)
    ? `//b-js.ringba.com/${resolvedRingbaCampaignId}`
    : "";
  const resolvedApplicationNumber = applicationNumber || buildApplicationNumber(leadId);
  const safeFirstName = firstName.trim();
  const goalLabel = getGoalLabel(insuranceGoal);
  const telHref = `tel:+${printedNumber || basePhoneNumber}`;
  const phoneDisplay = formatPhone(printedNumber || basePhoneNumber);
  const ringbaTags = useMemo(
    () =>
      JSON.stringify({
        ...Object.fromEntries(new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").entries()),
        funnel_id: funnelId,
        call2_age_group: ageGroup,
        call2_insurance_goal: insuranceGoal,
        lead_id: leadId,
      }),
    [ageGroup, funnelId, insuranceGoal, leadId],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!leadId) return;

    try {
      const storedNumber =
        window.sessionStorage.getItem(`bf_printed_number_${leadId}`) ||
        window.sessionStorage.getItem("bf_last_printed_number");

      if (storedNumber) {
        setPrintedNumber(normalizePhoneDigits(storedNumber));
      }
    } catch {
      // Ringba can still replace the visible number below.
    }
  }, [leadId]);

  useEffect(() => {
    const sendPrintedNumber = (nextPrintedNumber: string) => {
      if (hasSentPrintedNumberRef.current) return;
      if (!/^1[2-9]\d{2}[2-9]\d{6}$/.test(nextPrintedNumber)) return;

      hasSentPrintedNumberRef.current = true;
      setPrintedNumber(nextPrintedNumber);

      try {
        window.sessionStorage.setItem("bf_last_printed_number", nextPrintedNumber);
        if (leadId) window.sessionStorage.setItem(`bf_printed_number_${leadId}`, nextPrintedNumber);
      } catch {
        // Best effort only.
      }

      if (!leadId) return;

      void fetch("/api/call-attribution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          applicationId: resolvedApplicationNumber,
          printedNumber: nextPrintedNumber,
          page: "/thanks/call2",
        }),
        keepalive: true,
      }).catch(() => {
        hasSentPrintedNumberRef.current = false;
      });
    };

    const syncPrintedNumber = () => {
      const nextPrintedNumber = getVisiblePrintedPhoneNumber();
      if (!nextPrintedNumber || nextPrintedNumber === basePhoneNumber) return;
      sendPrintedNumber(nextPrintedNumber);
    };

    const observer = new MutationObserver(syncPrintedNumber);
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });

    const intervalId = window.setInterval(syncPrintedNumber, 250);
    const timeoutId = window.setTimeout(() => {
      sendPrintedNumber(normalizePhoneDigits(printedNumber || basePhoneNumber));
      window.clearInterval(intervalId);
      observer.disconnect();
    }, 10000);

    syncPrintedNumber();

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [basePhoneNumber, leadId, printedNumber, resolvedApplicationNumber]);

  const trackContactClick = () => {
    pushGtmEvent("Contact", {
      event_id: createEventId("contact"),
      lead_id: leadId || undefined,
      external_id: leadId || undefined,
      funnel_id: funnelId || "iul-v4",
      ringba_phone_number: printedNumber || basePhoneNumber,
      country: "us",
      ...getUtmParams(),
    });
  };

  return (
    <main className="min-h-screen bg-white text-[#101820]">
      <Script id="ringba-call2-tags" strategy="afterInteractive">
        {`
          window._rgba_tags = window._rgba_tags || [];
          window._rgba_tags.push(${ringbaTags});
        `}
      </Script>
      {ringbaScriptUrl ? (
        <Script id="ringba-call2-number-pool" src={ringbaScriptUrl} strategy="afterInteractive" />
      ) : null}

      <header className="border-b border-[#eef2f7] bg-white">
        <div className="mx-auto flex h-[64px] max-w-[980px] items-center justify-center px-4">
          <Image
            src="/media/better-life-logo.png"
            alt="Better Life"
            width={180}
            height={48}
            priority
            className="h-auto w-[150px]"
          />
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[560px] flex-col px-5 py-7 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#18bf79] text-white shadow-[0_12px_26px_rgba(24,191,121,0.24)]">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <p className="mt-5 text-[14px] font-black uppercase tracking-[0.08em] text-[var(--brand)]">
          Beneficios preaprobados
        </p>
        <h1 className="mt-2 text-[26px] font-black leading-[1.12] md:text-[34px]">
          {safeFirstName ? `${safeFirstName}, tu aplicación está lista` : "Tu aplicación está lista"}
        </h1>
        <p className="mx-auto mt-4 max-w-[440px] text-[16px] leading-[1.5] text-[#5d6674]">
          Para continuar, es importante que tengas a la mano el nombre de la persona que deseas dejar como beneficiaria, en caso de que ya no estés.
        </p>

        <div className="mt-6 rounded-[18px] bg-[#10203a] px-4 py-5 text-white shadow-[0_16px_36px_rgba(16,32,58,0.18)]">
          <p className="text-[13px] font-black uppercase tracking-[0.08em] text-white/65">
            Agente esperando en la línea
          </p>
          <a
            data-call2-ringba-phone
            href={telHref}
            onClick={trackContactClick}
            className="mt-2 block text-[clamp(2rem,8vw,2.7rem)] font-black"
          >
            {phoneDisplay}
          </a>
          <a
            data-call2-ringba-phone
            href={telHref}
            onClick={trackContactClick}
            className="mt-4 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#16a34a] px-6 text-[18px] font-black text-white shadow-[0_12px_26px_rgba(22,163,74,0.25)] transition hover:bg-[#12813c]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.97 18.33C21.97 18.69 21.89 19.06 21.72 19.42C21.55 19.78 21.33 20.12 21.04 20.44C20.55 20.98 20.01 21.37 19.4 21.62C18.8 21.87 18.15 22 17.45 22C16.43 22 15.34 21.76 14.19 21.27C13.04 20.78 11.89 20.12 10.75 19.29C9.6 18.45 8.51 17.52 7.47 16.49C6.44 15.45 5.51 14.36 4.68 13.22C3.86 12.08 3.2 10.94 2.72 9.81C2.24 8.67 2 7.58 2 6.54C2 5.86 2.12 5.21 2.36 4.61C2.6 4 2.98 3.44 3.51 2.94C4.15 2.31 4.85 2 5.59 2C5.87 2 6.15 2.06 6.4 2.18C6.66 2.3 6.89 2.48 7.07 2.74L9.39 6.01C9.57 6.26 9.7 6.49 9.79 6.71C9.88 6.92 9.93 7.13 9.93 7.32C9.93 7.56 9.86 7.8 9.72 8.03C9.59 8.26 9.4 8.5 9.16 8.74L8.4 9.53C8.29 9.64 8.24 9.77 8.24 9.93C8.24 10.01 8.25 10.08 8.27 10.16C8.3 10.24 8.33 10.3 8.35 10.36C8.53 10.69 8.84 11.12 9.28 11.64C9.73 12.16 10.21 12.69 10.73 13.22C11.27 13.75 11.79 14.24 12.32 14.69C12.84 15.13 13.27 15.43 13.61 15.61C13.66 15.63 13.72 15.66 13.79 15.69C13.87 15.72 13.95 15.73 14.04 15.73C14.21 15.73 14.34 15.67 14.45 15.56L15.21 14.81C15.46 14.56 15.7 14.37 15.93 14.25C16.16 14.11 16.39 14.04 16.64 14.04C16.83 14.04 17.03 14.08 17.25 14.17C17.47 14.26 17.7 14.39 17.95 14.56L21.26 16.91C21.52 17.09 21.7 17.3 21.81 17.55C21.91 17.8 21.97 18.05 21.97 18.33Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeMiterlimit="10"
              />
            </svg>
            Llamar ahora
          </a>
        </div>

        <p className={`mt-5 text-[15px] font-black ${secondsLeft === 0 ? "text-[#e05b24]" : "text-[#273449]"}`}>
          {secondsLeft === 0
            ? "Tu aplicación está por expirar."
            : `Tu aplicación finaliza en ${secondsLeft} segundos.`}
        </p>

        <div className="mt-5 border-y border-[#dde7f4] py-5">
          <p className="text-[13px] font-black uppercase tracking-[0.08em] text-[#6b7280]">
            ID de aplicación
          </p>
          <p className="mt-1 text-[24px] font-black text-[#101820]">
            {resolvedApplicationNumber}
          </p>
          <p className="mt-2 text-[13px] font-semibold text-[#e05b24]">
            Usa este identificador para reclamar tus beneficios
          </p>
        </div>

        <div className="mt-5 rounded-[16px] border border-[#d9e6fb] bg-[#f7fbff] px-4 py-4 text-left">
          <p className="text-[15px] font-black text-[#101820]">
            También podrías calificar para beneficios como:
          </p>
          <div className="mt-3 grid gap-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-2 text-[14px] font-semibold leading-[1.35] text-[#273449]">
                <span className="text-[#18bf79]">✓</span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mx-auto mt-5 max-w-[420px] text-[12px] leading-[1.45] text-[#7b8494]">
          Un agente licenciado revisará contigo los detalles de {goalLabel}. La llamada es gratuita y sin compromiso.
        </p>
      </section>
    </main>
  );
}
