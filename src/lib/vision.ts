import { HttpsProxyAgent } from "https-proxy-agent";

export const HTTP_PROXY = process.env.HTTP_PROXY || "";

let proxyAgent: HttpsProxyAgent<string> | undefined;
try {
  if (HTTP_PROXY) proxyAgent = new HttpsProxyAgent(HTTP_PROXY);
} catch {}

function fetchOptions(extra: Record<string, unknown> = {}): Record<string, unknown> {
  const opts: Record<string, unknown> = { ...extra };
  if (proxyAgent) opts.agent = proxyAgent;
  return opts;
}

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
  fileDownload?: { url: string; filename: string };
}

export interface AIConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

function resolveConfig(partial?: Partial<AIConfig>): AIConfig {
  const input = partial || {};
  return {
    apiKey: input.apiKey || process.env.NVIDIA_API_KEY || "",
    model: input.model || process.env.NVIDIA_VISION_MODEL || "meta/llama-3.2-90b-vision-instruct",
    baseUrl: input.baseUrl || "https://integrate.api.nvidia.com/v1/chat/completions",
  };
}

export async function analyzeScreen(imageBase64: string, prompt?: string, config?: Partial<AIConfig>): Promise<VisionResult> {
  const cfg = resolveConfig(config);
  if (!cfg.apiKey) return { description: "", detectedApp: null, elements: [], suggestedActions: [], error: "API key not configured. Go to Settings to add your key." };

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
    model: cfg.model,
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
    const response = await fetch(cfg.baseUrl, fetchOptions({
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    }));

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
  conversationHistory: { role: string; content: string }[] = [],
  config?: Partial<AIConfig>
): Promise<ChatResponse> {
  const cfg = resolveConfig(config);
  if (!cfg.apiKey) return { message: "API key not configured. Go to Settings to add your key.", needsAction: false };

  const systemPrompt = `You are CursorEye — a helpful, friendly AI that can see the user's screen and act on their computer. Your personality:
- You're like a smart colleague sitting next to them, not a robot
- When the user opens an app, you casually mention you can help with it
- You NEVER take action without the user asking first
- You're concise — no walls of text
- You suggest things naturally, like "I noticed you could also..." rather than "I recommend you should..."
- If the user says do something, you do it fast and report back
- After performing actions, you ALWAYS verify your work by taking a screenshot and OCR-ing it

Current screen: ${screenContext.detectedApp ? `Active app: ${screenContext.detectedApp}` : "Unknown app"}
Screen summary: ${screenContext.description.slice(0, 500)}

## YOUR ABILITIES (via local Screen Agent):

### Screen Perception:
- **screenshot**: Take a screenshot of the whole screen. Params: {region: {x,y,w,h}} (optional crop, percentages)
- **ocr**: Read all text on screen. Returns text + positions. Params: {region} (optional)
- **verify**: Check if specific text appears on screen. Params: {target: "text to find", region}
- **get_active_app**: Get name of currently active application
- **screenshot_worker**: Take a screenshot of ONLY the Worker window (your own workspace). No params.
- **ocr_worker**: Read text from ONLY the Worker window (your own workspace). No params.

### Mouse Control (coordinates are percentages 0-100):
- **click**: Click at position. Params: {x, y, button: "left"|"right"|"center", count: 1}
- **double_click**: Double click. Params: {x, y}
- **right_click**: Right click. Params: {x, y}
- **drag**: Drag from A to B. Params: {x1, y1, x2, y2, duration: 0.5}
- **scroll**: Scroll at position. Params: {x, y, amount: 3, direction: "up"|"down"}

### Keyboard Control:
- **type**: Type text character by character. Params: {text: "hello world"}
- **shortcut**: Press keyboard shortcut. Params: {modifiers: ["cmd","shift"], key: "s"}

### Worker Window (YOUR OWN COMPUTER — separate macOS Terminal window):
The Worker window is YOUR dedicated workspace. It stays open even when the user is in a game or another app.
- **open_worker**: Open your dedicated worker Terminal window. Params: {title: "optional custom title"}
- **worker_type**: Type text into your worker window. Params: {text}
- **worker_run**: Execute a shell command in your worker window. Params: {command: "ls -la"}
- **worker_run_wait**: Execute a shell command, wait for output, then OCR your window to read the result. Params: {command: "ls -la", wait_seconds: 3}
- **screenshot_worker**: See what's in your worker window right now (screenshot)
- **ocr_worker**: Read the text currently displayed in your worker window

### File Generation (creates actual downloadable files, NOT just text in chat):
- **generate_file**: Create a real file on Desktop. Params: {file_type: "docx"|"pdf"|"txt"|"md"|"html"|"csv", content: "file content here", filename: "optional name.docx"}
  - For docx: use markdown-ish formatting (# Heading, ## Sub, etc.)
  - For csv: provide comma-separated data
  - IMPORTANT: When user asks for a document, letter, or report, use generate_file — do NOT just put the text in chat

### App Control:
- **open_app**: Open an application by name. Params: {app: "Safari"}

## IMPORTANT RULES:
1. When user asks you to create a document/file → use generate_file, NOT just chat text
2. After clicking/typing → use verify or ocr to confirm it worked
3. Worker window is YOUR OWN COMPUTER — use it for long operations, coding, running scripts. User can be in a game or other app, you work independently in your worker window
4. After running commands in worker window → use ocr_worker or worker_run_wait to read the output and see what happened
5. Coordinates are ALWAYS percentages (0-100) of screen dimensions
6. If unsure about screen state, take a screenshot or OCR first
7. You have TWO sets of eyes: screenshot/ocr for the USER's screen, screenshot_worker/ocr_worker for YOUR OWN workspace

Respond in JSON:
{
  "message": "your natural conversational response",
  "suggestedActions": ["optional", "quick", "actions"],
  "needsAction": true/false,
  "actionPlan": {"action": "one_of_the_actions_above", "params": {...}} or null
}

If the user is just chatting, needsAction = false and no actionPlan.
If the user explicitly asks you to do something, needsAction = true with actionPlan.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-10),
    { role: "user", content: userMessage },
  ];

  try {
    const response = await fetch(cfg.baseUrl, fetchOptions({
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ model: cfg.model, messages, max_tokens: 1024, temperature: 0.4, top_p: 0.9, stream: false }),
    }));

    if (!response.ok) {
      const errText = await response.text();
      return { message: `API error ${response.status}: ${errText.slice(0, 100)}`, needsAction: false };
    }

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

export async function decideAction(screenContext: VisionResult, userGoal: string, config?: Partial<AIConfig>): Promise<{ action: string; params: Record<string, any>; reasoning: string }> {
  const cfg = resolveConfig(config);
  if (!cfg.apiKey) return { action: "wait", params: {}, reasoning: "API key not configured" };

  const payload = {
    model: cfg.model,
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
    const response = await fetch(cfg.baseUrl, fetchOptions({
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    }));

    if (!response.ok) {
      const errText = await response.text();
      return { action: "wait", params: {}, reasoning: `API error ${response.status}: ${errText.slice(0, 100)}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { action: "wait", params: {}, reasoning: content };
  } catch (err: any) {
    return { action: "wait", params: {}, reasoning: `Error: ${err.message}` };
  }
}
