import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://paywithverigate.com";
const DESCRIPTION =
  "Pay with VeriGate. Every payment verified and auditable — identity and asset compliance checked before money moves. Powered by Cleanverse A-Pass + A-Token.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VeriGate — Compliance-first payments",
    template: "%s · VeriGate",
  },
  description: DESCRIPTION,
  applicationName: "VeriGate",
  keywords: [
    "VeriGate",
    "Pay with VeriGate",
    "compliance-first payments",
    "stablecoin payments",
    "A-Pass",
    "A-Token",
    "Cleanverse",
    "Monad",
    "Travel Rule",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "VeriGate",
    title: "VeriGate — Compliance-first payments",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "VeriGate — Compliance-first payments",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
