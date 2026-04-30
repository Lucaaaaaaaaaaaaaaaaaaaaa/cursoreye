import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CursorEye — AI That Sees Your Screen & Acts For You",
  description: "Not a chatbot. An AI with eyes and hands. It watches your screen, understands what you're doing, and can take over to finish the job. The first autonomous screen AI.",
  keywords: ["AI assistant", "screen automation", "computer vision", "AI agent", "desktop automation"],
  openGraph: {
    title: "CursorEye — AI That Sees Your Screen & Acts For You",
    description: "Not a chatbot. An AI with eyes and hands. It watches your screen, understands what you're doing, and can take over to finish the job.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">{children}</body>
    </html>
  );
}
