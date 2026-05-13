"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const trustBadges = [
  { icon: "/media/tax-free.svg", text: "Retiro libre de impuestos" },
  { icon: "/media/family-protection.svg", text: "Protege a tu familia" },
  { icon: "/media/minutes.svg", text: "Toma menos de 2 minutos" },
];

const questionnaireSecuritySeals = [
  {
    src: "/media/busines-acredited-bbb.avif",
    alt: "BBB Accredited Business",
    width: 112,
    height: 38,
  },
  {
    src: "/media/secure-call-badge.png",
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

const howItWorksSteps = [
  { number: "1", title: "Te hacemos unas preguntas", description: "para verificar si calificas." },
  { number: "2", title: "Revisamos tu perfil", description: "y estimamos tu beneficio IUL." },
  { number: "3", title: "Accede a tu plan", description: "y recibe tu beneficio." },
];

const metrics = [
  { value: "73,698", label: "Familias ayudadas en 2026" },
  { value: "100%", label: "Beneficio familiar protegido" },
  { value: "$200K+", label: "Potencial en valor acumulado" },
];

const footerLinks = [
  { label: "About Us", href: "/" },
  { label: "Cookie Policy", href: "/privacy" },
  { label: "Terms Of Use", href: "/terms" },
  { label: "Partner With Us", href: "/socios" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Contact", href: "/" },
  { label: "Sitemap", href: "/" },
];

const socialLinks = [
  { label: "Facebook", href: "/", icon: "/media/facebook.png" },
  { label: "Instagram", href: "https://www.instagram.com/", icon: "/media/instagram.png" },
  { label: "LinkedIn", href: "/", icon: "/media/linkedin.png" },
];

const ageOptions = ["25 a 34", "35 a 44", "45 a 54", "55 a 65", "65+"];
const disqualificationCookieName = "better_life_call5_disqualified";
const disqualificationCookieMaxAge = 60 * 60 * 24 * 180;
const callFunnelPagePath = "/call-5";
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

type FunnelStep =
  | "intro"
  | "age"
  | "goal"
  | "state"
  | "name"
  | "phone"
  | "email"
  | "call-page"
  | "disqualified"
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

const stepOrder: FunnelStep[] = [
  "age",
  "call-page",
  "disqualified",
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
  const digits = value.replace(/\D/g, "").slice(0, 10);
  const chunks = [];
  if (digits.length > 0) chunks.push(digits.slice(0, 3));
  if (digits.length > 3) chunks.push(digits.slice(3, 6));
  if (digits.length > 6) chunks.push(digits.slice(6, 10));
  return chunks.join(" ");
}

function getPhoneValidationMessage(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 10) {
    return "Ingresa un número válido de EE.UU. con 10 dígitos.";
  }

  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) {
    return "Ingresa un número real de EE.UU.";
  }

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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function buildThanksCallUrl(ageGroup: string, insuranceGoal: string) {
  const params = new URLSearchParams(window.location.search);
  if (ageGroup) params.set("age_group", ageGroup);
  if (insuranceGoal) params.set("insurance_goal", insuranceGoal);
  const search = params.toString();
  return `/thanks/call${search ? `?${search}` : ""}`;
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

function IntroBenefitIcon({
  icon,
  className = "h-[26px] w-[26px]",
}: {
  icon: (typeof introBenefits)[number]["icon"];
  className?: string;
}) {
  if (icon === "growth") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
        <rect x="3.5" y="4.5" width="17" height="15" rx="3" fill="#ece7ff" />
        <path d="M6.5 16.5 10 13l2.4 2.2 5.1-5.2" stroke="#3b82f6" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 7.5v9M11.5 7.5v9M16.5 7.5v9" stroke="#c4b5fd" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "tax") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
        <circle cx="12" cy="12" r="7.8" stroke="#ff4d67" strokeWidth="2.2" />
        <path d="M7 7 17 17" stroke="#ff4d67" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "liquidity") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
        <path d="M4 9.3 12 4l8 5.3" stroke="#8b7aa8" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 10h13" stroke="#8b7aa8" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M7.2 10v7.3M12 10v7.3M16.8 10v7.3" stroke="#8b7aa8" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4.5 18h15" stroke="#8b7aa8" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "protection") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
        <path d="M12 3.8c2.8 1.9 5.8 2.4 8 2.5v6c0 4.5-3.2 7.9-8 9.5-4.8-1.6-8-5-8-9.5v-6c2.2-.1 5.2-.6 8-2.5Z" fill="#5bb2ff" stroke="#4477e6" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <rect x="5" y="4.5" width="14" height="15" rx="2.5" fill="#f2e8ff" />
      <path d="M12 7.2v5.4M9.3 9.9h5.4" stroke="#ff4db8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.5 15.8h7" stroke="#c084fc" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8.5 18.2h5.2" stroke="#c084fc" strokeWidth="1.6" strokeLinecap="round" />
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

function CallOutlineIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className} fill="currentColor">
      <path d="M23.407 30.394c-2.431 0-8.341-3.109-13.303-9.783-4.641-6.242-6.898-10.751-6.898-13.785 0-2.389 1.65-3.529 2.536-4.142l0.219-0.153c0.979-0.7 2.502-0.927 3.086-0.927 1.024 0 1.455 0.599 1.716 1.121 0.222 0.442 2.061 4.39 2.247 4.881 0.286 0.755 0.192 1.855-0.692 2.488l-0.155 0.108c-0.439 0.304-1.255 0.869-1.368 1.557-0.055 0.334 0.057 0.684 0.342 1.068 1.423 1.918 5.968 7.55 6.787 8.314 0.642 0.6 1.455 0.685 2.009 0.218 0.573-0.483 0.828-0.768 0.83-0.772l0.059-0.057c0.048-0.041 0.496-0.396 1.228-0.396 0.528 0 1.065 0.182 1.596 0.541 1.378 0.931 4.487 3.011 4.487 3.011l0.05 0.038c0.398 0.341 0.973 1.323 0.302 2.601-0.695 1.327-2.85 4.066-5.079 4.066zM9.046 2.672c-0.505 0-1.746 0.213-2.466 0.728l-0.232 0.162c-0.827 0.572-2.076 1.435-2.076 3.265 0 2.797 2.188 7.098 6.687 13.149 4.914 6.609 10.532 9.353 12.447 9.353 1.629 0 3.497-2.276 4.135-3.494 0.392-0.748 0.071-1.17-0.04-1.284-0.36-0.241-3.164-2.117-4.453-2.988-0.351-0.238-0.688-0.358-0.999-0.358-0.283 0-0.469 0.1-0.532 0.14-0.104 0.111-0.39 0.405-0.899 0.833-0.951 0.801-2.398 0.704-3.424-0.254-0.923-0.862-5.585-6.666-6.916-8.459-0.46-0.62-0.641-1.252-0.538-1.877 0.187-1.133 1.245-1.866 1.813-2.26l0.142-0.099c0.508-0.363 0.4-1.02 0.316-1.242-0.157-0.414-1.973-4.322-2.203-4.781-0.188-0.376-0.336-0.533-0.764-0.533z" />
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

function CalendarSmallIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none">
      <rect x="4" y="5" width="16" height="15" rx="3" fill="currentColor" opacity="0.14" />
      <path d="M8 3v4M16 3v4M5 9h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M8 13h2M12 13h2M16 13h1M8 16h2M12 16h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function hasDisqualificationCookie() {
  if (typeof document === "undefined") return false;

  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith(`${disqualificationCookieName}=1`));
}

function setDisqualificationCookie() {
  document.cookie = `${disqualificationCookieName}=1; Max-Age=${disqualificationCookieMaxAge}; Path=/; SameSite=Lax`;
}

function clearDisqualificationCookie() {
  document.cookie = `${disqualificationCookieName}=; Max-Age=0; Path=/; SameSite=Lax`;
}

function trackCallFunnelEvent(eventName: "ViewContent" | "Contact", currentStep: FunnelStep) {
  const trackingWindow = window as Window & {
    fbq?: (command: string, event: string, params?: Record<string, string>) => void;
    ttq?: { track?: (event: string, params?: Record<string, string>) => void };
  };
  const eventParams = {
    page: "/call-5",
    step: currentStep,
    content_id: "call_iul",
    content_type: "product",
    content_name: "Seguro IUL Call Funnel",
  };

  trackingWindow.fbq?.("track", eventName, eventParams);
  trackingWindow.ttq?.track?.(eventName, eventParams);
  sendMetaPixelBeacon(eventName);
}

function sendMetaPixelBeacon(eventName: "PageView" | "ViewContent" | "Contact") {
  const beacon = new window.Image();
  beacon.src = `https://www.facebook.com/tr?id=1556647345340828&ev=${eventName}&noscript=1`;
}

function trackCallFunnelPageView() {
  const trackingWindow = window as Window & {
    __callFunnelPageViews?: Record<string, boolean>;
    fbq?: (command: string, event: string, params?: Record<string, string>) => void;
    ttq?: { page?: (params?: Record<string, string>) => void };
  };

  if (trackingWindow.__callFunnelPageViews?.[callFunnelPagePath]) return;

  trackingWindow.__callFunnelPageViews = trackingWindow.__callFunnelPageViews || {};
  trackingWindow.__callFunnelPageViews[callFunnelPagePath] = true;
  trackingWindow.fbq?.("track", "PageView", { page: callFunnelPagePath, step: "age" });
  trackingWindow.ttq?.page?.({
    content_id: "call_iul",
    content_type: "product",
    content_name: "Seguro IUL Call Funnel",
  });
  sendMetaPixelBeacon("PageView");
}

function CallFunnelPixels({ currentStep }: { currentStep: FunnelStep }) {
  const trackedViewStepsRef = useRef<Set<FunnelStep>>(new Set());
  const trackedPageViewRef = useRef(false);

  useEffect(() => {
    if (currentStep !== "age") return;
    if (trackedPageViewRef.current) return;

    trackedPageViewRef.current = true;
    window.setTimeout(trackCallFunnelPageView, 1200);
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === "age" || currentStep === "disqualified") return;
    if (trackedViewStepsRef.current.has(currentStep)) return;

    trackedViewStepsRef.current.add(currentStep);
    trackCallFunnelEvent("ViewContent", currentStep);
  }, [currentStep]);

  useEffect(() => {
    const handleCallClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const callLink = target?.closest?.('a[href^="tel:"]');

      if (!callLink) return;
      trackCallFunnelEvent("Contact", currentStep);
    };

    document.addEventListener("click", handleCallClick);
    return () => document.removeEventListener("click", handleCallClick);
  }, [currentStep]);

  if (currentStep === "disqualified") {
    return null;
  }

  return null;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<FunnelStep>("age");
  const [slideDirection, setSlideDirection] = useState<"forward" | "backward">("forward");
  const [panelKey, setPanelKey] = useState(0);
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);
  const [answers, setAnswers] = useState<FunnelAnswers>(emptyAnswers);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [zipError, setZipError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isFinishingFlow, setIsFinishingFlow] = useState(false);
  const [isDisqualificationCheckComplete, setIsDisqualificationCheckComplete] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  const isSuccessPage = currentStep === "success";
  const isQuestionnaire = currentStep !== "intro";
  const successHash = "#gracias";
  const recommendedAgeOption = answers.ageGroup ? "" : "35 a 44";
  const recommendedGoalOption = "";
  const detectedUsState = stateOptions.includes(answers.detectedState)
    ? answers.detectedState
    : "";
  const resolvedUsState = stateOptions.includes(answers.state) ? answers.state : "";
  const shouldAskZipCode = !resolvedUsState && !detectedUsState;
  const visibleQuestionSteps = ["age", "call-page"] as FunnelStep[];
  const currentQuestionIndex = visibleQuestionSteps.indexOf(currentStep);
  const progress =
    currentQuestionIndex >= 0
      ? ((currentQuestionIndex + 1) / visibleQuestionSteps.length) * 100
      : null;
  const animationClass = isTransitioningOut
    ? "animate-[survey-question-out_0.18s_cubic-bezier(0.4,0,1,1)_forwards]"
    : "animate-[survey-question-in_0.42s_cubic-bezier(0.22,0.61,0.36,1)]";

  const normalizedPhone = answers.phoneNumber.replace(/\D/g, "");

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const shouldResetDisqualification =
      currentUrl.searchParams.get("reset_disqualification") === "1";
    const finishDisqualificationCheck = () => {
      window.queueMicrotask(() => {
        setIsDisqualificationCheckComplete(true);
      });
    };

    if (shouldResetDisqualification) {
      clearDisqualificationCookie();
      currentUrl.searchParams.delete("reset_disqualification");
      window.history.replaceState(null, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
      finishDisqualificationCheck();
      return;
    }

    if (hasDisqualificationCookie()) {
      window.queueMicrotask(() => {
        setCurrentStep("disqualified");
        setPanelKey((prev) => prev + 1);
      });
      window.history.replaceState(null, "", window.location.href);
    }

    finishDisqualificationCheck();
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const guardSuccessHash = () => {
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

  function transitionTo(nextStep: FunnelStep, direction: "forward" | "backward") {
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
    if (currentStep === "age") {
      return;
    }

    if (currentStep === "disqualified") {
      return;
    }

    if (currentStep === "name" && !shouldAskZipCode) {
      transitionTo("age", "backward");
      return;
    }

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex <= 0) return;
    transitionTo(stepOrder[currentIndex - 1], "backward");
  }

  function startQuestionnaire() {
    transitionTo("age", "forward");
  }

  function handleDirectChoice<K extends keyof FunnelAnswers>(
    field: K,
    value: FunnelAnswers[K],
    nextStep: FunnelStep
  ) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    window.setTimeout(() => {
      transitionTo(nextStep, "forward");
    }, 120);
  }

  function handleAgeChoice(option: string) {
    setAnswers((prev) => ({ ...prev, ageGroup: option }));
    if (option === "65+") {
      setDisqualificationCookie();
      window.history.replaceState(null, "", window.location.href);
    }
    window.setTimeout(() => {
      if (option === "65+") {
        transitionTo("disqualified", "forward");
        return;
      }

      window.location.assign(buildThanksCallUrl(option, answers.insuranceGoal));
    }, 120);
  }

  function handleZipCodeContinue() {
    const zipCode = normalizeZipCode(answers.zipCode);
    const zipValidationMessage = getZipValidationMessage(zipCode);

    if (zipValidationMessage) {
      setZipError(zipValidationMessage);
      return;
    }

    setZipError("");
    setAnswers((prev) => ({ ...prev, zipCode }));
    transitionTo("name", "forward");
  }

  function finishVisualFlow() {
    if (!answers.firstName.trim() || !answers.lastName.trim()) return;

    const phoneValidationMessage = getPhoneValidationMessage(normalizedPhone);
    if (phoneValidationMessage) {
      setPhoneError(phoneValidationMessage);
      return;
    }

    if (!isValidEmail(answers.email)) {
      setEmailError("Por favor, ingresa un correo válido.");
      return;
    }

    setPhoneError("");
    setEmailError("");
    setSubmitError("");
    setIsFinishingFlow(true);

    window.setTimeout(() => {
      window.location.assign(buildThanksCallUrl(answers.ageGroup, answers.insuranceGoal));
      setIsFinishingFlow(false);
    }, 250);
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
          {currentStep !== "disqualified" ? (
            <>
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
                {currentQuestionIndex >= 0 ? `${currentQuestionIndex + 1} de 2` : "1 de 2"}
              </span>
            </div>
          </div>

          <div className={`mt-5 text-center md:mt-6 ${animationClass}`}>
            {currentStep === "age" ? (
              <p className="mx-auto mb-1 max-w-[520px] text-[14px] font-extrabold uppercase tracking-[0.04em] text-[var(--brand)] md:mb-1.5 md:text-[16px]">
                Antes de llamar a un asesor
              </p>
            ) : null}
            <h2 className="mx-auto max-w-[720px] text-[30px] leading-[1.16] font-bold tracking-[-0.05em] text-[#101820] md:text-[46px]">
              {currentStep === "age" && "¿En qué grupo de edad estás?"}
              {currentStep === "state" && "Cual es tu ZIP code?"}
              {currentStep === "name" && "¿Cuál es tu nombre completo?"}
              {currentStep === "phone" &&
                "¿A qué número te enviamos tu cotización personalizada?"}
              {currentStep === "email" &&
                "¿Cuál es tu correo para enviarte la cotización?"}
              {currentStep === "call-page" && "Llama a un asesor ahora"}
            </h2>
          </div>
            </>
          ) : null}

          {currentStep === "age" ? (
            <div className={`mt-8 grid w-full max-w-[420px] gap-4 md:mt-10 ${animationClass}`}>
              {ageOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAgeChoice(option)}
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

          {currentStep === "disqualified" ? (
            <div className={`mt-7 w-full max-w-[460px] md:mt-8 ${animationClass}`}>
              <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_18px_45px_rgba(16,24,32,0.12)] ring-1 ring-[#e6ebf2]">
                <div className="bg-[#ff4b55] px-5 py-5 text-center text-white">
                  <div className="text-[26px] leading-none">!</div>
                  <p className="mt-2 text-[20px] font-black tracking-[-0.04em]">
                    No calificas para este programa
                  </p>
                </div>

                <div className="px-5 py-6 text-center">
                  <div className="rounded-[12px] border border-[#ff9ba1] bg-[#fff2f3] px-4 py-3 text-left text-[14px] font-extrabold leading-[1.35] text-[#e21f2c]">
                    Este programa es solo para personas de 22 a 50 años.
                  </div>

                  <h3 className="mt-6 text-[22px] font-black tracking-[-0.04em] text-[#101820]">
                    Gracias por tu interés
                  </h3>
                  <p className="mx-auto mt-2 max-w-[360px] text-[15px] leading-[1.5] text-[#5d6674]">
                    El programa de seguro de vida tipo IUL está diseñado para
                    personas dentro del rango de edad permitido.
                  </p>

                  <div className="mt-6 border-t border-[#e6ebf2] pt-5 text-left">
                    <p className="text-[12px] font-black uppercase tracking-[0.14em] text-[#9aa3b2]">
                      ¿Por qué no califico?
                    </p>

                    <div className="mt-3 grid gap-3">
                      <div className="flex items-center gap-3 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#eaf2ff] text-[var(--brand)]">
                          <CalendarSmallIcon className="h-6 w-6" />
                        </span>
                        <div>
                          <p className="text-[15px] font-black tracking-[-0.03em] text-[#101820]">
                            Rango de edad aceptado
                          </p>
                          <p className="mt-1 text-[13px] leading-[1.35] text-[#5d6674]">
                            Solo aplica para personas de 22 a 50 años.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#edfdf5] text-[#15b873]">
                          <ShieldCheckIcon className="h-6 w-6" />
                        </span>
                        <div>
                          <p className="text-[15px] font-black tracking-[-0.03em] text-[#101820]">
                            Seguro de vida - etapa activa
                          </p>
                          <p className="mt-1 text-[13px] leading-[1.35] text-[#5d6674]">
                            Diseñado para personas dentro del rango permitido.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ) : null}

          {currentStep === "call-page" ? (
            <div className={`mt-8 flex w-full max-w-[460px] flex-col items-center text-center md:mt-10 ${animationClass}`}>
              <div className="w-full rounded-[18px] border border-[#d8e6ff] bg-[#f7fbff] px-5 py-6 shadow-[0_10px_24px_rgba(26,115,232,0.08)]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)] text-white">
                  <CallOutlineIcon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-[15px] font-extrabold uppercase tracking-[0.04em] text-[var(--brand)]">
                  Página de llamada
                </p>
                <p className="mt-2 text-[24px] font-black tracking-[-0.04em] text-[#101820]">
                  Número por definir
                </p>
                <p className="mx-auto mt-3 max-w-[320px] text-[14px] leading-[1.45] text-[#5d6674]">
                  Aquí mostraremos el número para llamar a un asesor.
                </p>
              </div>
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
                onClick={handleZipCodeContinue}
                disabled={normalizeZipCode(answers.zipCode).length !== 5}
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 text-[18px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-45 hover:bg-[var(--brand-dark)]"
              >
                <span>Confirmar ZIP code</span>
                <NextArrowIcon className="h-[18px] w-[18px]" />
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
                onClick={() => transitionTo("phone", "forward")}
                disabled={!answers.firstName.trim() || !answers.lastName.trim()}
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 text-[18px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-45 hover:bg-[var(--brand-dark)]"
              >
                <span>Seguir</span>
                <NextArrowIcon className="h-[18px] w-[18px]" />
              </button>
            </div>
          ) : null}

          {currentStep === "phone" ? (
            <div className={`mt-8 flex w-full max-w-[460px] flex-col gap-4 md:mt-10 ${animationClass}`}>
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

                <input
                  id="phone-number"
                  name="tel"
                  value={formatPhoneDigits(answers.phoneNumber)}
                  onChange={(event) => {
                    setAnswers((prev) => ({
                      ...prev,
                      phoneNumber: event.target.value,
                    }));
                    setPhoneError("");
                  }}
                  placeholder="000 000 0000"
                  inputMode="tel"
                  autoComplete="tel"
                  enterKeyHint="next"
                  className="h-[58px] min-w-0 flex-1 rounded-[16px] border border-[#9c9c9c] bg-white px-5 text-[17px] text-[#101820] outline-none transition focus:border-[var(--brand)]"
                />
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
                {phoneError}
              </p>

              <p className="min-h-[22px] text-[14px] text-[#d14c4c]">
                {emailError}
              </p>

              <button
                type="button"
                onClick={finishVisualFlow}
                disabled={isFinishingFlow}
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 text-[18px] font-semibold text-white transition disabled:cursor-wait disabled:opacity-70 hover:bg-[var(--brand-dark)]"
              >
                <span>Ver mi cotización ahora</span>
                {isFinishingFlow ? (
                  <span
                    aria-hidden="true"
                    className="h-[16px] w-[16px] rounded-full border-2 border-white/35 border-t-white animate-spin"
                  />
                ) : (
                  <NextArrowIcon className="h-[18px] w-[18px]" />
                )}
              </button>

              <p className="min-h-[22px] text-[14px] text-[#d14c4c]">
                {submitError}
              </p>
            </div>
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
                onClick={finishVisualFlow}
                disabled={isFinishingFlow}
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 text-[18px] font-semibold text-white transition disabled:cursor-wait disabled:opacity-70 hover:bg-[var(--brand-dark)]"
              >
                {isFinishingFlow ? (
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

          {currentStep !== "disqualified" ? (
            <>
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
          <div className="mt-9 flex w-full justify-center">
            <div className="inline-flex min-h-[46px] max-w-[360px] items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 text-white shadow-[0_10px_20px_rgba(26,115,232,0.2)]">
              <CallOutlineIcon className="h-[19px] w-[19px] shrink-0" />
              <span className="text-center text-[14px] font-extrabold leading-[1.15] tracking-[-0.02em] md:text-[15px]">
                En el siguiente paso llamarás a un asesor
              </span>
            </div>
          </div>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  if (!isDisqualificationCheckComplete) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-[var(--ink)]">
      <CallFunnelPixels currentStep={currentStep} />
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800&display=swap");
      `}</style>
      <header className="border-b border-black/6 bg-white/96 shadow-[0_6px_18px_rgba(18,31,53,0.08)] backdrop-blur-sm">
        <div className="mx-auto flex h-[60px] w-full max-w-[1200px] items-center justify-between px-4 md:relative md:justify-center">
          <Image
            src="/media/better-life-logo.png"
            alt="Better Life"
            width={180}
            height={48}
            priority
            className="h-auto w-[148px] md:w-[160px]"
          />
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[#191919] md:absolute md:right-4">
            <Image
              src="/media/secure-call-badge.png"
              alt="Secure Form"
              width={150}
              height={32}
              className="h-auto w-[128px] md:w-[136px]"
            />
          </div>
        </div>
      </header>

      {isSuccessPage ? (
        <section className="px-0 py-0 md:px-4 md:py-6">{renderSuccessPage()}</section>
      ) : (
        <>
          <div className="mx-auto flex min-h-[calc(100vh-60px)] w-full max-w-[1200px] flex-col items-center px-3 pb-6 pt-8 md:px-4 md:pb-10 md:pt-4">
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
