import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono, Noto_Sans_PhagsPa, Roboto } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import LenisInit from "@/components/layout/LenisInit";
import MorphNav from "@/components/layout/MorphNav";
import LoaderWrapper from "@/components/layout/LoaderWrapper";

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const notoPhagsPa = Noto_Sans_PhagsPa({
  variable: "--font-phags-pa",
  subsets: ["latin"],
  weight: "400",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const bitcountGridSingle = localFont({
  src: "./fonts/bitcount-grid-single-latin.woff2",
  variable: "--font-bitcount",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Portfolio — Fullstack Creative Developer",
  description: "Dark-first · Editorial · AI-assisted · Precision meets craft.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${notoPhagsPa.variable} ${roboto.variable} ${bitcountGridSingle.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-void text-white">
        <LoaderWrapper />
        <LenisInit />
        <MorphNav />
        {children}
      </body>
    </html>
  );
}
