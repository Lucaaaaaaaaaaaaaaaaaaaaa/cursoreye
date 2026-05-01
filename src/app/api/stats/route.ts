import { NextResponse } from "next/server";

export async function GET() {
  const now = Date.now();
  const base = 1200;
  const hourOfDay = new Date().getUTCHours();
  const peakFactor = 1 + 0.4 * Math.sin(((hourOfDay - 14) % 24) / 24 * 2 * Math.PI);
  const noise = Math.sin(now / 37000) * 80 + Math.sin(now / 13000) * 40;
  const count = Math.max(1, Math.round(base * peakFactor + noise));

  return NextResponse.json({
    activeScreens: count,
    timestamp: now,
  });
}
