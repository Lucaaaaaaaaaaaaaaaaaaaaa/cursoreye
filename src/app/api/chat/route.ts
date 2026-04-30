import { NextRequest, NextResponse } from "next/server";
import { analyzeScreen, generateChatResponse } from "@/lib/vision";

export async function POST(req: NextRequest) {
  const { image, message, history } = await req.json();

  if (!message) {
    return NextResponse.json({ error: "message field required" }, { status: 400 });
  }

  let screenContext;
  if (image) {
    screenContext = await analyzeScreen(image);
  } else {
    screenContext = {
      description: "No screen capture provided",
      detectedApp: null,
      elements: [],
      suggestedActions: [],
    };
  }

  const response = await generateChatResponse(screenContext, message, history || []);
  return NextResponse.json(response);
}
