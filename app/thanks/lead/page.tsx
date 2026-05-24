import {
  BadgeCheck,
  Bell,
  CheckCircle2,
  ClipboardList,
  Focus,
  Phone,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react";
import { Suspense } from "react";
import VercelThankYouTracker from "../vercel-thank-you-tracker";

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

const callSteps = [
  {
    title: "El número puede ser desconocido",
    description:
      "Trabajamos con asesores en todo el país. El código de área puede variar. ¡Contéstala!",
    icon: Zap,
  },
  {
    title: "Se presentará con nombre completo",
    description:
      "Tu asesor confirmará tu solicitud y se identificará. Es 100% profesional y gratuito.",
    icon: User,
  },
  {
    title: "Busca un lugar tranquilo",
    description:
      "La llamada es rápida - solo 10 a 15 minutos para ver tu precio exacto.",
    icon: Focus,
  },
];

const infoList = [
  ["Datos Personales", "Fecha de nacimiento, estado civil, ocupación"],
  ["Salud General", "Altura, peso, medicamentos, historial básico"],
  ["Ingresos & Objetivos", "Ingresos anuales, metas a 10-20 años"],
  ["Protección Deseada", "¿Cuánto necesita tu familia? (10-15x tu ingreso)"],
  ["Beneficiarios", "Nombres de quienes deseas proteger"],
];

const faqs = [
  [
    "¿Si no contesto la llamada?",
    "Intentaremos contactarte 2-3 veces en diferentes horarios del día.",
  ],
  ["¿Hay algún costo?", "No. La consulta es 100% gratuita y sin ningún compromiso de compra."],
  [
    "¿Necesito mucho dinero?",
    "No. Tenemos planes desde $100 hasta $5,000+ mensuales, adaptados a tu presupuesto.",
  ],
  [
    "¿Aplica para residentes?",
    "Sí. Muchos planes están disponibles independientemente de los requisitos de residencia. Tu asesor te explicará las opciones.",
  ],
];

export default function LeadThanksPage() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] px-0 py-0 text-[#13213c] md:px-4 md:py-6">
      <Suspense fallback={null}>
        <VercelThankYouTracker thankYouType="lead" />
      </Suspense>
      <div className="mx-auto w-full max-w-[490px] overflow-hidden bg-white">
        <section className="border-t border-[#f2d7d7] px-4 pb-6 pt-5 text-center md:px-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#18bf79] text-white shadow-[0_10px_24px_rgba(24,191,121,0.25)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-[20px] leading-none font-black tracking-[-0.04em]">
            ¡Felicidades!
          </h1>
          <p className="mt-2 text-[19px] leading-[1.08] font-black tracking-[-0.04em]">
            Tu Solicitud Fue <span className="text-[#16c96f]">Recibida</span>{" "}
            <BadgeCheck className="inline h-5 w-5 translate-y-[2px] text-[#64d98d]" />
          </p>
          <p className="mt-4 text-[14px] leading-[1.45] text-[#5e6781]">
            Un asesor certificado te llamará en los próximos{" "}
            <span className="font-black text-[#16c96f]">15 minutos.</span>
          </p>
        </section>

        <section className="border-t-[3px] border-[#20d47a] bg-[#ef3131] px-4 py-4 text-center md:px-6">
          <div className="flex items-center justify-center gap-2 text-[16px] font-black tracking-[-0.03em] text-[#151515]">
            <Phone className="h-4 w-4 text-[#9a52ff]" />
            <span>Prepárate - Te Llamamos Ahora</span>
          </div>
          <div className="mt-1 flex items-center justify-center gap-2 text-[12px] font-black tracking-[0.05em] text-white">
            <Bell className="h-5 w-5 text-[#ffdf59]" />
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
            Mantén tu teléfono cerca con <span className="font-black">sonido activado.</span>
            <br />
            La llamada es rápida - <span className="font-black">10 a 15 minutos</span> para ver tu precio exacto.
          </p>
        </section>

        <section className="border-t-[3px] border-[#ffbe2e] bg-[#fff1b8] px-4 py-4 md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f94848] px-3 py-1 text-[12px] font-black tracking-[0.02em] text-white">
              <Zap className="h-3 w-3" />
              MIRA ESTO AHORA
            </span>
            <h2 className="text-[17px] font-black tracking-[-0.03em] text-[#7b4a10]">
              Mira Esto Mientras Esperas
            </h2>
          </div>
          <p className="mt-3 text-[14px] leading-[1.4] text-[#7b4a10]">
            Descubre cómo proteger a tu familia MIENTRAS construyes riqueza libre de impuestos
          </p>

          <div className="mt-4 grid gap-3">
            {thankYouHighlights.map((item) => (
              <div key={item.title} className="rounded-[12px] border-l-[3px] border-[#15c978] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(16,24,32,0.05)]">
                <p className="text-[15px] font-black tracking-[-0.03em]">✓ {item.title}</p>
                <p className="mt-1 text-[13px] leading-[1.35] text-[#5d6782]">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t-[3px] border-[#f7a61f] bg-[#fffaf2] px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#f19a29]" />
            <h2 className="text-[16px] font-black tracking-[-0.03em]">Cómo Será La Llamada</h2>
          </div>

          <div className="mt-4 grid gap-3">
            {callSteps.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-[14px] border-l-[3px] border-[#4a80f0] bg-[#f8fafc] px-4 py-4">
                <div className="flex items-center gap-2 text-[15px] font-black tracking-[-0.03em]">
                  <Icon className="h-4 w-4 text-[#ff8f2d]" />
                  <span>{title}</span>
                </div>
                <p className="mt-3 text-[14px] leading-[1.45] text-[#5d6782]">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t-[3px] border-[#4a80f0] bg-[#eef5ff] px-4 py-4 md:px-6">
          <div className="flex items-center gap-2 text-[#2450c5]">
            <ShieldCheck className="h-5 w-5 text-[#59cb8f]" />
            <h2 className="text-[16px] font-black tracking-[-0.03em]">Ten Esta Info Lista</h2>
          </div>

          <div className="mt-4 grid gap-3">
            {infoList.map(([title, description]) => (
              <div key={title} className="flex items-start gap-3 rounded-[12px] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(16,24,32,0.04)]">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#7dd8a1]" />
                <div>
                  <p className="text-[14px] font-black tracking-[-0.03em]">{title}</p>
                  <p className="text-[13px] leading-[1.35] text-[#5d6782]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t-[3px] border-[#f08fd0] bg-white px-4 py-4 md:px-6">
          <h2 className="text-[16px] font-black tracking-[-0.03em]">Preguntas Rápidas</h2>
          <div className="mt-4 grid gap-3">
            {faqs.map(([title, description]) => (
              <div key={title} className="rounded-[14px] border-l-[3px] border-[#8d5bff] bg-[#fcfcfe] px-4 py-4">
                <p className="text-[15px] font-black tracking-[-0.03em]">{title}</p>
                <p className="mt-3 text-[14px] leading-[1.45] text-[#5d6782]">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t-[3px] border-[#ffbe2e] bg-[#1e2639] px-5 py-8 text-center text-white md:px-6">
          <Phone className="mx-auto h-10 w-10" />
          <h2 className="mt-4 text-[17px] leading-[1.4] font-semibold tracking-[-0.03em]">
            Mantén tu teléfono cerca y con <span className="font-black text-[#ffbe2e]">sonido activado.</span>
          </h2>
          <p className="mt-3 text-[14px] leading-[1.5] text-white/80 italic">
            Si ves una llamada entrante en los próximos <span className="font-black text-[#ffbe2e]">15 minutos</span> -
            somos nosotros. ¡Contéstala!
          </p>
          <p className="mx-auto mt-6 max-w-[380px] text-[14px] leading-[1.6] text-white/55">
            Better Life es una plataforma independiente de información sobre seguros. No somos una aseguradora.
            Los asesores mencionados están certificados y regulados por el departamento de seguros de su estado.
          </p>
        </section>
      </div>
    </main>
  );
}
