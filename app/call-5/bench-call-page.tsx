import Image from "next/image";
import Script from "next/script";
import type { ReactElement, SVGProps } from "react";
import { createEventId, getUtmParams, pushGtmEvent } from "@/lib/gtm-events";

const phoneNumber = process.env.NEXT_PUBLIC_PAY_PER_CALL_PHONE_NUMBER || "+18882882203";
const phoneDisplay = phoneNumber;
const telHref = `tel:${phoneNumber}`;
const ringbaCampaignId = process.env.NEXT_PUBLIC_RINGBA_CAMPAIGN_ID || "";
const ringbaScriptUrl = /^CA[a-zA-Z0-9]+$/.test(ringbaCampaignId)
  ? `//b-js.ringba.com/${ringbaCampaignId}`
  : "";

const HERO_BG = "#0a3d91";
const ACCENT = "#f97316";

type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactElement;

function IconBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

function Phone(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </IconBase>
  );
}

function Clock(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </IconBase>
  );
}

function CheckCircle2(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  );
}

function ShieldCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  );
}

function TrendingUp(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </IconBase>
  );
}

function CircleDollarSign(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </IconBase>
  );
}

function BadgeCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.78 4 4 0 0 1 0-6.74Z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  );
}

function Users(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}

const services = [
  { title: "Estimación Personalizada", text: "Habla con un agente licenciado y descubre cuánto podrías recibir con una póliza IUL adaptada a ti." },
  { title: "Crecimiento Ligado al Mercado", text: "Tu dinero crece siguiendo índices como el S&P 500, sin sufrir pérdidas directas del mercado." },
  { title: "Protección para tu Familia", text: "Beneficio por fallecimiento que protege a los tuyos, más valor en efectivo al que puedes acceder en vida." },
  { title: "Acceso a Valor en Efectivo", text: "Usa el valor acumulado para emergencias, educación o tu retiro, con ventajas fiscales." },
  { title: "Verificación de Elegibilidad", text: "El agente confirma en minutos si calificas según tu edad, salud y metas financieras." },
  { title: "Planificación para el Retiro", text: "Construye un complemento para tu retiro con un vehículo flexible y libre de impuestos al retirar." },
];

const whyCards: { icon: IconComponent; title: string; text: string }[] = [
  { icon: Clock, title: "Rápido y Sencillo", text: "Una sola llamada y un agente licenciado te da tu estimación en minutos." },
  { icon: Users, title: "Agentes Licenciados", text: "Te conectamos con agentes licenciados en EE.UU. que conocen los seguros IUL." },
  { icon: ShieldCheck, title: "Sin Costo ni Compromiso", text: "La llamada y la estimación son completamente gratis. Tú decides si continuar." },
];

const steps = [
  { n: "1", title: "Llámanos", text: "Marca el número gratuito y conéctate con un agente licenciado disponible para ayudarte." },
  { n: "2", title: "Comparte tus Datos", text: "Cuéntale al agente tu edad, salud y metas para que pueda calcular tu estimación." },
  { n: "3", title: "Recibe tu Estimación", text: "Descubre cuánto podrías recibir con tu póliza IUL y confirma si calificas." },
];

const faqs = [
  { q: "¿Qué es un seguro IUL?", a: "Un IUL (Indexed Universal Life) es un seguro de vida permanente que combina protección por fallecimiento con un valor en efectivo que crece ligado a índices del mercado como el S&P 500." },
  { q: "¿Cuánto podría recibir?", a: "Depende de tu edad, salud y aporte mensual. Un agente licenciado te dará una estimación personalizada durante la llamada." },
  { q: "¿Cómo sé si califico?", a: "La mayoría de adultos entre 18 y 80 años califican. El agente lo confirma en minutos durante la llamada." },
  { q: "¿Tiene algún costo llamar?", a: "No. La llamada y la estimación son completamente gratis y sin compromiso alguno." },
];

type BenchCallPageProps = {
  ageGroup?: string;
  insuranceGoal?: string;
  leadId?: string;
};

export default function BenchCallPage({
  ageGroup = "",
  insuranceGoal = "",
  leadId = "",
}: BenchCallPageProps) {
  const ringbaTags = JSON.stringify({
    call5_age_group: ageGroup,
    call5_insurance_goal: insuranceGoal,
    lead_id: leadId,
  });
  const trackContactClick = () => {
    pushGtmEvent("Contact", {
      event_id: createEventId("contact"),
      lead_id: leadId || undefined,
      external_id: leadId || undefined,
      ringba_phone_number: phoneNumber,
      country: "US",
      ...getUtmParams(),
    });
  };

  return (
    <main className="min-h-screen bg-white text-slate-800">
      <Script id="ringba-call-5-tags" strategy="afterInteractive">
        {`
          window._rgba_tags = window._rgba_tags || [];
          window._rgba_tags.push(${ringbaTags});
        `}
      </Script>
      {ringbaScriptUrl ? (
        <Script id="ringba-call-5-number-pool" src={ringbaScriptUrl} strategy="afterInteractive" />
      ) : null}

      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-2" aria-label="Better Life">
            <Image src="/media/better-life-logo.png" alt="Better Life" width={180} height={48} className="h-7 w-auto" priority />
          </a>
          <a href={telHref} onClick={trackContactClick} className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold sm:text-base" style={{ color: HERO_BG }}>
            <Phone className="h-4 w-4 shrink-0" />
            <span>{phoneDisplay}</span>
          </a>
        </nav>
      </header>

      <section id="top" style={{ backgroundColor: HERO_BG }} className="text-white">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-10 text-center lg:px-8 lg:pb-28 lg:pt-14">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm">
            <BadgeCheck className="h-4 w-4" style={{ color: ACCENT }} />
            <span>Estimación Gratis con un Agente Licenciado</span>
          </div>
          <h1 className="mx-auto max-w-4xl text-3xl font-extrabold leading-tight sm:text-4xl md:text-6xl">
            Descubre cuánto podrías recibir con tu{" "}
            <span style={{ color: ACCENT }}>Seguro IUL.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85 md:text-xl">
            Llama y un agente licenciado te dará una estimación personalizada y verificará si calificas. Sin costo ni compromiso, todo por teléfono en minutos.
          </p>

          <div className="mt-10">
            <a href={telHref} onClick={trackContactClick} className="block whitespace-nowrap text-[clamp(1.75rem,9vw,2.5rem)] font-bold tracking-tight md:text-3xl">
              {phoneDisplay}
            </a>
            <a
              href={telHref}
              onClick={trackContactClick}
              className="mt-6 inline-flex items-center gap-3 rounded-md px-8 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: "#16a34a" }}
            >
              <Phone className="h-5 w-5" /> Llamar Ahora
            </a>
            <p className="mx-auto mt-6 max-w-xl text-sm text-white/70">
              Al llamar, aceptas ser contactado por un agente licenciado independiente para recibir información sobre seguros IUL.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm">
            <div className="inline-flex items-center gap-2"><Clock className="h-4 w-4" style={{ color: ACCENT }} /> Estimación en Minutos</div>
            <div className="inline-flex items-center gap-2"><TrendingUp className="h-4 w-4" style={{ color: ACCENT }} /> Crecimiento Ligado al Mercado</div>
            <div className="inline-flex items-center gap-2"><CircleDollarSign className="h-4 w-4" style={{ color: ACCENT }} /> Sin Costo ni Compromiso</div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-extrabold md:text-5xl" style={{ color: HERO_BG }}>¿Por Qué Llamarnos?</h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-slate-600">
            Hacemos simple descubrir si un seguro IUL es para ti. Una llamada te conecta con un agente licenciado que te dará una estimación personalizada, sin formularios, sin esperas, sin compromiso.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {whyCards.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: `${HERO_BG}15` }}>
                  <Icon className="h-6 w-6" style={{ color: HERO_BG }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: HERO_BG }}>{title}</h3>
                <p className="mt-2 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a href={telHref} onClick={trackContactClick} className="inline-flex items-center gap-3 rounded-md px-8 py-4 text-lg font-bold text-white shadow-lg" style={{ backgroundColor: ACCENT }}>
              <Phone className="h-5 w-5" /> Habla con un Agente Licenciado
            </a>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-extrabold md:text-5xl" style={{ color: HERO_BG }}>Lo Que un Agente Puede Hacer Por Ti</h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-slate-600">
            Sea cual sea tu meta financiera, un agente licenciado puede ayudarte a entender cómo un seguro IUL podría encajar en tu plan.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <article key={s.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold" style={{ color: HERO_BG }}>{s.title}</h3>
                <p className="mt-2 text-slate-600">{s.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center gap-4">
            <a href={telHref} onClick={trackContactClick} className="whitespace-nowrap text-[clamp(1.5rem,7vw,2.25rem)] font-extrabold md:text-4xl" style={{ color: HERO_BG }}>{phoneDisplay}</a>
            <a href={telHref} onClick={trackContactClick} className="inline-flex items-center gap-3 rounded-md px-8 py-4 text-lg font-bold text-white shadow-lg" style={{ backgroundColor: ACCENT }}>
              <Phone className="h-5 w-5" /> Habla con un Agente
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-extrabold md:text-5xl" style={{ color: HERO_BG }}>Cómo Funciona</h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-slate-600">
            Tres pasos simples para descubrir cuánto podrías recibir con tu seguro IUL.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-extrabold text-white" style={{ backgroundColor: ACCENT }}>
                  {s.n}
                </div>
                <h3 className="text-xl font-bold" style={{ color: HERO_BG }}>{s.title}</h3>
                <p className="mt-2 text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: HERO_BG }} className="px-5 py-20 text-white lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm uppercase tracking-widest" style={{ color: ACCENT }}>No Esperes</p>
          <h2 className="text-4xl font-extrabold md:text-5xl">Cada Año Cuenta para tu Futuro</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
            Cuanto antes empieces, mayor podría ser el valor en efectivo acumulado en tu póliza IUL. No dejes para mañana la protección de tu familia y tu retiro. Llama ahora y conoce tus opciones.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <a href={telHref} onClick={trackContactClick} className="whitespace-nowrap text-[clamp(1.75rem,8vw,3rem)] font-extrabold md:text-5xl">{phoneDisplay}</a>
            <a href={telHref} onClick={trackContactClick} className="inline-flex items-center gap-3 rounded-md px-8 py-4 text-lg font-bold text-white shadow-lg" style={{ backgroundColor: ACCENT }}>
              <Phone className="h-5 w-5" /> Solicita tu Estimación
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-4xl font-extrabold md:text-5xl" style={{ color: HERO_BG }}>Preguntas Frecuentes sobre IUL</h2>
          <div className="mt-10 space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between text-lg font-bold" style={{ color: HERO_BG }}>
                  {f.q}
                  <CheckCircle2 className="h-5 w-5 transition-transform group-open:rotate-45" style={{ color: ACCENT }} />
                </summary>
                <p className="mt-3 text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: HERO_BG }} className="px-5 py-20 text-center text-white lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-extrabold md:text-5xl">¿Listo para Saber Cuánto Podrías Recibir?</h2>
          <p className="mt-4 text-lg text-white/85">Llama ahora y un agente licenciado te dará tu estimación personalizada en minutos.</p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <a href={telHref} onClick={trackContactClick} className="whitespace-nowrap text-[clamp(1.75rem,8vw,3rem)] font-extrabold md:text-5xl">{phoneDisplay}</a>
            <a href={telHref} onClick={trackContactClick} className="inline-flex items-center gap-3 rounded-md px-8 py-4 text-lg font-bold text-white shadow-lg" style={{ backgroundColor: "#16a34a" }}>
              <Phone className="h-5 w-5" /> Llamar Ahora
            </a>
            <p className="mt-4 max-w-xl text-sm text-white/70">
              Al llamar, aceptas ser contactado por un agente licenciado independiente para recibir información sobre seguros IUL.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 px-5 py-12 text-slate-300 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-3 text-xs leading-relaxed">
          <p>© 2025 Better Life. All Rights Reserved.</p>
          <p>This site is not part of Facebook or Meta Platforms, Inc. Additionally, this site is not endorsed by Facebook in any way. &quot;Facebook&quot; is a registered trademark of Meta Platforms, Inc.</p>
          <p>Better Life is an independent promotional and advertising service. This website and the services offered are not sponsored, affiliated with, endorsed, or administered by Facebook. The content on this site has not been reviewed, approved, or certified by Facebook or any of its related entities.</p>
        </div>
      </footer>
    </main>
  );
}
