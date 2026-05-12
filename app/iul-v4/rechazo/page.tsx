import Image from "next/image";

function ShieldCheckIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 317.855 317.855" className={className} fill="currentColor">
      <path d="M158.929 317.855c-1.029 0-2.059-.159-3.051-.477-33.344-10.681-61.732-31.168-84.377-60.891-17.828-23.401-32.103-52.526-42.426-86.566C11.661 112.506 11.461 61.358 11.461 59.209c0-5.15 3.912-9.459 9.039-9.954.772-.075 78.438-8.048 132.553-47.347 3.504-2.546 8.249-2.543 11.753.001C218.906 41.207 296.582 49.18 297.36 49.256c5.123.5 9.034 4.807 9.034 9.953 0 2.149-.2 53.297-17.613 110.713-10.324 34.04-24.598 63.165-42.426 86.566-22.644 29.723-51.032 50.21-84.376 60.891-.992.317-2.021.476-3.05.476zM31.748 67.982c.831 16.784 4.062 55.438 16.604 96.591 21.405 70.227 58.601 114.87 110.576 132.746 52.096-17.916 89.335-62.711 110.713-133.202 12.457-41.074 15.653-79.434 16.472-96.134-22.404-3.269-80.438-14.332-127.186-45.785C112.175 53.648 54.153 64.713 31.748 67.982z" />
      <path d="M153.582 207.625c-2.372 0-4.68-.844-6.499-2.4l-36.163-30.926c-4.197-3.589-4.69-9.901-1.101-14.099 3.588-4.198 9.901-4.692 14.099-1.101l28.124 24.051 55.743-73.118c3.348-4.392 9.622-5.24 14.015-1.89 4.393 3.348 5.238 9.623 1.89 14.015l-62.155 81.53c-1.667 2.187-4.16 3.591-6.895 3.882-.353.037-.706.056-1.058.056z" />
    </svg>
  );
}

export default function IulV4RejectedPage() {
  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-[var(--ink)]">
      <header className="border-b border-transparent bg-white/96 shadow-[0_6px_18px_rgba(18,31,53,0.08)] backdrop-blur-sm">
        <div className="mx-auto flex h-[60px] w-full max-w-[1200px] items-center justify-center px-4">
          <Image
            src="/media/better-life-logo.png"
            alt="Better Life"
            width={190}
            height={60}
            priority
            className="h-[36px] w-[148px] object-contain md:h-[40px] md:w-[190px]"
          />
        </div>
      </header>

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
    </main>
  );
}
