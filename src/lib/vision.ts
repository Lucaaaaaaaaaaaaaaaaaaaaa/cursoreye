export const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "";
export const NVIDIA_VISION_MODEL = process.env.NVIDIA_VISION_MODEL || "meta/llama-3.2-90b-vision-instruct";
export const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
export const HTTP_PROXY = process.env.HTTP_PROXY || "http://127.0.0.1:3213";

export interface VisionResult {
  description: string;
  detectedApp: string | null;
  elements: { type: string; text: string; bounds?: { x: number; y: number; w: number; h: number } }[];
  suggestedActions: { action: string; target: string; description: string }[];
  error?: string;
}

export interface ChatResponse {
  message: string;
  suggestedActions?: string[];
  needsAction: boolean;
  actionPlan?: { action: string; params: Record<string, any> };
}

export async function analyzeScreen(imageBase64: string, prompt?: string): Promise<VisionResult> {
  const systemPrompt = `You are CursorEye, an AI that watches the user's screen and helps when asked. Given a screenshot:
1. Identify what app is currently active (name only: e.g. "Figma", "Chrome", "Terminal", "VS Code")
2. Describe what's on screen briefly
3. Identify interactive UI elements with their approximate position (percentage of screen)
4. Suggest actions the user MIGHT want — but don't be pushy

Respond in JSON:
{
  "detectedApp": "App Name or null",
  "description": "brief description",
  "elements": [{"type": "button|input|link|menu|text", "text": "label", "bounds": {"x":50,"y":30,"w":10,"h":5}}],
  "suggestedActions": [{"action": "click|type|scroll|copy", "target": "element", "description": "why"}]
}

IMPORTANT: bounds are percentages of screen (0-100). x,y is top-left corner. This is critical for precise clicking.`;

  const userPrompt = prompt || "Analyze this screen. What app is active? What can I help with?";

  const payload = {
    model: NVIDIA_VISION_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } },
          { type: "text", text: userPrompt },
        ],
      },
    ],
    max_tokens: 2048,
    temperature: 0.2,
    top_p: 0.7,
    stream: false,
  };

  try {
    const response = await fetch(NVIDIA_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { description: "", detectedApp: null, elements: [], suggestedActions: [], error: `API error ${response.status}: ${errText.slice(0, 200)}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}

    return { description: content, detectedApp: null, elements: [], suggestedActions: [] };
  } catch (err: any) {
    return { description: "", detectedApp: null, elements: [], suggestedActions: [], error: err.message };
  }
}

export async function generateChatResponse(
  screenContext: VisionResult,
  userMessage: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<ChatResponse> {
  const systemPrompt = `You are CursorEye — a helpful, friendly AI that can see the user's screen and act on their computer. Your personality:
- You're like a smart colleague sitting next to them, not a robot
- When the user opens an app, you casually mention you can help with it
- You NEVER take action without the user asking first
- You're concise — no walls of text
- You suggest things naturally, like "I noticed you could also..." rather than "I recommend you should..."
- If the user says do something, you do it fast and report back

Current screen: ${screenContext.detectedApp ? `Active app: ${screenContext.detectedApp}` : "Unknown app"}
Screen summary: ${screenContext.description.slice(0, 500)}

Respond in JSON:
{
  "message": "your natural conversational response",
  "suggestedActions": ["optional", "quick", "actions"],
  "needsAction": true/false,
  "actionPlan": {"action": "click|type|scroll|wait|done", "params": {"x":50,"y":30,"text":"optional"}} or null
}

If the user is just chatting, needsAction = false and no actionPlan.
If the user explicitly asks you to do something, needsAction = true with actionPlan.
Action coordinates are percentages of screen (0-100).`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-10),
    { role: "user", content: userMessage },
  ];

  try {
    const response = await fetch(NVIDIA_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ model: NVIDIA_VISION_MODEL, messages, max_tokens: 1024, temperature: 0.4, top_p: 0.9, stream: false }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {}
    }
    return { message: content, needsAction: false };
  } catch (err: any) {
    return { message: `Sorry, I hit an error: ${err.message}`, needsAction: false };
  }
}

export async function decideAction(screenContext: VisionResult, userGoal: string): Promise<{ action: string; params: Record<string, any>; reasoning: string }> {
  const payload = {
    model: NVIDIA_VISION_MODEL,
    messages: [
      {
        role: "system",
        content: `You are CursorEye action planner. Given screen context and a user goal, decide the next action. Be FAST and PRECISE — no hesitation.

Coordinates are PERCENTAGES of screen (0-100). x=0 is left, x=100 is right. y=0 is top, y=100 is bottom.

Return JSON: {"action":"click|type|scroll|wait|done","params":{"x":50,"y":30,"text":"optional"},"reasoning":"why"}`,
      },
      {
        role: "user",
        content: `Screen: ${JSON.stringify(screenContext).slice(0, 3000)}\n\nGoal: ${userGoal}\n\nWhat's the next action? Be precise with coordinates.`,
      },
    ],
    max_tokens: 256,
    temperature: 0.05,
    stream: false,
  };

  try {
    const response = await fetch(NVIDIA_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { action: "wait", params: {}, reasoning: content };
  } catch (err: any) {
    return { action: "wait", params: {}, reasoning: `Error: ${err.message}` };
  }
}
