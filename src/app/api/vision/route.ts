import { NextRequest, NextResponse } from "next/server";
import { analyzeScreen } from "@/lib/vision";

export async function POST(req: NextRequest) {
  const { image, prompt } = await req.json();

  if (!image) {
    return NextResponse.json({ error: "image field required (base64)" }, { status: 400 });
  }

  const result = await analyzeScreen(image, prompt);
  return NextResponse.json(result);
}
