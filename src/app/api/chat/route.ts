import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/vision";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, message, history, apiKey, model, baseUrl, proxyUrl } = body;

    if (!message) {
      return NextResponse.json({ error: "message field required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured. Go to Settings to add your key." }, { status: 400 });
    }

    const config = { apiKey, model, baseUrl };

    let screenContext;
    if (image) {
      const { analyzeScreen } = await import("@/lib/vision");
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
  } catch (err: any) {
    return NextResponse.json({ error: `Server error: ${err.message}`, needsAction: false }, { status: 500 });
  }
}
