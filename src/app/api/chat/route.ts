import { NextRequest, NextResponse } from "next/server";
import { analyzeScreen, generateChatResponse } from "@/lib/vision";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { image, message, history, apiKey, model, baseUrl, proxyUrl } = await req.json();

  if (!message) {
    return NextResponse.json({ error: "message field required" }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured. Go to Settings to add your key." }, { status: 400 });
  }

  const config = { apiKey, model, baseUrl };

  let screenContext;
  if (image) {
    screenContext = await analyzeScreen(image, undefined, config);
  } else {
    screenContext = {
      description: "No screen capture provided",
      detectedApp: null,
      elements: [],
      suggestedActions: [],
    };
  }

  if (screenContext.error) {
    return NextResponse.json({ message: screenContext.error, needsAction: false });
  }

  const response = await generateChatResponse(screenContext, message, history || [], config);
  return NextResponse.json(response);
}
