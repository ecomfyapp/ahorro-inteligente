import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";
const siteUrl = "https://www.better-life.us";
const siteTitle = "Better Life";
const siteDescription = "Consulta opciones de seguros de vida IUL con asesores licenciados.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_URL ? defaultUrl : siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/media/better-life-icon.png",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    locale: "es_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      <body>
        {gtmId ? (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        ) : null}
        {children}
      </body>
    </html>
  );
}
