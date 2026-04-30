export const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "";
export const NVIDIA_VISION_MODEL = process.env.NVIDIA_VISION_MODEL || "meta/llama-3.2-90b-vision-instruct";
export const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
export const HTTP_PROXY = process.env.HTTP_PROXY || "http://127.0.0.1:3213";

export interface VisionResult {
  description: string;
  elements: { type: string; text: string; bounds?: { x: number; y: number; w: number; h: number } }[];
  suggestedActions: { action: string; target: string; description: string }[];
  error?: string;
}

export async function analyzeScreen(imageBase64: string, prompt?: string): Promise<VisionResult> {
  const systemPrompt = `You are CursorEye, an AI screen analyst. Given a screenshot, you must:
1. Describe what's on screen
2. Identify interactive UI elements (buttons, inputs, links, menus)
3. Suggest actions the user might want to take

Respond in JSON format:
{
  "description": "brief description of the screen",
  "elements": [{"type": "button|input|link|menu|text", "text": "visible label", "bounds": {"x":0,"y":0,"w":0,"h":0}}],
  "suggestedActions": [{"action": "click|type|scroll|copy", "target": "element description", "description": "why this action"}]
}`;

  const userPrompt = prompt || "Analyze this screen and identify all interactive elements and suggest actions.";

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
      return { description: "", elements: [], suggestedActions: [], error: `API error ${response.status}: ${errText.slice(0, 200)}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}

    return { description: content, elements: [], suggestedActions: [] };
  } catch (err: any) {
    return { description: "", elements: [], suggestedActions: [], error: err.message };
  }
}

export async function decideAction(screenContext: VisionResult, userGoal: string): Promise<{ action: string; params: Record<string, any>; reasoning: string }> {
  const payload = {
    model: NVIDIA_VISION_MODEL,
    messages: [
      {
        role: "system",
        content: `You are CursorEye action planner. Given screen context and a user goal, decide the next action to take. Return JSON: {"action":"click|type|scroll|wait|done","params":{},"reasoning":"why"}`,
      },
      {
        role: "user",
        content: `Screen: ${JSON.stringify(screenContext).slice(0, 3000)}\n\nGoal: ${userGoal}\n\nWhat's the next action?`,
      },
    ],
    max_tokens: 512,
    temperature: 0.1,
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
