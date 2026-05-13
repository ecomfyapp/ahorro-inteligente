import { cookies } from "next/headers";
import { Suspense, type ReactNode } from "react";

const metaPixelId = "1556647345340828";
const tiktokPixelId = "D7R6JR3C77U4TTGIG1DG";
const callFunnelPagePath = "/call-5";
const disqualificationCookieName = "better_life_call5_disqualified";

async function Call5PixelGate() {
  const cookieStore = await cookies();
  const isDisqualified = cookieStore.get(disqualificationCookieName)?.value === "1";

  if (isDisqualified) {
    return null;
  }

  return (
    <>
      <script
        id="meta-pixel-call-5"
        dangerouslySetInnerHTML={{
          __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${metaPixelId}');
          window.__callFunnelPageViews = window.__callFunnelPageViews || {};
          window.__callFunnelPageViews['${callFunnelPagePath}'] = true;
          fbq('track', 'PageView');
          (new Image()).src='https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1';
        `,
        }}
      />
      <script
        id="tiktok-pixel-call-5"
        dangerouslySetInnerHTML={{
          __html: `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
            ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
            ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
            ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");
            n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
            ttq.load('${tiktokPixelId}');
            ttq.page({
              content_id: 'call_iul',
              content_type: 'product',
              content_name: 'Seguro IUL Call Funnel'
            });
          }(window, document, 'ttq');
        `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

export default function Call5Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <Call5PixelGate />
      </Suspense>
      {children}
    </>
  );
}
