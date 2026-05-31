import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LenisInit from "@/components/layout/LenisInit";
import MorphNav from "@/components/layout/MorphNav";
import LoaderWrapper from "@/components/layout/LoaderWrapper";
import CustomCursor from "@/components/ui/CustomCursor";

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
      className={`${playfairDisplay.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-void text-white">
        <LoaderWrapper />
        <LenisInit />
        <CustomCursor />
        <MorphNav />
        {children}
      </body>
    </html>
  );
}
