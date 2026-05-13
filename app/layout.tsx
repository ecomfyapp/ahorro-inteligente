import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Better Life IUL Insurance",
  description:
    "Consulta opciones de seguros de vida IUL con asesores licenciado.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/media/best-life-icon.png",
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
