import { NextRequest, NextResponse } from "next/server";
import { decideAction } from "@/lib/vision";

export async function POST(req: NextRequest) {
  const { screenContext, goal, apiKey, model, baseUrl } = await req.json();

  if (!screenContext || !goal) {
    return NextResponse.json({ error: "screenContext and goal required" }, { status: 400 });
  }

  const result = await decideAction(screenContext, goal, { apiKey, model, baseUrl });
  return NextResponse.json(result);
}
