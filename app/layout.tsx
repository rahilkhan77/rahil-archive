import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { jsonLd } from "./schema";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

const title = "Rahil Khan — Full-Stack & AI Product Developer, Founder | Delhi";
const description =
  "Rahil Khan is a self-taught full-stack and AI product developer and solo founder from Delhi, India. He builds and ships his own products, including Viralaty, CodeCare, NEXCOD, and SHIP90.";
const siteUrl = "https://www.rahilkhan.site";
const ogImage = `${siteUrl}/rahil-khan.jpg`;

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteUrl),
  alternates: { canonical: `${siteUrl}/` },
  authors: [{ name: "Rahil Khan", url: siteUrl }],
  creator: "Rahil Khan",
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/`,
    siteName: "Rahil Khan",
    locale: "en_IN",
    type: "profile",
    images: [
      {
        url: ogImage,
        width: 400,
        height: 400,
        alt: "Rahil Khan",
      },
    ],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: [ogImage],
  },
  icons: {
    icon: "/rahil-khan.jpg",
    apple: "/rahil-khan.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${instrument.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
