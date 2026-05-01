import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]" style={{ fontFamily: "inherit" }}>{children}</body>
    </html>
  );
}
