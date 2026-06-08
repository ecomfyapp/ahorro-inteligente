"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import PopUp1 from "@/components/pop-up1";
import { buildApplicationNumber } from "@/lib/application-number";
import { createEventId, getUtmParams, pushGtmEvent, trackVercelIulV4VirtualPage } from "@/lib/gtm-events";
import { inferUsZipFromStateAndPhone } from "@/lib/infer-us-zip";

const questionnaireSecuritySeals = [
  {
    src: "/media/busines-acredited-bbb.avif",
    alt: "BBB Accredited Business",
    width: 112,
    height: 38,
  },
  {
    src: "/media/secure-form-better-life.png",
    alt: "Secure Form",
    width: 136,
    height: 32,
  },
  {
    src: "/media/ssl-encription.avif",
    alt: "SSL Encryption",
    width: 112,
    height: 38,
  },
];

const introBenefits = [
  {
    icon: "📈",
    title: "Ahorro con Interés Compuesto",
    description: "Maximiza tus fondos con rendimientos de hasta el 9.5% anual.",
  },
  {
    icon: "🚫",
    title: "Retiros Libres de Impuestos",
    description: "Accede a tu dinero para el retiro sin pagar impuestos al IRS.",
  },
  {
    icon: "🏦",
    title: "Liquidez Inmediata",
    description: "Solicita préstamos usando tu póliza como garantía cuando quieras.",
  },
  {
    icon: "🛡️",
    title: "Protección Contra Caídas",
    description: "Tu ahorro está seguro (Piso 0%) aunque el mercado caiga.",
  },
  {
    icon: "🏥",
    title: "Beneficios en Vida",
    description: "Usa tus fondos en caso de una enfermedad crítica o emergencia grave.",
  },
];

const ageOptions = ["25 a 34", "35 a 44", "45 a 54", "55 a 65", "65+"];
const goalOptions = [
  "Seguro de vida",
  "Ahorrar e invertir",
  "Planificación de retiro",
  "No estoy seguro aún",
];
const stateOptions = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
  "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "District of Columbia",
];
const stateAbbreviations: Record<string, string> = {
  Alabama: "al",
  Alaska: "ak",
  Arizona: "az",
  Arkansas: "ar",
  California: "ca",
  Colorado: "co",
  Connecticut: "ct",
  Delaware: "de",
  Florida: "fl",
  Georgia: "ga",
  Hawaii: "hi",
  Idaho: "id",
  Illinois: "il",
  Indiana: "in",
  Iowa: "ia",
  Kansas: "ks",
  Kentucky: "ky",
  Louisiana: "la",
  Maine: "me",
  Maryland: "md",
  Massachusetts: "ma",
  Michigan: "mi",
  Minnesota: "mn",
  Mississippi: "ms",
  Missouri: "mo",
  Montana: "mt",
  Nebraska: "ne",
  Nevada: "nv",
  "New Hampshire": "nh",
  "New Jersey": "nj",
  "New Mexico": "nm",
  "New York": "ny",
  "North Carolina": "nc",
  "North Dakota": "nd",
  Ohio: "oh",
  Oklahoma: "ok",
  Oregon: "or",
  Pennsylvania: "pa",
  "Rhode Island": "ri",
  "South Carolina": "sc",
  "South Dakota": "sd",
  Tennessee: "tn",
  Texas: "tx",
  Utah: "ut",
  Vermont: "vt",
  Virginia: "va",
  Washington: "wa",
  "West Virginia": "wv",
  Wisconsin: "wi",
  Wyoming: "wy",
  "District of Columbia": "dc",
};

type FunnelStep =
  | "intro"
  | "age"
  | "goal"
  | "state"
  | "name"
  | "phone"
  | "email"
  | "rejected"
  | "success";

type FunnelAnswers = {
  zipCode: string;
  locationText: string;
  ageGroup: string;
  insuranceGoal: string;
  state: string;
  firstName: string;
  lastName: string;
  phoneCountry: string;
  phoneNumber: string;
  email: string;
  detectedState: string;
};

type PhoneValidationStatus = "idle" | "validating" | "valid" | "invalid";

type ZipLookupResponse = {
  location?: string | null;
  state?: string | null;
  zipCode?: string | null;
  source?: "zippopotam" | "vercel-ip" | "fallback";
  fallback?: boolean;
};

type RuntimeConfig = {
  payPerCallStatus: string;
  payPerCallStartTime: string;
  payPerCallEndTime: string;
  payPerCallPhoneNumber: string;
  ringbaCampaignId: string;
};

const stepOrder: FunnelStep[] = [
  "intro",
  "age",
  "goal",
  "state",
  "name",
  "phone",
  "success",
];

const emptyAnswers: FunnelAnswers = {
  zipCode: "",
  locationText: "",
  ageGroup: "",
  insuranceGoal: "",
  state: "",
  firstName: "",
  lastName: "",
  phoneCountry: "US",
  phoneNumber: "",
  email: "",
  detectedState: "",
};

const deviceStorageKey = "better-life-device-id";
const deviceCookieName = "bf_iul_device_id";
const trustedFormScriptId = "trustedform-certify-sdk";
const trustedFormFieldName = process.env.NEXT_PUBLIC_TRUSTEDFORM_FIELD || "xxTrustedFormCertUrl";
const defaultRuntimeConfig = {
  payPerCallStatus: "OFF",
  payPerCallStartTime: "",
  payPerCallEndTime: "",
  payPerCallPhoneNumber: "",
  ringbaCampaignId: "",
};
const deviceCookieDurationDays = 15;
const ageRejectedCookieName = "bf_age_rejected";
const ageRejectedCookieDurationDays = 90;
const ageRejectedHash = "#no-califica";
const blockedStateName = "New York";

const thankYouHighlights = [
  {
    title: "Acceso Sin Penalidades",
    description: "Usa tu dinero cuando lo necesites, sin restricciones",
  },
  {
    title: "Estrategia de los Ricos",
    description: "El secreto financiero que el 95% de personas desconoce",
  },
];

const thankYouCallSteps = [
  {
    title: "El número puede ser desconocido",
    description:
      "Trabajamos con asesores en todo el país. El código de área puede variar. ¡Contéstala!",
    icon: "bolt",
  },
  {
    title: "Se presentará con nombre completo",
    description:
      "Tu asesor confirmará tu solicitud y se identificará. Es 100% profesional y gratuito.",
    icon: "user",
  },
  {
    title: "Busca un lugar tranquilo",
    description:
      "La llamada es rápida - solo 10 a 15 minutos para ver tu precio exacto.",
    icon: "focus",
  },
];

const thankYouInfoList = [
  {
    title: "Datos Personales",
    description: "Fecha de nacimiento, estado civil, ocupación",
  },
  {
    title: "Salud General",
    description: "Altura, peso, medicamentos, historial básico",
  },
  {
    title: "Ingresos & Objetivos",
    description: "Ingresos anuales, metas a 10-20 años",
  },
  {
    title: "Protección Deseada",
    description: "¿Cuánto necesita tu familia? (10-15x tu ingreso)",
  },
  {
    title: "Beneficiarios",
    description: "Nombres de quienes deseas proteger",
  },
];

const thankYouFaqs = [
  {
    title: "¿Si no contesto la llamada?",
    description:
      "Intentaremos contactarte 2-3 veces en diferentes horarios del día.",
  },
  {
    title: "¿Hay algún costo?",
    description:
      "No. La consulta es 100% gratuita y sin ningún compromiso de compra.",
  },
  {
    title: "¿Necesito mucho dinero?",
    description:
      "No. Tenemos planes desde $100 hasta $5,000+ mensuales, adaptados a tu presupuesto.",
  },
  {
    title: "¿Aplica para residentes?",
    description:
      "Sí. Muchos planes están disponibles independientemente del requisitos de residencia. Tu asesor te explicará las opciones.",
  },
];

function formatPhoneDigits(value: string) {
  const digits = normalizeUsPhoneInput(value);
  const chunks = [];
  if (digits.length > 0) chunks.push(digits.slice(0, 3));
  if (digits.length > 3) chunks.push(digits.slice(3, 6));
  if (digits.length > 6) chunks.push(digits.slice(6, 10));
  return chunks.join(" ");
}

function normalizeUsPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }

  if (digits.length > 10 && digits.startsWith("1")) {
    return digits.slice(1, 11);
  }

  return digits.slice(0, 10);
}

function getOrCreateDeviceId() {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(deviceStorageKey);
  if (existing) {
    setDeviceCookie(existing);
    return existing;
  }

  const newId = `bm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(deviceStorageKey, newId);
  setDeviceCookie(newId);
  return newId;
}

function getTrustedFormCertUrl() {
  if (typeof document === "undefined") return "";

  const field = document.getElementsByName(trustedFormFieldName)[0] as HTMLInputElement | undefined;
  return field?.value?.trim() || "";
}

function getAdAccountNameParam() {
  if (typeof window === "undefined") return "";

  return new URLSearchParams(window.location.search).get("adaccount_name")?.trim() || "";
}

function setDeviceCookie(deviceId: string) {
  if (typeof document === "undefined" || !deviceId) return;

  const maxAge = deviceCookieDurationDays * 24 * 60 * 60;
  document.cookie = `${deviceCookieName}=${encodeURIComponent(deviceId)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

function hasAgeRejectedCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .includes(`${ageRejectedCookieName}=true`);
}

function setAgeRejectedCookie() {
  if (typeof document === "undefined") return;

  const maxAge = ageRejectedCookieDurationDays * 24 * 60 * 60;
  document.cookie = `${ageRejectedCookieName}=true; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

function getPhoneValidationMessage(value: string) {
  const digits = normalizeUsPhoneInput(value);

  if (digits.length !== 10) {
    return "Ingresa un número válido de EE.UU. con 10 dígitos.";
  }

  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) {
    return "Ingresa un número real de EE.UU.";
  }

  return "";

  if (
    digits === "0123456789" ||
    digits === "1234567890" ||
    digits === "9876543210" ||
    /^(\d)\1{9}$/.test(digits) ||
    /^(\d{2})\1{4}$/.test(digits) ||
    /^(\d{5})\1$/.test(digits) ||
    digits.split("").filter((digit) => digit === "0").length >= 7 ||
    digits.slice(0, 3) === "555" ||
    digits.slice(3, 6) === "555"
  ) {
    return "Ingresa un número real de EE.UU. Evita secuencias o números de ejemplo.";
  }

  return "";
}

function isValidEmail(value: string) {
  return value.trim().length > 0;
}

function normalizeZipCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 5);
}

function getZipValidationMessage(value: string) {
  const zipCode = normalizeZipCode(value);

  if (zipCode.length !== 5) {
    return "Ingresa un ZIP code valido de EE.UU. con 5 digitos.";
  }

  return "";
}

function isResolvedUsZip(
  data: ZipLookupResponse | null,
  requestedZipCode: string
) {
  return (
    !!data &&
    data.source === "zippopotam" &&
    data.fallback === false &&
    data.zipCode === requestedZipCode &&
    !!data.state &&
    stateOptions.includes(data.state)
  );
}

function isBlockedState(state?: string | null) {
  return state === blockedStateName;
}

function buildLocationBackup(state?: string | null, phone?: string | null) {
  const inferred = inferUsZipFromStateAndPhone(state, phone);
  return {
    zipCode: inferred.zipCode,
    locationText: inferred.location,
    state: inferred.state || state || "",
  };
}

function optionButtonClass(isSelected: boolean, isRecommended = false) {
  return [
    "flex min-h-[62px] w-full items-center rounded-[16px] border bg-white px-5 text-left text-[17px] tracking-[-0.03em] text-[#101820] shadow-[0_4px_10px_rgba(16,24,32,0.08)] transition",
    isSelected
      ? "border-[var(--brand)] bg-[#f3f8ff] shadow-[0_0_0_1px_var(--brand),0_8px_18px_rgba(26,115,232,0.12)]"
      : isRecommended
        ? "border-[#9ec5ff] bg-[#f7fbff] shadow-[0_0_0_1px_rgba(26,115,232,0.18),0_4px_10px_rgba(16,24,32,0.08)] hover:border-[#78adff]"
        : "border-[#9c9c9c] hover:border-[#6f6f6f]",
  ].join(" ");
}

function NextArrowIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="none"
      className={className}
    >
      <line
        x1="40"
        y1="128"
        x2="216"
        y2="128"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
      />
      <polyline
        points="144 56 216 128 144 200"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
      />
    </svg>
  );
}

function FinalArrowIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="none"
      className={className}
    >
      <path
        d="M219.53563,121.02,50.62075,26.42762A8,8,0,0,0,39.178,36.09836l31.86106,89.211a8,8,0,0,1,0,5.38138L39.178,219.90164a8,8,0,0,0,11.44277,9.67074l168.91488-94.59233A8,8,0,0,0,219.53563,121.02Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
      />
      <line
        x1="72"
        y1="128"
        x2="136"
        y2="128"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
      />
    </svg>
  );
}

function BackArrowIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M15.632 22.577l-9.225-9.562a1.439 1.439 0 01-.301-.466 1.48 1.48 0 01.301-1.566l9.225-9.562c.26-.27.613-.421.98-.421.368 0 .72.151.98.42.26.27.407.636.407 1.017 0 .38-.146.746-.406 1.016L9.346 12l8.248 8.547c.26.27.406.635.406 1.016s-.146.747-.406 1.016c-.26.27-.613.421-.98.421-.368 0-.72-.151-.98-.42l-.002-.003z"
        fill="currentColor"
      />
    </svg>
  );
}

function FilledCheckIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="m8 12.4 2.4 2.4L16.4 9"
        stroke="#fff"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BadgeCheckIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="currentColor" />
      <path
        d="m7.4 12.3 2.7 2.8 6.4-6.5"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M7.2 4.8c.5-.5 1.3-.6 1.9-.2l2.1 1.4c.7.4.9 1.3.5 2L10.7 10c-.2.4-.1.8.1 1.1.7 1.2 1.7 2.2 2.9 2.9.3.2.8.2 1.1.1l2.1-1.1c.7-.4 1.6-.2 2 .5l1.4 2.1c.4.6.3 1.4-.2 1.9l-1 1c-.9.9-2.2 1.3-3.4 1-2.6-.7-5.1-2.2-7.2-4.3-2.1-2.1-3.6-4.6-4.3-7.2-.3-1.2.1-2.5 1-3.4l1-1Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 4.5a4 4 0 0 1 4 4v2.1c0 .7.2 1.4.6 2l1.1 1.7c.5.8-.1 1.7-1 1.7H7.3c-.9 0-1.5-.9-1-1.7l1.1-1.7c.4-.6.6-1.3.6-2V8.5a4 4 0 0 1 4-4Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 18a2.3 2.3 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BoltIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M13.4 2 6.8 12h4l-1.2 10L16.2 12h-4.1L13.4 2Z" />
    </svg>
  );
}

function UserIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="8" r="3.2" fill="currentColor" />
      <path
        d="M5.5 18.5c1.6-2.7 4-4 6.5-4s4.9 1.3 6.5 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FocusIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9.5" cy="10" r="1" fill="currentColor" />
      <circle cx="14.5" cy="10" r="1" fill="currentColor" />
      <path
        d="M8.8 14.2c.9.9 1.9 1.3 3.2 1.3 1.3 0 2.3-.4 3.2-1.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClipboardIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <rect x="6" y="4.5" width="12" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 4.5h6v3H9z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 11h6M9 15h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function QuestionIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M9.5 9a2.5 2.5 0 1 1 4.1 1.9c-.9.7-1.6 1.3-1.6 2.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="17.5" r="1" fill="currentColor" />
    </svg>
  );
}

function PhonePadIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <rect x="4.5" y="2.5" width="15" height="19" rx="3" fill="#6b4eff" />
      <rect x="8" y="5.5" width="2.2" height="2.2" rx=".4" fill="#ff9b44" />
      <rect x="11" y="5.5" width="2.2" height="2.2" rx=".4" fill="#ffd84d" />
      <rect x="14" y="5.5" width="2.2" height="2.2" rx=".4" fill="#4dd7ff" />
      <rect x="8" y="9" width="2.2" height="2.2" rx=".4" fill="#ffd84d" />
      <rect x="11" y="9" width="2.2" height="2.2" rx=".4" fill="#4dd7ff" />
      <rect x="14" y="9" width="2.2" height="2.2" rx=".4" fill="#ff9b44" />
      <rect x="8" y="12.5" width="2.2" height="2.2" rx=".4" fill="#4dd7ff" />
      <rect x="11" y="12.5" width="2.2" height="2.2" rx=".4" fill="#ff9b44" />
      <rect x="14" y="12.5" width="2.2" height="2.2" rx=".4" fill="#ffd84d" />
    </svg>
  );
}

function DialFingerIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <path d="M1.875 1.5a.375.375 0 1 0 .375.375.375.375 0 0 0-.375-.375h0" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="7.125" y1="1.5" x2="7.125" y2="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M7.125 1.5a.375.375 0 1 0 .375.375.375.375 0 0 0-.375-.375" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="12.375" y1="1.5" x2="12.375" y2="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M12.375 1.5a.375.375 0 1 0 .375.375.375.375 0 0 0-.375-.375" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="1.875" y1="6.75" x2="1.875" y2="6.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M1.875 6.75a.375.375 0 1 0 .375.375.375.375 0 0 0-.375-.375" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="7.125" y1="6.75" x2="7.125" y2="6.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M7.125 6.75a.375.375 0 1 0 .375.375.375.375 0 0 0-.375-.375" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="1.875" y1="12" x2="1.875" y2="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M1.875 12a.375.375 0 1 0 .375.375A.375.375 0 0 0 1.875 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <line x1="7.125" y1="12" x2="7.125" y2="12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M7.125 12a.375.375 0 1 0 .375.375A.375.375 0 0 0 7.125 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M6.75 22.5l-1.9-3.327A2.263 2.263 0 0 1 8.7 16.8l1.8 2.7V8.25a2.25 2.25 0 0 1 4.5 0V16.5h3.379A4.332 4.332 0 0 1 22.5 20.847V22.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 317.855 317.855" className={className} fill="currentColor">
      <path d="M158.929 317.855c-1.029 0-2.059-.159-3.051-.477-33.344-10.681-61.732-31.168-84.377-60.891-17.828-23.401-32.103-52.526-42.426-86.566C11.661 112.506 11.461 61.358 11.461 59.209c0-5.15 3.912-9.459 9.039-9.954.772-.075 78.438-8.048 132.553-47.347 3.504-2.546 8.249-2.543 11.753.001C218.906 41.207 296.582 49.18 297.36 49.256c5.123.5 9.034 4.807 9.034 9.953 0 2.149-.2 53.297-17.613 110.713-10.324 34.04-24.598 63.165-42.426 86.566-22.644 29.723-51.032 50.21-84.376 60.891-.992.317-2.021.476-3.05.476zM31.748 67.982c.831 16.784 4.062 55.438 16.604 96.591 21.405 70.227 58.601 114.87 110.576 132.746 52.096-17.916 89.335-62.711 110.713-133.202 12.457-41.074 15.653-79.434 16.472-96.134-22.404-3.269-80.438-14.332-127.186-45.785C112.175 53.648 54.153 64.713 31.748 67.982z" />
      <path d="M153.582 207.625c-2.372 0-4.68-.844-6.499-2.4l-36.163-30.926c-4.197-3.589-4.69-9.901-1.101-14.099 3.588-4.198 9.901-4.692 14.099-1.101l28.124 24.051 55.743-73.118c3.348-4.392 9.622-5.24 14.015-1.89 4.393 3.348 5.238 9.623 1.89 14.015l-62.155 81.53c-1.667 2.187-4.16 3.591-6.895 3.882-.353.037-.706.056-1.058.056z" />
    </svg>
  );
}

function StatisticGrowIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M22 5v5a1 1 0 0 1-2 0V7.41l-5.29 5.3a1 1 0 0 1-1.16.18l-5.29-2.64-4.49 5.39A1 1 0 0 1 3 16a1 1 0 0 1-.64-.23 1 1 0 0 1-.13-1.41l5-6a1 1 0 0 1 1.22-.25l5.35 2.67L18.59 6H16a1 1 0 0 1 0-2h5a1 1 0 0 1 .38.08 1 1 0 0 1 .54.54A1 1 0 0 1 22 5ZM21 18H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2Z" />
    </svg>
  );
}

function RetirementPlanIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M21 6.25C21 4.455 19.545 3 17.75 3H6.25C4.455 3 3 4.455 3 6.25v11.5C3 19.545 4.455 21 6.25 21h5.772a6.45 6.45 0 0 1-.709-1.5H6.25A1.75 1.75 0 0 1 4.5 17.75V8.5h15v2.814c.534.172 1.037.411 1.5.708V6.25ZM6.25 4.5h11.5a1.75 1.75 0 0 1 1.75 1.75V7h-15v-.75A1.75 1.75 0 0 1 6.25 4.5Z" />
      <path d="M23 17.5a5.5 5.5 0 1 0-11 0 5.5 5.5 0 0 0 11 0Zm-5.5 0h2a.5.5 0 0 1 0 1H17a.5.5 0 0 1-.5-.491V15a.5.5 0 0 1 1 0v2.5Z" />
    </svg>
  );
}

function UnsureIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M12 13c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <line x1="12" y1="13" x2="12" y2="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M12 17v.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function PhoneStatusIcon({ status }: { status: PhoneValidationStatus }) {
  if (status === "validating") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px] animate-spin text-[#94a3b8]"
        fill="none"
      >
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="3" opacity="0.24" />
        <path d="M20 12a8 8 0 0 0-8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (status === "valid") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-[20px] w-[20px] text-[#16a34a]"
        fill="none"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="m7.8 12.2 2.6 2.6 5.8-6" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === "invalid") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-[20px] w-[20px] text-[#dc2626]"
        fill="none"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="m8.5 8.5 7 7M15.5 8.5l-7 7" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      </svg>
    );
  }

  return null;
}

function parseTimeToMinutes(value: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;

  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function getNewYorkMinutes() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;

  return hour * 60 + minute;
}

function isWithinTimeWindow(current: number, start: number, end: number) {
  if (start === end) return true;
  if (start < end) return current >= start && current < end;
  return current >= start || current < end;
}

function isPayPerCallWindowOpen(config: RuntimeConfig) {
  if (config.payPerCallStatus !== "ON") return false;

  const start = parseTimeToMinutes(config.payPerCallStartTime);
  const end = parseTimeToMinutes(config.payPerCallEndTime);
  const current = getNewYorkMinutes();

  if (start == null || end == null || current == null) return false;

  return isWithinTimeWindow(current, start, end);
}

function lowerGtmValue(value?: string | null) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized || undefined;
}

function getGtmState(value?: string | null) {
  const state = String(value || "").trim();
  if (/^[A-Za-z]{2}$/.test(state)) return state.toLowerCase();
  return stateAbbreviations[state] || lowerGtmValue(state);
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<FunnelStep>(() =>
    hasAgeRejectedCookie() ? "rejected" : "age",
  );
  const [, setSlideDirection] = useState<"forward" | "backward">("forward");
  const [panelKey, setPanelKey] = useState(0);
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);
  const [answers, setAnswers] = useState<FunnelAnswers>(emptyAnswers);
  const [defaultLocationText, setDefaultLocationText] = useState(emptyAnswers.locationText);
  const [isLookingUpZip, setIsLookingUpZip] = useState(false);
  const [hasLoadedGeo, setHasLoadedGeo] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [zipError, setZipError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [isPhoneValidating, setIsPhoneValidating] = useState(false);
  const [hasBlurredPhone, setHasBlurredPhone] = useState(false);
  const [leadToken, setLeadToken] = useState("");
  const [isPayPerCallPopupOpen, setIsPayPerCallPopupOpen] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState("");
  const [submittedContinueUrl, setSubmittedContinueUrl] = useState("");
  const [submittedFirstName, setSubmittedFirstName] = useState("");
  const [submittedInsuranceGoal, setSubmittedInsuranceGoal] = useState("");
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeConfig>(defaultRuntimeConfig);
  const transitionTimeoutRef = useRef<number | null>(null);
  const phoneValidationTimeoutRef = useRef<number | null>(null);
  const trackedStepsRef = useRef<Set<string>>(new Set());
  const trackedAutoZipRef = useRef(false);
  const submittedLeadRef = useRef(false);
  const runtimeConfigRef = useRef<RuntimeConfig>(defaultRuntimeConfig);

  const isSuccessPage = currentStep === "success";
  const isRejectedPage = currentStep === "rejected";
  const isQuestionnaire = currentStep !== "intro" && !isRejectedPage;
  const successHash = "#gracias";
  const recommendedAgeOption = answers.ageGroup ? "" : "35 a 44";
  const recommendedGoalOption = answers.insuranceGoal ? "" : "Ahorrar e invertir";
  const detectedUsState = stateOptions.includes(answers.detectedState)
    ? answers.detectedState
    : "";
  const resolvedUsState = stateOptions.includes(answers.state) ? answers.state : "";
  const shouldAskZipCode = !resolvedUsState && !detectedUsState;
  const visibleQuestionSteps = shouldAskZipCode
    ? (["age", "goal", "state", "name", "phone"] as FunnelStep[])
    : (["age", "goal", "name", "phone"] as FunnelStep[]);
  const currentQuestionIndex = visibleQuestionSteps.indexOf(currentStep);
  const progressLabel =
    currentQuestionIndex >= 0
      ? `${currentQuestionIndex + 1} de ${visibleQuestionSteps.length}`
      : "";
  const progress =
    currentQuestionIndex >= 0
      ? ((currentQuestionIndex + 1) / visibleQuestionSteps.length) * 100
      : null;
  const animationClass = isTransitioningOut
    ? "animate-[survey-question-out_0.18s_cubic-bezier(0.4,0,1,1)_forwards]"
    : "animate-[survey-question-in_0.42s_cubic-bezier(0.22,0.61,0.36,1)]";

  const normalizedPhone = normalizeUsPhoneInput(answers.phoneNumber);
  const shouldShowPhoneValidation = normalizedPhone.length >= 10 || (hasBlurredPhone && normalizedPhone.length > 0);
  const livePhoneValidationMessage = shouldShowPhoneValidation
    ? getPhoneValidationMessage(normalizedPhone)
    : "";
  const phoneValidationStatus: PhoneValidationStatus = !shouldShowPhoneValidation
    ? "idle"
    : isPhoneValidating
      ? "validating"
      : livePhoneValidationMessage
        ? "invalid"
        : "valid";
  const phoneBorderClass =
    phoneValidationStatus === "invalid" || phoneError
      ? "border-[#e11d48] focus:border-[#e11d48]"
      : phoneValidationStatus === "valid"
        ? "border-[#16a34a] focus:border-[#16a34a]"
        : "border-[#9c9c9c] focus:border-[var(--brand)]";
  const visiblePhoneError =
    phoneValidationStatus === "validating"
      ? ""
      : phoneError || (phoneValidationStatus === "invalid" ? livePhoneValidationMessage : "");

  function getGtmLeadPayload() {
    const location = answers.locationText || defaultLocationText || "";
    const city = location.split(",")[0]?.trim() || "";
    const state = answers.state || answers.detectedState;

    return {
      funnel_id: "iul-v4",
      step: currentStep,
      country: "us",
      state: getGtmState(state),
      zip_code: answers.zipCode || undefined,
      city: lowerGtmValue(city),
      location: lowerGtmValue(location),
      age_group: lowerGtmValue(answers.ageGroup),
      insurance_goal: lowerGtmValue(answers.insuranceGoal),
      first_name: lowerGtmValue(answers.firstName),
      last_name: lowerGtmValue(answers.lastName),
      phone_number: normalizedPhone || undefined,
      email: lowerGtmValue(answers.email),
      ...getUtmParams(),
    };
  }

  useEffect(() => {
    if (hasAgeRejectedCookie()) {
      setCurrentStep("rejected");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadRuntimeConfig() {
      try {
        const response = await fetch("/api/runtime-config", { cache: "no-store" });
        if (!response.ok) return;

        const config = (await response.json()) as Partial<RuntimeConfig>;
        const nextConfig = {
          ...defaultRuntimeConfig,
          ...Object.fromEntries(
            Object.entries(config).filter(([, value]) => typeof value === "string" && value.trim()),
          ),
        } as RuntimeConfig;

        if (!isMounted) return;
        runtimeConfigRef.current = nextConfig;
        setRuntimeConfig(nextConfig);
      } catch {
        // Keep deploy-time fallbacks if runtime config is temporarily unavailable.
      }
    }

    void loadRuntimeConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
      if (phoneValidationTimeoutRef.current !== null) {
        window.clearTimeout(phoneValidationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (phoneValidationTimeoutRef.current !== null) {
      window.clearTimeout(phoneValidationTimeoutRef.current);
      phoneValidationTimeoutRef.current = null;
    }

    if (!shouldShowPhoneValidation) {
      setIsPhoneValidating(false);
      setPhoneError("");
      return;
    }

    setIsPhoneValidating(true);
    phoneValidationTimeoutRef.current = window.setTimeout(() => {
      phoneValidationTimeoutRef.current = null;
      setIsPhoneValidating(false);
      setPhoneError(getPhoneValidationMessage(normalizedPhone));
    }, 420);

    return () => {
      if (phoneValidationTimeoutRef.current !== null) {
        window.clearTimeout(phoneValidationTimeoutRef.current);
        phoneValidationTimeoutRef.current = null;
      }
    };
  }, [normalizedPhone, shouldShowPhoneValidation]);

  useEffect(() => {
    if (isRejectedPage || currentQuestionIndex < 0) return;

    const trackingKey = `${currentQuestionIndex}:${currentStep}`;
    if (trackedStepsRef.current.has(trackingKey)) return;

    trackedStepsRef.current.add(trackingKey);
    pushGtmEvent(currentQuestionIndex === 0 ? "PageView" : "ViewContent", {
      ...getGtmLeadPayload(),
      event_id: createEventId(currentQuestionIndex === 0 ? "pageview" : "viewcontent"),
      step_number: currentQuestionIndex + 1,
    });
  }, [
    currentQuestionIndex,
    currentStep,
    isRejectedPage,
    answers.state,
    answers.detectedState,
    answers.zipCode,
    answers.ageGroup,
    answers.insuranceGoal,
    answers.firstName,
    answers.lastName,
    answers.email,
    normalizedPhone,
  ]);

  useEffect(() => {
    if (document.getElementById(trustedFormScriptId)) return;

    const trustedFormScript = document.createElement("script");
    trustedFormScript.id = trustedFormScriptId;
    trustedFormScript.type = "text/javascript";
    trustedFormScript.async = true;
    trustedFormScript.src = `${window.location.protocol}//api.trustedform.com/trustedform.js?field=${encodeURIComponent(
      trustedFormFieldName,
    )}&use_tagged_consent=true&l=${Date.now()}${Math.random()}`;

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(trustedFormScript, firstScript);
  }, []);

  useEffect(() => {
    if (isRejectedPage) return;

    let isCancelled = false;

    async function hydrateAreaFromIp() {
      try {
        const response = await fetch("/api/location", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as {
          location?: string;
          zipCode?: string | null;
          state?: string | null;
        };

        if (isCancelled || !data.location) return;

        const detectedState = data.state && stateOptions.includes(data.state) ? data.state : "";
        const detectedZip = data.zipCode && /^\d{5}$/.test(data.zipCode) ? data.zipCode : "";
        const backup = detectedState ? buildLocationBackup(detectedState) : null;
        const resolvedZipCode = detectedZip || backup?.zipCode || "";
        const resolvedLocationText = data.location || backup?.locationText || emptyAnswers.locationText;

        if (isBlockedState(detectedState)) {
          rejectByNewYork();
          return;
        }

        setDefaultLocationText((prev) => prev || resolvedLocationText);
        setAnswers((prev) => ({
          ...prev,
          zipCode: prev.zipCode || resolvedZipCode,
          locationText: prev.locationText || resolvedLocationText,
          state: prev.state || detectedState || backup?.state || "",
          detectedState: prev.detectedState || detectedState,
        }));
      } catch {
        // The ZIP step is the fallback if Vercel geolocation is unavailable.
      } finally {
        if (!isCancelled) setHasLoadedGeo(true);
      }
    }

    void hydrateAreaFromIp();

    return () => {
      isCancelled = true;
    };
  }, [isRejectedPage]);

  useEffect(() => {
    if (isRejectedPage) return;
    if (!hasLoadedGeo) return;

    const zipCode = answers.zipCode;

    if (zipCode.length === 0) {
      setAnswers((prev) => ({ ...prev, locationText: defaultLocationText }));
      setIsLookingUpZip(false);
      return;
    }

    if (zipCode.length < 5) {
      setAnswers((prev) => ({
        ...prev,
        locationText: defaultLocationText,
        state: prev.detectedState || "",
      }));
      setIsLookingUpZip(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLookingUpZip(true);

        const response = await fetch(`/api/zip/${zipCode}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          setAnswers((prev) => ({
            ...prev,
            locationText: defaultLocationText,
            state: prev.state || prev.detectedState,
          }));
          return;
        }

        const data = (await response.json()) as ZipLookupResponse;

        if (isResolvedUsZip(data, zipCode)) {
          if (isBlockedState(data.state)) {
            rejectByNewYork();
            return;
          }

          setAnswers((prev) => ({
            ...prev,
            locationText: data.location || defaultLocationText,
            state: data.state || prev.state || prev.detectedState,
          }));
          return;
        }

        setAnswers((prev) => ({
          ...prev,
          locationText: defaultLocationText,
          state: prev.detectedState || "",
        }));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setAnswers((prev) => ({
            ...prev,
            locationText: defaultLocationText,
            state: prev.detectedState || "",
          }));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLookingUpZip(false);
        }
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [answers.zipCode, defaultLocationText, hasLoadedGeo, isRejectedPage]);

  useEffect(() => {
    const guardSuccessHash = () => {
      if (hasAgeRejectedCookie()) {
        setCurrentStep("rejected");
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${ageRejectedHash}`);
        return;
      }

      if (window.location.hash !== successHash) return;
      if (currentStep === "success") return;

      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      setCurrentStep("age");
      setPanelKey((prev) => prev + 1);
    };

    guardSuccessHash();
    window.addEventListener("hashchange", guardSuccessHash);
    return () => window.removeEventListener("hashchange", guardSuccessHash);
  }, [currentStep, successHash]);

  useEffect(() => {
    if (!isRejectedPage) return;

    const rejectedUrl = `${window.location.pathname}${window.location.search}${ageRejectedHash}`;
    if (window.location.hash !== ageRejectedHash) {
      window.history.replaceState({ bfAgeRejected: true }, "", rejectedUrl);
    }

    const keepRejectedView = () => {
      if (!hasAgeRejectedCookie()) return;
      setCurrentStep("rejected");
      if (window.location.hash !== ageRejectedHash) {
        window.history.replaceState({ bfAgeRejected: true }, "", rejectedUrl);
      }
    };

    window.addEventListener("popstate", keepRejectedView);
    window.addEventListener("hashchange", keepRejectedView);
    return () => {
      window.removeEventListener("popstate", keepRejectedView);
      window.removeEventListener("hashchange", keepRejectedView);
    };
  }, [isRejectedPage]);

  useEffect(() => {
    if (isRejectedPage) return;
    if (currentStep !== "state" || shouldAskZipCode) return;
    if (!trackedAutoZipRef.current) {
      trackedAutoZipRef.current = true;
      trackVercelIulV4VirtualPage("v4_step3_zip", {
        step: "state",
        step_number: 3,
        zip_detected: true,
        country: "us",
        state: getGtmState(resolvedUsState || detectedUsState),
        zip_code: answers.zipCode || undefined,
      });
    }
    transitionTo("name", "forward");
  }, [answers.zipCode, currentStep, detectedUsState, isRejectedPage, resolvedUsState, shouldAskZipCode]);

  function transitionTo(nextStep: FunnelStep, direction: "forward" | "backward") {
    if (isRejectedPage || hasAgeRejectedCookie()) {
      setCurrentStep("rejected");
      return;
    }

    setSlideDirection(direction);
    setIsTransitioningOut(true);
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
    }
    transitionTimeoutRef.current = window.setTimeout(() => {
      setCurrentStep(nextStep);
      setPanelKey((prev) => prev + 1);
      setSubmitError("");
      setIsTransitioningOut(false);
      transitionTimeoutRef.current = null;
    }, 170);
  }

  function goBack() {
    if (isRejectedPage || hasAgeRejectedCookie()) {
      setCurrentStep("rejected");
      return;
    }

    if (currentStep === "age") {
      return;
    }

    if (currentStep === "name" && !shouldAskZipCode) {
      transitionTo("goal", "backward");
      return;
    }

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex <= 0) return;
    transitionTo(stepOrder[currentIndex - 1], "backward");
  }

  function startQuestionnaire() {
    if (hasAgeRejectedCookie()) {
      setCurrentStep("rejected");
      return;
    }

    transitionTo("age", "forward");
  }

  function rejectByAge() {
    setAgeRejectedCookie();

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    setAnswers((prev) => ({ ...prev, ageGroup: "65+" }));
    setSubmitError("");
    setPhoneError("");
    setEmailError("");
    setZipError("");
    setIsSubmittingLead(false);
    setIsLookingUpZip(false);
    setIsTransitioningOut(false);
    setCurrentStep("rejected");
    setPanelKey((prev) => prev + 1);
    window.history.replaceState(
      { bfAgeRejected: true },
      "",
      `${window.location.pathname}${window.location.search}${ageRejectedHash}`,
    );
    window.location.replace("/iul-v4/rechazo");
  }

  function rejectByNewYork() {
    setAgeRejectedCookie();

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    setSubmitError("");
    setPhoneError("");
    setEmailError("");
    setZipError("");
    setIsSubmittingLead(false);
    setIsLookingUpZip(false);
    setIsTransitioningOut(false);
    setCurrentStep("rejected");
    setPanelKey((prev) => prev + 1);
    window.history.replaceState(
      { bfAgeRejected: true },
      "",
      `${window.location.pathname}${window.location.search}${ageRejectedHash}`,
    );
    window.location.replace("/iul-v4/rechazo");
  }

  function handleDirectChoice<K extends keyof FunnelAnswers>(
    field: K,
    value: FunnelAnswers[K],
    nextStep: FunnelStep
  ) {
    if (isRejectedPage || hasAgeRejectedCookie()) {
      setCurrentStep("rejected");
      return;
    }

    if (field === "ageGroup" && value === "65+") {
      rejectByAge();
      return;
    }

    if (field === "insuranceGoal" && nextStep === "name" && !trackedAutoZipRef.current) {
      trackedAutoZipRef.current = true;
      trackVercelIulV4VirtualPage("v4_step3_zip", {
        step: "state",
        step_number: 3,
        zip_detected: true,
        country: "us",
        state: getGtmState(resolvedUsState || detectedUsState),
        zip_code: answers.zipCode || undefined,
      });
    }

    setAnswers((prev) => ({ ...prev, [field]: value }));
    window.setTimeout(() => {
      transitionTo(nextStep, "forward");
    }, 120);
  }

  async function handleZipCodeContinue() {
    if (isRejectedPage || hasAgeRejectedCookie()) {
      setCurrentStep("rejected");
      return;
    }

    const zipCode = normalizeZipCode(answers.zipCode);
    const zipValidationMessage = getZipValidationMessage(zipCode);

    if (zipValidationMessage) {
      setZipError(zipValidationMessage);
      return;
    }

    setZipError("");
    setIsLookingUpZip(true);

    try {
      const response = await fetch(`/api/zip/${zipCode}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Ingresa un ZIP code real de EE.UU.");
      }

      const data = (await response.json()) as ZipLookupResponse;

      if (!isResolvedUsZip(data, zipCode)) {
        throw new Error("Ingresa un ZIP code real de EE.UU.");
      }

      if (isBlockedState(data.state)) {
        rejectByNewYork();
        return;
      }

      setAnswers((prev) => ({
        ...prev,
        zipCode,
        locationText: data.location || defaultLocationText,
        state: data.state || prev.state,
      }));

      transitionTo("name", "forward");
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "No pudimos validar ese ZIP code. Intenta otro.";

      setAnswers((prev) => ({
        ...prev,
        zipCode,
        locationText: defaultLocationText,
        state: prev.detectedState || "",
      }));
      setZipError(message);
    } finally {
      setIsLookingUpZip(false);
    }
  }

  async function prepareLeadToken() {
    if (leadToken) return leadToken;

    const tokenResponse = await fetch("/api/lead-token", { cache: "no-store" });

    if (!tokenResponse.ok) {
      throw new Error("No pudimos preparar el envio seguro. Intenta nuevamente.");
    }

    const tokenBody = (await tokenResponse.json().catch(() => null)) as { token?: string } | null;
    const nextLeadToken = tokenBody?.token;

    if (!nextLeadToken) {
      throw new Error("No pudimos preparar el envio seguro. Intenta nuevamente.");
    }

    setLeadToken(nextLeadToken);
    return nextLeadToken;
  }

  async function handleNameContinue() {
    if (!answers.firstName.trim() || !answers.lastName.trim()) return;

    setSubmitError("");
    transitionTo("phone", "forward");

    try {
      await prepareLeadToken();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "No pudimos preparar el envio seguro. Intenta nuevamente.";
      setSubmitError(message);
    }
  }

  async function submitLead() {
    if (isRejectedPage || hasAgeRejectedCookie()) {
      setCurrentStep("rejected");
      return;
    }

    if (!answers.firstName.trim() || !answers.lastName.trim()) return;

    const phoneValidationMessage = getPhoneValidationMessage(normalizedPhone);
    if (phoneValidationMessage) {
      setPhoneError(phoneValidationMessage);
      return;
    }

    if (!isValidEmail(answers.email)) {
      setEmailError("Por favor, ingresa tu correo.");
      return;
    }

    setPhoneError("");
    setEmailError("");
    setSubmitError("");

    if (submittedLeadRef.current || submittedLeadId) {
      if (isPayPerCallWindowOpen(runtimeConfigRef.current)) {
        setIsPayPerCallPopupOpen(true);
        return;
      }

      const fallbackParams = new URLSearchParams(window.location.search);
      fallbackParams.set("funnel_id", "iul-v4");
      if (submittedLeadId) {
        fallbackParams.set("lead_id", submittedLeadId);
      }
      const fallbackSearch = fallbackParams.toString() ? `?${fallbackParams.toString()}` : "";
      window.location.assign(`/thanks/lead${fallbackSearch}`);
      return;
    }

    setIsSubmittingLead(true);

    try {
      let resolvedZipCode = answers.zipCode;
      let resolvedLocationText = answers.locationText || defaultLocationText;
      let resolvedState = answers.state || answers.detectedState;

      if (!resolvedState || !resolvedZipCode || !resolvedLocationText) {
        try {
          const locationResponse = await fetch("/api/location", { cache: "no-store" });

          if (locationResponse.ok) {
            const locationData = (await locationResponse.json()) as {
              location?: string;
              zipCode?: string | null;
              state?: string | null;
            };

            if (!resolvedState && locationData.state && stateOptions.includes(locationData.state)) {
              resolvedState = locationData.state;
            }

            if (!resolvedZipCode && locationData.zipCode && /^\d{5}$/.test(locationData.zipCode)) {
              resolvedZipCode = locationData.zipCode;
            }

            if (!resolvedLocationText && locationData.location) {
              resolvedLocationText = locationData.location;
            }
          }
        } catch {
          // Continue to deterministic backups below.
        }
      }

      if (resolvedState && (!resolvedZipCode || !resolvedLocationText)) {
        const backup = buildLocationBackup(resolvedState, normalizedPhone);
        resolvedZipCode = resolvedZipCode || backup.zipCode;
        resolvedLocationText = resolvedLocationText || backup.locationText;
        resolvedState = resolvedState || backup.state;
      }

      if (resolvedZipCode && (!resolvedState || !resolvedLocationText)) {
        try {
          const zipResponse = await fetch(`/api/zip/${resolvedZipCode}`, { cache: "no-store" });
          if (zipResponse.ok) {
            const zipData = (await zipResponse.json()) as ZipLookupResponse;
            if (isResolvedUsZip(zipData, resolvedZipCode)) {
              resolvedState = resolvedState || zipData.state || "";
              resolvedLocationText = resolvedLocationText || zipData.location || "";
            }
          }
        } catch {
          // Keep any already resolved backup values.
        }
      }

      if (!resolvedState || !resolvedZipCode || !resolvedLocationText) {
        setSubmitError("Necesitamos confirmar tu estado para completar la solicitud.");
        transitionTo("state", "backward");
        return;
      }

      const completedAnswers = {
        ...answers,
        zipCode: resolvedZipCode,
        locationText: resolvedLocationText,
        state: resolvedState,
        detectedState: answers.detectedState || resolvedState,
      };
      const hasCompleteLeadData = [
        completedAnswers.ageGroup,
        completedAnswers.insuranceGoal,
        completedAnswers.state,
        completedAnswers.firstName.trim(),
        completedAnswers.lastName.trim(),
        normalizedPhone,
        completedAnswers.email.trim(),
        completedAnswers.locationText,
        completedAnswers.zipCode,
      ].every(Boolean);

      if (!hasCompleteLeadData) {
        setSubmitError("Necesitamos completar tu ubicaciÃ³n para enviar la solicitud.");
        transitionTo("state", "backward");
        return;
      }

      setAnswers(completedAnswers);

      const cleanedAnswers = Object.fromEntries(
        Object.entries({
          ageGroup: completedAnswers.ageGroup,
          insuranceGoal: completedAnswers.insuranceGoal,
          state: completedAnswers.state,
          firstName: completedAnswers.firstName.trim(),
          lastName: completedAnswers.lastName.trim(),
          phoneNumber: normalizedPhone,
          email: completedAnswers.email.trim(),
          locationText: completedAnswers.locationText,
          zipCode: completedAnswers.zipCode,
        }).filter(([, value]) => value !== "" && value != null)
      );
      const preparedLeadToken = await prepareLeadToken();
      const activeRuntimeConfig = runtimeConfigRef.current;
      const shouldUsePayPerCallThankYou = isPayPerCallWindowOpen(activeRuntimeConfig);

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-lead-token": preparedLeadToken,
        },
        body: JSON.stringify({
          page: "/iul-v4",
          answers: cleanedAnswers,
          meta: {
            deviceId: getOrCreateDeviceId(),
            trustedFormCertUrl: getTrustedFormCertUrl(),
            salePath: shouldUsePayPerCallThankYou ? "call" : "lead",
            adaccount_name: getAdAccountNameParam(),
          },
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorBody?.error || "No pudimos enviar tu solicitud ahora mismo.");
      }

      const responseBody = (await response.json().catch(() => null)) as {
        leadId?: string;
      } | null;
      const leadId = responseBody?.leadId;
      submittedLeadRef.current = true;
      const leadEventId = createEventId("lead");
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.set("funnel_id", "iul-v4");
      if (leadId) {
        nextParams.set("lead_id", leadId);
      }
      nextParams.set("first_name", completedAnswers.firstName.trim());
      nextParams.set("insurance_goal", completedAnswers.insuranceGoal);
      nextParams.set("application_number", buildApplicationNumber(leadId));
      if (activeRuntimeConfig.payPerCallPhoneNumber) {
        nextParams.set("ppc_phone", activeRuntimeConfig.payPerCallPhoneNumber);
      }
      if (activeRuntimeConfig.ringbaCampaignId) {
        nextParams.set("ringba_campaign_id", activeRuntimeConfig.ringbaCampaignId);
      }

      const nextSearch = nextParams.toString() ? `?${nextParams.toString()}` : "";

      pushGtmEvent("Lead", {
        ...getGtmLeadPayload(),
        event_id: leadEventId,
        lead_id: leadId,
        external_id: leadId,
      });

      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${nextSearch}${successHash}`,
      );
      setLeadToken("");

      if (shouldUsePayPerCallThankYou) {
        setSubmittedLeadId(leadId || "");
        setSubmittedFirstName(completedAnswers.firstName.trim());
        setSubmittedInsuranceGoal(completedAnswers.insuranceGoal);
        setSubmittedContinueUrl(`/thanks/call2${nextSearch}`);
        setIsPayPerCallPopupOpen(true);
        return;
      }

      window.location.assign(`/thanks/lead${nextSearch}`);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "No pudimos enviar tu solicitud ahora mismo. Intenta nuevamente.";
      setSubmitError(message);
    } finally {
      setIsSubmittingLead(false);
    }
  }

  function renderProgress() {
    if (progress == null) {
      return <div className="h-[8px] w-full max-w-[300px]" />;
    }

    return (
      <div className="relative w-full max-w-[300px] overflow-hidden rounded-full bg-[#d9d9d9]">
        <div
          className="h-[8px] rounded-full bg-[var(--brand)] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
        {visibleQuestionSteps.slice(1).map((_, index) => (
          <span
            key={index}
            aria-hidden="true"
            className="absolute top-0 h-full w-px bg-white/55"
            style={{ left: `${((index + 1) / visibleQuestionSteps.length) * 100}%` }}
          />
        ))}
      </div>
    );
  }

  function renderRejectedPage() {
    return (
      <section
        className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-[760px] items-center justify-center px-4 py-10 text-center"
        style={{ fontFamily: '"Montserrat", "HurmeGeo", Arial, sans-serif' }}
      >
        <div className="w-full rounded-[18px] border border-[#dbe7f5] bg-white px-6 py-10 shadow-[0_18px_45px_rgba(18,31,53,0.12)] md:px-10 md:py-12">
          <div className="mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#eef6ff] text-[var(--brand)]">
            <ShieldCheckIcon className="h-[28px] w-[28px]" />
          </div>
          <h1 className="mx-auto mt-6 max-w-[560px] text-[28px] font-extrabold leading-[1.14] tracking-[-0.04em] text-[#101820] md:text-[40px]">
            Gracias por tu interes
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] text-[17px] leading-[1.55] text-[#5d6674] md:text-[19px]">
            Actualmente este beneficio no esta disponible para tu grupo de edad.
            Si en el futuro abrimos nuevas opciones, nos encantara ayudarte a revisarlas.
          </p>
        </div>
      </section>
    );
  }

  function renderIntroPanel() {
    return (
      <div
        className="mx-auto flex w-full max-w-[980px] animate-[fade-up_0.55s_ease-out] flex-col items-center"
        style={{ fontFamily: '"Montserrat", "HurmeGeo", Arial, sans-serif' }}
      >
        <div className="w-full max-w-[800px] px-[10px] py-[10px]">
          <div className="text-center">
            <h1 className="mx-auto max-w-[330px] text-[31px] leading-[1.34] font-semibold text-[#0d2b5b] md:max-w-none md:text-[52px] md:leading-[1.14] md:font-extrabold">
              <span className="block">Plan Financiero de</span>
              <span className="relative mt-1 inline-block text-[0.86em] leading-[1.12] md:text-[1em]">
                <span className="relative z-10">Crecimiento Indexado</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 260 28"
                  preserveAspectRatio="none"
                  className="absolute -right-[2%] -bottom-[0.2em] -left-[2%] h-[0.5em] w-[104%]"
                >
                  <path
                    d="M5 15 C 40 19, 75 12, 110 15 C 145 18, 182 12, 220 15 C 232 16, 243 14, 255 13"
                    stroke="#ef4444"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                  />
                  <path
                    d="M7 18 C 38 21, 72 15, 108 18 C 145 20, 180 14, 217 17 C 229 17, 241 16, 252 15"
                    stroke="#f87171"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.65"
                    strokeDasharray="2.2 2.8"
                  />
                  <path
                    d="M10 13 C 42 16, 75 10, 111 13 C 148 16, 184 10, 220 13"
                    stroke="#dc2626"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.55"
                    strokeDasharray="1.5 3.2"
                  />
                </svg>
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-[340px] border-b-2 border-[#f1f5f9] pb-[15px] text-[13px] leading-[1.2] text-[#64748b] md:max-w-none md:text-[18px]">
              Exclusivo para residentes de 22 a 50 años
            </p>
          </div>

          <div className="mt-[15px] grid gap-[15px]">
            {introBenefits.map((benefit) => (
              <button
                key={benefit.title}
                type="button"
                onClick={startQuestionnaire}
                className="flex cursor-pointer items-stretch overflow-hidden rounded-[15px] bg-[#f8fafc] text-left shadow-[0_0_0_1px_#f0f4f8] transition-all duration-300 ease-out hover:-translate-y-[3px] hover:scale-[1.02] hover:bg-white hover:shadow-[0_5px_15px_rgba(0,0,0,0.08)]"
              >
                <div className="w-[8px] shrink-0 bg-[#1a73e8]" />
                <div className="flex flex-1 items-center gap-[16px] px-[20px] py-[20px]">
                  <div className="flex min-w-[50px] justify-center text-[34px] leading-none">
                    <span aria-hidden="true">{benefit.icon}</span>
                  </div>
                  <div className="min-w-0 text-left">
                    <h2 className="text-[18px] leading-[1.2] font-bold text-[#1e40af] md:text-[19px]">
                      {benefit.title}
                    </h2>
                    <p className="mt-1 text-[15px] leading-[1.4] text-[#475569] md:text-[16px]">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-[40px] flex justify-center">
            <button
              type="button"
              onClick={startQuestionnaire}
              className="inline-flex w-full max-w-[500px] flex-col items-center justify-center rounded-[50px] bg-[#1a73e8] px-8 py-[22px] text-white shadow-[0_10px_20px_rgba(26,115,232,0.3)] transition-all duration-300 ease-out hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[0_14px_28px_rgba(26,115,232,0.38)]"
            >
              <span className="text-[21px] leading-[1.15] font-extrabold md:text-[24px]">
                Verificar Mi Elegibilidad
              </span>
              <span className="mt-1 block text-[13px] font-normal text-[#e0f2fe] md:text-[14px]">
                (Solo para personas de 22 a 50 años)
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderSuccessPage() {
    return (
      <div className="mx-auto w-full max-w-[490px] overflow-hidden bg-white">
        <section className="border-t border-[#f2d7d7] px-4 pb-6 pt-5 text-center md:px-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#18bf79] text-white shadow-[0_10px_24px_rgba(24,191,121,0.25)]">
            <FilledCheckIcon className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-[20px] leading-none font-black tracking-[-0.04em] text-[#13213c]">
            ¡Felicidades!
          </h2>
          <p className="mt-2 text-[19px] leading-[1.08] font-black tracking-[-0.04em] text-[#13213c]">
            Tu Solicitud Fue <span className="text-[#16c96f]">Recibida</span>{" "}
            <span className="inline-flex translate-y-[2px] text-[#64d98d]">
              <BadgeCheckIcon className="h-5 w-5" />
            </span>
          </p>
          <p className="mt-4 text-[14px] leading-[1.45] text-[#5e6781]">
            Un asesor certificado te llamará en los próximos{" "}
            <span className="font-black text-[#16c96f]">15 minutos.</span>
          </p>
        </section>

        <section className="border-t-[3px] border-[#20d47a] bg-[#ef3131] px-4 py-4 text-center md:px-6">
          <div className="flex items-center justify-center gap-2 text-[16px] font-black tracking-[-0.03em] text-[#151515]">
            <PhoneIcon className="h-4 w-4 text-[#9a52ff]" />
            <span>Prepárate - Te Llamamos Ahora</span>
          </div>
          <div className="mt-1 flex items-center justify-center gap-2 text-[12px] font-black tracking-[0.05em] text-white">
            <BellIcon className="h-5 w-5 text-[#ffdf59]" />
            <span>TU LLAMADA EN MENOS DE</span>
          </div>
          <div className="mt-3 rounded-[18px] border-2 border-[#ffb8b8] bg-[#f35f5f] px-4 py-3">
            <p className="text-[27px] leading-[0.95] font-black tracking-[0.03em] text-white md:text-[34px]">
              En cualquier
              <br />
              momento...
            </p>
          </div>
          <p className="mt-4 text-[14px] leading-[1.45] text-[#141414]">
            Mantén tu teléfono cerca con{" "}
            <span className="font-black">sonido activado.</span>
            <br />
            La llamada es rápida -{" "}
            <span className="font-black">10 a 15 minutos</span> para ver tu precio exacto.
          </p>
        </section>

        <section className="border-t-[3px] border-[#ffbe2e] bg-[#fff1b8] px-4 py-4 md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f94848] px-3 py-1 text-[12px] font-black tracking-[0.02em] text-white">
              <BoltIcon className="h-3 w-3" />
              MIRA ESTO AHORA
            </span>
            <h3 className="text-[17px] font-black tracking-[-0.03em] text-[#7b4a10]">
              Mira Esto Mientras Esperas
            </h3>
          </div>
          <p className="mt-3 text-[14px] leading-[1.4] text-[#7b4a10]">
              Descubre cómo proteger a tu familia MIENTRAS construyes riqueza libre
            de impuestos
          </p>

          <div className="mt-4 grid gap-3">
            {thankYouHighlights.map((item) => (
              <div
                key={item.title}
                className="rounded-[12px] border-l-[3px] border-[#15c978] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(16,24,32,0.05)]"
              >
                <p className="text-[15px] font-black tracking-[-0.03em] text-[#13213c]">
                  ✓ {item.title}
                </p>
                <p className="mt-1 text-[13px] leading-[1.35] text-[#5d6782]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t-[3px] border-[#f7a61f] bg-[#fffaf2] px-4 py-4 md:px-6">
          <div className="flex items-center gap-2 text-[#1a2740]">
            <ClipboardIcon className="h-5 w-5 text-[#f19a29]" />
            <h3 className="text-[16px] font-black tracking-[-0.03em]">
              Cómo Será La Llamada
            </h3>
          </div>

          <div className="mt-4 grid gap-3">
            {thankYouCallSteps.map((item) => (
              <div
                key={item.title}
                className="rounded-[14px] border-l-[3px] border-[#4a80f0] bg-[#f8fafc] px-4 py-4"
              >
                <div className="flex items-center gap-2 text-[15px] font-black tracking-[-0.03em] text-[#1a2740]">
                  {item.icon === "bolt" ? (
                    <BoltIcon className="h-4 w-4 text-[#ff8f2d]" />
                  ) : item.icon === "user" ? (
                    <UserIcon className="h-4 w-4 text-[#7b52ff]" />
                  ) : (
                    <FocusIcon className="h-4 w-4 text-[#ffae2d]" />
                  )}
                  <span>{item.title}</span>
                </div>
                <p className="mt-3 text-[14px] leading-[1.45] text-[#5d6782]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t-[3px] border-[#4a80f0] bg-[#eef5ff] px-4 py-4 md:px-6">
          <div className="flex items-center gap-2 text-[#2450c5]">
            <BadgeCheckIcon className="h-5 w-5 text-[#59cb8f]" />
            <h3 className="text-[16px] font-black tracking-[-0.03em]">
              Ten Esta Info Lista
            </h3>
          </div>

          <div className="mt-4 grid gap-3">
            {thankYouInfoList.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-[12px] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(16,24,32,0.04)]"
              >
                <span className="mt-0.5 inline-flex text-[#7dd8a1]">
                  <FilledCheckIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[14px] font-black tracking-[-0.03em] text-[#13213c]">
                    {item.title}
                  </p>
                  <p className="text-[13px] leading-[1.35] text-[#5d6782]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t-[3px] border-[#f08fd0] bg-white px-4 py-4 md:px-6">
          <div className="flex items-center gap-2 text-[#1a2740]">
            <QuestionIcon className="h-5 w-5 text-[#f55ea9]" />
            <h3 className="text-[16px] font-black tracking-[-0.03em]">
              Preguntas Rápidas
            </h3>
          </div>

          <div className="mt-4 grid gap-3">
            {thankYouFaqs.map((item) => (
              <div
                key={item.title}
                className="rounded-[14px] border-l-[3px] border-[#8d5bff] bg-[#fcfcfe] px-4 py-4"
              >
                <p className="text-[15px] font-black tracking-[-0.03em] text-[#1a2740]">
                  {item.title}
                </p>
                <p className="mt-3 text-[14px] leading-[1.45] text-[#5d6782]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t-[3px] border-[#ffbe2e] bg-[#1e2639] px-5 py-8 text-center text-white md:px-6">
          <div className="flex justify-center text-[34px]">
            <PhonePadIcon className="h-10 w-10" />
          </div>
          <h3 className="mt-4 text-[17px] leading-[1.4] font-semibold tracking-[-0.03em]">
            Mantén tu teléfono cerca y con{" "}
            <span className="font-black text-[#ffbe2e]">sonido activado.</span>
          </h3>
          <p className="mt-3 text-[14px] leading-[1.5] text-white/80 italic">
            Si ves una llamada entrante en los próximos{" "}
            <span className="font-black text-[#ffbe2e]">15 minutos</span> -
            somos nosotros. ¡Contéstala!
          </p>
          <p className="mx-auto mt-6 max-w-[380px] text-[14px] leading-[1.6] text-white/55">
            Better Life es una plataforma independiente de información sobre
            seguros. No somos una aseguradora. Los asesores mencionados están
            certificados y regulados por el departamento de seguros de su estado.
          </p>
        </section>
      </div>
    );
  }

  function renderQuestionnairePanel() {
    return (
      <div key={`panel-${panelKey}`} className="w-full">
        <div className="mx-auto flex w-full max-w-[760px] flex-col items-center">
          <div className="flex w-full items-center justify-between gap-3 md:gap-4">
            <button
              type="button"
              onClick={goBack}
              aria-label="Back"
              className="inline-flex h-9 w-9 items-center justify-center text-[#6b7280] [font-size:0] transition hover:text-[#101820]"
            >
              <BackArrowIcon className="h-[18px] w-[18px]" />
            </button>
            {renderProgress()}
            <div className="flex w-[58px] shrink-0 justify-end md:w-[70px]">
              <span className="whitespace-nowrap text-[12px] font-black tracking-[-0.02em] text-[var(--brand-dark)] md:text-[13px]">
                {progressLabel}
              </span>
            </div>
          </div>

          <div className={`mt-5 text-center md:mt-6 ${animationClass}`}>
            {currentStep === "age" ? (
              <p className="mx-auto mb-1 max-w-[520px] text-[14px] font-extrabold uppercase tracking-[0.04em] text-[var(--brand)] md:mb-1.5 md:text-[16px]">
                Aplica para los beneficios IUL
              </p>
            ) : null}
            <h2 className="mx-auto max-w-[720px] text-[30px] leading-[1.16] font-bold tracking-[-0.05em] text-[#101820] md:text-[46px]">
              {currentStep === "age" && "¿En qué grupo de edad estás?"}
              {currentStep === "goal" &&
                "Cuéntame, ¿qué te gustaría lograr con un seguro de vida?"}
              {currentStep === "state" && "Cual es tu ZIP code?"}
              {currentStep === "name" && "¿Cuál es tu nombre completo?"}
              {currentStep === "phone" &&
                "¿A qué número te enviamos tu cotización personalizada?"}
              {currentStep === "email" &&
                "¿Cuál es tu correo para enviarte la cotización?"}
            </h2>
          </div>

          {currentStep === "age" ? (
            <div className={`mt-8 grid w-full max-w-[420px] gap-4 md:mt-10 ${animationClass}`}>
              {ageOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleDirectChoice("ageGroup", option, "goal")}
                  className={optionButtonClass(
                    answers.ageGroup === option,
                    option === recommendedAgeOption
                  ) + " justify-center text-center"}
                >
                  <span className="inline-flex items-center justify-center gap-2 font-black tracking-[-0.02em]">
                    <DialFingerIcon className="h-[23px] w-[23px] text-[#5d6674]" />
                    <span>{option}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {currentStep === "goal" ? (
            <div className={`mt-8 grid w-full max-w-[460px] gap-4 md:mt-10 ${animationClass}`}>
              {goalOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    handleDirectChoice("insuranceGoal", option, shouldAskZipCode ? "state" : "name")
                  }
                  className={optionButtonClass(
                    answers.insuranceGoal === option,
                    option === recommendedGoalOption
                  ) + " justify-center text-center"}
                >
                  {option === "Seguro de vida" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <ShieldCheckIcon className="h-[22px] w-[22px] text-[#5d6674]" />
                      <span>{option}</span>
                    </span>
                  ) : option === "Ahorrar e invertir" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <StatisticGrowIcon className="h-[22px] w-[22px] text-[#5d6674]" />
                      <span>{option}</span>
                    </span>
                  ) : option.normalize("NFC") === "Planificación de retiro" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <RetirementPlanIcon className="h-[22px] w-[22px] text-[#5d6674]" />
                      <span>{option}</span>
                    </span>
                  ) : option === "PlanificaciÃ³n de retiro" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <RetirementPlanIcon className="h-[22px] w-[22px] text-[#5d6674]" />
                      <span>{option}</span>
                    </span>
                  ) : option.normalize("NFC") === "No estoy seguro aún" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <UnsureIcon className="h-[22px] w-[22px] text-[#5d6674]" />
                      <span>{option}</span>
                    </span>
                  ) : (
                    option
                  )}
                </button>
              ))}
            </div>
          ) : null}

          {currentStep === "state" ? (
            <div className={`mt-8 flex w-full max-w-[460px] flex-col gap-4 md:mt-10 ${animationClass}`}>
              <input
                id="zip-code"
                name="postal-code"
                value={answers.zipCode}
                onChange={(event) => {
                  const zipCode = normalizeZipCode(event.target.value);
                  setAnswers((prev) => ({
                    ...prev,
                    zipCode,
                    state: zipCode === prev.zipCode ? prev.state : prev.detectedState || "",
                  }));
                  setZipError("");
                }}
                placeholder="Ej: 33101"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="postal-code"
                enterKeyHint="done"
                className="h-[58px] rounded-[16px] border border-[#9c9c9c] bg-white px-5 text-[17px] text-[#101820] outline-none transition focus:border-[var(--brand)]"
              />

              <p className="min-h-[22px] text-[14px] text-[#6b7280]">
                {resolvedUsState
                  ? `Estado detectado: ${resolvedUsState}`
                  : "Usamos tu ZIP code para identificar tu estado."}
              </p>

              <p className="min-h-[22px] text-[14px] text-[#d14c4c]">
                {zipError}
              </p>

              <button
                type="button"
                onClick={() => void handleZipCodeContinue()}
                disabled={isLookingUpZip || normalizeZipCode(answers.zipCode).length !== 5}
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 text-[18px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-45 hover:bg-[var(--brand-dark)]"
              >
                <span>{isLookingUpZip ? "Validando ZIP code..." : "Confirmar ZIP code"}</span>
                {isLookingUpZip ? (
                  <span
                    aria-hidden="true"
                    className="h-[16px] w-[16px] rounded-full border-2 border-white/35 border-t-white animate-spin"
                  />
                ) : (
                  <NextArrowIcon className="h-[18px] w-[18px]" />
                )}
              </button>
            </div>
          ) : null}

          {currentStep === "name" ? (
            <div className={`mt-8 flex w-full max-w-[460px] flex-col gap-4 md:mt-10 ${animationClass}`}>
              <input
                id="first-name"
                name="given-name"
                value={answers.firstName}
                onChange={(event) =>
                  setAnswers((prev) => ({
                    ...prev,
                    firstName: event.target.value,
                  }))
                }
                placeholder="Nombre"
                autoComplete="given-name"
                autoCapitalize="words"
                enterKeyHint="next"
                className="h-[58px] rounded-[16px] border border-[#9c9c9c] bg-white px-5 text-[17px] text-[#101820] outline-none transition focus:border-[var(--brand)]"
              />
              <input
                id="last-name"
                name="family-name"
                value={answers.lastName}
                onChange={(event) =>
                  setAnswers((prev) => ({
                    ...prev,
                    lastName: event.target.value,
                  }))
                }
                placeholder="Apellido"
                autoComplete="family-name"
                autoCapitalize="words"
                enterKeyHint="next"
                className="h-[58px] rounded-[16px] border border-[#9c9c9c] bg-white px-5 text-[17px] text-[#101820] outline-none transition focus:border-[var(--brand)]"
              />

              <button
                type="button"
                onClick={() => void handleNameContinue()}
                disabled={!answers.firstName.trim() || !answers.lastName.trim()}
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 text-[18px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-45 hover:bg-[var(--brand-dark)]"
              >
                <span>Seguir</span>
                <NextArrowIcon className="h-[18px] w-[18px]" />
              </button>
            </div>
          ) : null}

          {currentStep === "phone" ? (
            <form
              className={`mt-8 flex w-full max-w-[460px] flex-col gap-4 md:mt-10 ${animationClass}`}
              data-tf-element-role="offer"
              onSubmit={(event) => {
                event.preventDefault();
                void submitLead();
              }}
            >
              <input type="hidden" name={trustedFormFieldName} />
              <div className="flex gap-3">
                <select
                  value={answers.phoneCountry}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      phoneCountry: event.target.value,
                    }))
                  }
                  className="h-[58px] min-w-[106px] rounded-[16px] border border-[#9c9c9c] bg-white px-4 text-[17px] text-[#101820] outline-none transition focus:border-[var(--brand)]"
                >
                  <option value="US">US +1</option>
                </select>

                <div className="relative min-w-0 flex-1">
                  <input
                    id="phone-number"
                    name="tel"
                    value={formatPhoneDigits(answers.phoneNumber)}
                    onChange={(event) => {
                      setAnswers((prev) => ({
                        ...prev,
                        phoneNumber: normalizeUsPhoneInput(event.target.value),
                      }));
                      setHasBlurredPhone(false);
                      setPhoneError("");
                    }}
                    onInput={(event) => {
                      const nextPhone = normalizeUsPhoneInput(event.currentTarget.value);
                      if (nextPhone !== answers.phoneNumber) {
                        setAnswers((prev) => ({
                          ...prev,
                          phoneNumber: nextPhone,
                        }));
                      }
                      setHasBlurredPhone(false);
                      setPhoneError("");
                    }}
                    onBlur={() => setHasBlurredPhone(true)}
                    placeholder="000 000 0000"
                    inputMode="tel"
                    autoComplete="tel"
                    enterKeyHint="next"
                    aria-invalid={phoneValidationStatus === "invalid" || !!phoneError}
                    className={`h-[58px] w-full rounded-[16px] border bg-white px-5 pr-12 text-[17px] text-[#101820] outline-none transition ${phoneBorderClass}`}
                  />
                  {phoneValidationStatus !== "idle" ? (
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                      <PhoneStatusIcon status={phoneValidationStatus} />
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#6b7280]">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16v10H4z" /><path d="m4 8 8 6 8-6" /></svg>
                </span>
                <input
                  id="email"
                  name="email"
                  value={answers.email}
                  onChange={(event) => {
                    setAnswers((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }));
                    setEmailError("");
                  }}
                  placeholder="Ej: correo@ejemplo.com"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  enterKeyHint="done"
                  className="h-[58px] w-full rounded-[16px] border border-[#9c9c9c] bg-white pl-12 pr-5 text-[17px] text-[#101820] outline-none transition focus:border-[var(--brand)]"
                />
              </div>

              <p className="min-h-[22px] text-[14px] text-[#d14c4c]">
                {visiblePhoneError}
              </p>

              <p className="min-h-[22px] text-[14px] text-[#d14c4c]">
                {emailError}
              </p>

              <button
                type="submit"
                name="submit-lead"
                data-tf-element-role="submit"
                disabled={isSubmittingLead}
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 text-[18px] font-semibold text-white transition disabled:cursor-wait disabled:opacity-70 hover:bg-[var(--brand-dark)]"
              >
                <span>Ver mi cotización ahora</span>
                {isSubmittingLead ? (
                  <span
                    aria-hidden="true"
                    className="h-[16px] w-[16px] rounded-full border-2 border-white/35 border-t-white animate-spin"
                  />
                ) : (
                  <NextArrowIcon className="h-[18px] w-[18px]" />
                )}
              </button>

              <p
                className="-mt-1 text-center text-[11px] leading-[1.45] text-[#6b7280]"
                data-tf-element-role="consent-language"
              >
                Al hacer clic en <strong>“Ver mi cotización ahora”</strong>, doy mi consentimiento expreso por escrito y mi firma electrónica para que <strong>Sunnel LLC</strong> (better-life), sus{" "}
                <Link href="/socios" className="font-bold text-[#4b5563] underline underline-offset-2">
                  socios de mercadeo y aseguradoras licenciadas
                </Link>{" "}
                y cualquier persona que llame o envíe mensajes en su nombre, me contacten al número de teléfono y correo electrónico proporcionados incluso si están en alguna lista “No Llamar” estatal, federal o interna con fines de mercadeo de seguros de vida, IUL, gastos finales y productos financieros relacionados. Acepto que dichas comunicaciones pueden hacerse mediante{" "}
                <strong>sistemas de marcación automática, marcadores predictivos, mensajes de voz pregrabada o artificial (incluyendo IA), y SMS automatizados.</strong>{" "}
                Pueden aplicar tarifas estándar de mensajes y datos. <strong>Entiendo que este consentimiento no es condición para comprar ningún producto</strong> y que puedo revocarlo en cualquier momento respondiendo <strong>STOP</strong> a un SMS o usando el enlace de cancelación en los correos. He leído y acepto la{" "}
                <Link href="/privacy" className="font-bold text-[#4b5563] underline underline-offset-2">
                  Política de Privacidad
                </Link>{" "}
                y los{" "}
                <Link href="/terms" className="font-bold text-[#4b5563] underline underline-offset-2">
                  Términos de Uso
                </Link>.
              </p>

              <p className="min-h-[22px] text-[14px] text-[#d14c4c]">
                {submitError}
              </p>
            </form>
          ) : null}

          {currentStep === "email" ? (
            <div className={`mt-8 flex w-full max-w-[460px] flex-col gap-4 md:mt-10 ${animationClass}`}>
              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#6b7280]">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16v10H4z" /><path d="m4 8 8 6 8-6" /></svg>
                </span>
                <input
                  value={answers.email}
                  onChange={(event) => {
                    setAnswers((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }));
                    setEmailError("");
                  }}
                  placeholder="Ej: correo@ejemplo.com"
                  inputMode="email"
                  autoComplete="email"
                  className="h-[58px] w-full rounded-[16px] border border-[#9c9c9c] bg-white pl-12 pr-5 text-[17px] text-[#101820] outline-none transition focus:border-[var(--brand)]"
                />
              </div>

              <p className="min-h-[22px] text-[14px] text-[#d14c4c]">
                {emailError}
              </p>

              <button
                type="button"
                onClick={() => void submitLead()}
                disabled={isSubmittingLead}
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 text-[18px] font-semibold text-white transition disabled:cursor-wait disabled:opacity-70 hover:bg-[var(--brand-dark)]"
              >
                {isSubmittingLead ? (
                  "Enviando..."
                ) : (
                  <>
                    <span>Ver mi cotización personalizada</span>
                    <FinalArrowIcon className="h-[18px] w-[18px]" />
                  </>
                )}
              </button>

              <p className="min-h-[22px] text-[14px] text-[#d14c4c]">
                {submitError}
              </p>
            </div>
          ) : null}

          <div className="mt-12 flex w-full max-w-[420px] items-center justify-center gap-4 md:mt-14">
            {questionnaireSecuritySeals.map((seal) => (
              <div
                key={seal.src}
                className="flex h-[28px] items-center justify-center opacity-90 grayscale-[0.08]"
              >
                <Image
                  src={seal.src}
                  alt={seal.alt}
                  width={seal.width}
                  height={seal.height}
                  className="h-auto max-h-[28px] w-auto object-contain"
                />
              </div>
            ))}
          </div>
          {false ? (
          <div className="hidden">
            <div className="inline-flex min-h-[46px] max-w-[360px] items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 text-white shadow-[0_10px_20px_rgba(26,115,232,0.2)]">
              <span className="text-center text-[14px] font-extrabold leading-[1.15] tracking-[-0.02em] md:text-[15px]">
                En el siguiente paso llamarás a un asesor
              </span>
            </div>
          </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-[var(--ink)]">
      <noscript>
        <img src="https://api.trustedform.com/ns.gif" alt="" />
      </noscript>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800&display=swap");
      `}</style>
      <div
        id="headline-ciudad"
        className="my-[20px] rounded-[8px] border-b-[3px] border-[#FFD700] bg-[#FFF8DC] p-[15px] text-center text-[1.8rem] font-bold leading-[1.2] text-[#111]"
      >
        ⚠️ ATENCIÓN: Nuevo Programa de Seguro de Vida – Disponible!
      </div>

      {isRejectedPage ? (
        renderRejectedPage()
      ) : isSuccessPage ? (
        <section className="px-0 py-0 md:px-4 md:py-6">{renderSuccessPage()}</section>
      ) : (
        <>
          <div className="mx-auto flex min-h-[calc(100vh-60px)] w-full max-w-[1200px] flex-col items-center px-3 pb-6 pt-4 md:px-4 md:pb-10 md:pt-2">
            <section
              className={`flex w-full flex-col items-center ${
                isQuestionnaire ? "justify-start" : "justify-center"
              }`}
            >
              <div className="w-full">
                {currentStep === "intro" ? renderIntroPanel() : renderQuestionnairePanel()}
              </div>
            </section>
          </div>
        </>
      )}
      <PopUp1
        open={isPayPerCallPopupOpen}
        firstName={submittedFirstName || answers.firstName}
        goal={submittedInsuranceGoal || answers.insuranceGoal}
        leadId={submittedLeadId}
        continueUrl={submittedContinueUrl || "/thanks/call2"}
        phoneNumber={runtimeConfig.payPerCallPhoneNumber}
        ringbaCampaignId={runtimeConfig.ringbaCampaignId}
        ringbaTags={{
          funnel_id: "iul-v4",
          lead_id: submittedLeadId,
          iul_v4_age_group: answers.ageGroup,
          iul_v4_insurance_goal: submittedInsuranceGoal || answers.insuranceGoal,
        }}
        onClose={() => setIsPayPerCallPopupOpen(false)}
      />
      <footer className="px-4 pb-5 pt-3 text-center text-[9px] leading-[1.45] text-[#b8bec8] md:text-[10px]">
        <p>© 2025 Better Life. All Rights Reserved.</p>
        <p className="mx-auto mt-2 max-w-[920px]">
          This site is not part of Facebook or Meta Platforms, Inc. Additionally, this site is not endorsed by Facebook in any way. “Facebook” is a registered trademark of Meta Platforms, Inc.
        </p>
        <p className="mx-auto mt-2 max-w-[920px]">
          Better Life is an independent promotional and advertising service. This website and the services offered are not sponsored, affiliated with, endorsed, or administered by Facebook. The content on this site has not been reviewed, approved, or certified by Facebook or any of its related entities.
        </p>
      </footer>
    </main>
  );
}
