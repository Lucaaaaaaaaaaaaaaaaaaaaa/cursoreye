"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "ai" | "user" | "system";
  content: string;
  timestamp: Date;
  actionResult?: {
    action: string;
    success: boolean;
    detail?: string;
    filePath?: string;
  };
}

interface DetectedApp {
  name: string;
  icon: string;
  timestamp: Date;
}

interface Toast {
  id: string;
  appName: string;
  appIcon: string;
}

interface AIConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  proxyUrl: string;
}

type AgentStatus = "disconnected" | "connecting" | "connected" | "error";

const DEFAULT_CONFIG: AIConfig = {
  apiKey: "",
  model: "z-ai/glm-5.1",
  baseUrl: "https://integrate.api.nvidia.com/v1/chat/completions",
  proxyUrl: "",
};

const WELL_KNOWN_MODELS = [
  { id: "z-ai/glm-5.1", name: "GLM-5.1", provider: "Z-AI (Nvidia)" },
  { id: "meta/llama-3.2-90b-vision-instruct", name: "Llama 3.2 90B Vision", provider: "Meta (Nvidia)" },
  { id: "z-ai/glm4.7", name: "GLM-4.7", provider: "Z-AI (Nvidia)" },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "custom", name: "Custom model...", provider: "" },
];

function loadConfig(): AIConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const saved = localStorage.getItem("cursoreye-config");
    if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_CONFIG;
}

function saveConfig(cfg: AIConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem("cursoreye-config", JSON.stringify(cfg));
}

const APP_ICONS: Record<string, string> = {
  Figma: "🎨", "Google Chrome": "🌐", Chrome: "🌐", Terminal: "⬛", "VS Code": "💻",
  Slack: "💬", Excel: "📊", Notion: "📝", Safari: "🧭", Finder: "📁",
  Mail: "✉️", Spotify: "🎵", Xcode: "🔨", Discord: "🎙️", WhatsApp: "📱",
};

const APP_SUGGESTIONS: Record<string, string[]> = {
  Figma: ["Export assets", "Batch rename layers", "Find unused components", "Auto-layout cleanup"],
  "Google Chrome": ["Fill forms from clipboard", "Auto-scroll and extract data", "Monitor page changes"],
  Chrome: ["Fill forms from clipboard", "Auto-scroll and extract data", "Monitor page changes"],
  Terminal: ["Auto-run repetitive commands", "Watch for error patterns", "Suggest command fixes"],
  "VS Code": ["Batch refactor", "Find and fix lint errors", "Generate boilerplate"],
  Slack: ["Draft replies", "Summarize unread channels", "Schedule messages"],
  Excel: ["Auto-fill formulas", "Clean data formats", "Generate pivot tables"],
  Notion: ["Auto-format pages", "Generate templates", "Link related docs"],
};

function getAppIcon(appName: string): string {
  return APP_ICONS[appName] || "🖥️";
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "Now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function Dashboard() {
  const [aiConfig, setAiConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempConfig, setTempConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("disconnected");
  const [agentWsUrl, setAgentWsUrl] = useState("ws://localhost:8765");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [detectedApp, setDetectedApp] = useState<DetectedApp | null>(null);
  const [appHistory, setAppHistory] = useState<DetectedApp[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [workerStatus, setWorkerStatus] = useState<"closed" | "open">("closed");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const actionSeqRef = useRef(0);

  useEffect(() => {
    const cfg = loadConfig();
    setAiConfig(cfg);
    setTempConfig(cfg);
    setConfigLoaded(true);
    if (!cfg.apiKey) setShowSettings(true);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAppHistory((prev) => [...prev]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const showToast = useCallback((appName: string, appIcon: string) => {
    const toast: Toast = { id: Date.now().toString(), appName, appIcon };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 8000);
  }, []);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  const handleAppDetected = useCallback(
    (appName: string) => {
      const icon = getAppIcon(appName);
      const newApp: DetectedApp = { name: appName, icon, timestamp: new Date() };
      setDetectedApp(newApp);
      setAppHistory((prev) => {
        const filtered = prev.filter((a) => a.name !== appName);
        return [newApp, ...filtered].slice(0, 10);
      });
      showToast(appName, icon);
    },
    [showToast]
  );

  const connectAgent = useCallback(() => {
    setAgentStatus("connecting");
    try {
      const ws = new WebSocket(agentWsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setAgentStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "app_detected" && data.app) {
            handleAppDetected(data.app);
          }
        } catch {}
      };

      ws.onclose = () => {
        setAgentStatus("disconnected");
        wsRef.current = null;
      };

      ws.onerror = () => {
        setAgentStatus("error");
        wsRef.current = null;
      };
    } catch {
      setAgentStatus("error");
    }
  }, [agentWsUrl, handleAppDetected]);

  const disconnectAgent = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setAgentStatus("disconnected");
    setWorkerStatus("closed");
  }, []);

  const sendAgentCommand = useCallback(
    (action: string, params: Record<string, any> = {}): Promise<any> => {
      return new Promise((resolve, reject) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          reject(new Error("Agent not connected"));
          return;
        }
        const seq = ++actionSeqRef.current;
        const timeout = setTimeout(() => reject(new Error("Agent timeout")), 30000);
        const handler = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data._seq === seq) {
              clearTimeout(timeout);
              ws.removeEventListener("message", handler);
              resolve(data);
            }
          } catch {}
        };
        ws.addEventListener("message", handler);
        ws.send(JSON.stringify({ action, params, _seq: seq }));
      });
    },
    []
  );

  const executeActionPlan = useCallback(
    async (actionPlan: { action: string; params: Record<string, any> }) => {
      if (agentStatus !== "connected") {
        return {
          success: false,
          detail: "Agent not connected — connect the Screen Agent to execute actions.",
        };
      }
      try {
        const result = await sendAgentCommand(actionPlan.action, actionPlan.params);
        if (actionPlan.action === "open_worker" && result.success) {
          setWorkerStatus("open");
        }
        if (actionPlan.action === "generate_file" && result.success) {
          return { success: true, detail: `File saved to: ${result.path}`, filePath: result.path };
        }
        if (actionPlan.action === "verify") {
          return {
            success: result.found,
            detail: result.found
              ? `Verified: "${result.target}" found on screen`
              : `"${result.target}" not found on screen. Screen text: ${result.screen_text?.slice(0, 200) || "(empty)"}`,
          };
        }
        if (actionPlan.action === "ocr") {
          return { success: true, detail: result.text?.slice(0, 500) || "(no text found)" };
        }
        if (actionPlan.action === "ocr_worker") {
          return { success: true, detail: `Worker window text:\n${result.text?.slice(0, 500) || "(empty)"}` };
        }
        if (actionPlan.action === "screenshot_worker") {
          return { success: true, detail: `Worker window captured (${result.image_length} bytes)` };
        }
        if (actionPlan.action === "worker_run_wait") {
          return { success: true, detail: `Command output:\n${result.output?.slice(0, 500) || "(no output captured)"}` };
        }
        if (actionPlan.action === "get_active_app") {
          return { success: true, detail: `Active app: ${result.app}` };
        }
        return {
          success: result.success !== false,
          detail: result.error || JSON.stringify(result).slice(0, 300),
        };
      } catch (err: any) {
        return { success: false, detail: err.message };
      }
    },
    [agentStatus, sendAgentCommand]
  );

  const saveSettings = () => {
    setAiConfig(tempConfig);
    saveConfig(tempConfig);
    setShowSettings(false);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    if (!aiConfig.apiKey) {
      const noKeyMsg: Message = {
        id: Date.now().toString(),
        role: "system",
        content: "No API key configured. Click the gear icon to add your key.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, noKeyMsg]);
      setShowSettings(true);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
          proxyUrl: aiConfig.proxyUrl,
        }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.message || data.error || "Sorry, I couldn't process that.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (data.needsAction && data.actionPlan) {
        const actionResult = await executeActionPlan(data.actionPlan);
        const resultMsg: Message = {
          id: (Date.now() + 2).toString(),
          role: "system",
          content: actionResult.detail || (actionResult.success ? "Action completed." : "Action failed."),
          timestamp: new Date(),
          actionResult: {
            action: data.actionPlan.action,
            success: actionResult.success,
            detail: actionResult.detail,
            filePath: actionResult.filePath,
          },
        };
        setMessages((prev) => [...prev, resultMsg]);

        if (actionResult.success && data.actionPlan.action !== "verify" && data.actionPlan.action !== "ocr" && data.actionPlan.action !== "screenshot" && data.actionPlan.action !== "get_active_app") {
          const verifyResult = await executeActionPlan({ action: "verify", params: { target: "" } });
          if (!verifyResult.success && verifyResult.detail) {
            const verifyMsg: Message = {
              id: (Date.now() + 3).toString(),
              role: "system",
              content: `Self-check: ${verifyResult.detail}`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, verifyMsg]);
          }
        }
      }
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: "Connection error — could not reach AI backend.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = detectedApp
    ? APP_SUGGESTIONS[detectedApp.name] || ["Take screenshot", "Read screen text", "Describe current view"]
    : ["Take screenshot", "Read screen text", "Describe current view"];

  const agentConnected = agentStatus === "connected";

  if (!configLoaded) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <nav className="border-b border-[var(--border)] px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#06b6d4] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /></svg>
          </div>
          <span className="font-bold text-sm">CursorEye</span>
          {detectedApp && agentConnected && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
              {detectedApp.icon} {detectedApp.name}
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-mono border ${
            agentConnected
              ? "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20"
              : "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20"
          }`}>
            {agentConnected ? "Connected" : "Offline"}
          </span>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] transition-colors text-[var(--text-secondary)] hover:text-white"
            title="Settings"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-[#6c5ce7] text-xs font-medium hover:bg-[#5a4bd6] transition-colors">Upgrade</button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
            {!aiConfig.apiKey && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-[#6c5ce7]/10 flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <p className="text-sm text-white font-medium">Set up your AI connection</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4">Add your API key to start chatting with CursorEye</p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 rounded-lg bg-[#6c5ce7] text-sm font-medium hover:bg-[#5a4bd6] transition-colors"
                >
                  Open Settings
                </button>
              </div>
            )}
            {aiConfig.apiKey && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1" className="mb-4">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="12" r="8" strokeDasharray="4 4" />
                </svg>
                <p className="text-sm text-[var(--text-secondary)]">CursorEye is watching your screen</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Ask me anything, or I&apos;ll let you know when I spot something</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {msg.role !== "user" && (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                    msg.role === "ai" ? "bg-[#6c5ce7]/20" : "bg-[var(--bg-card)]"
                  }`}>
                    {msg.role === "ai" ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    )}
                  </div>
                )}
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-[#6c5ce7] text-white rounded-br-md"
                : msg.role === "system"
                ? msg.actionResult
                  ? msg.actionResult.success
                    ? "bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)] font-mono text-xs rounded-bl-md"
                    : "bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] font-mono text-xs rounded-bl-md"
                  : "bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)] font-mono text-xs rounded-bl-md"
                : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] rounded-bl-md"
            }`}>
              {msg.actionResult?.filePath ? (
                <div className="flex items-center gap-2">
                  <span>📄</span>
                  <span>{msg.content}</span>
                </div>
              ) : (
                msg.content
              )}
            </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 max-w-2xl mr-auto">
                <div className="w-7 h-7 rounded-full bg-[#6c5ce7]/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[var(--bg-card)] border border-[var(--border)]">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-[var(--border)] p-4">
            {detectedApp && agentConnected && messages.length === 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {quickActions.slice(0, 4).map((action) => (
                  <button
                    key={action}
                    onClick={() => sendMessage(action)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-white hover:border-[#6c5ce7]/50 transition-all"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder={detectedApp && agentConnected ? `Ask about ${detectedApp.name}, or anything on your screen...` : "Ask me anything about your screen..."}
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[#6c5ce7]/50 transition-colors"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isTyping}
                className="px-5 py-3 rounded-xl bg-[#6c5ce7] hover:bg-[#5a4bd6] transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="w-72 border-l border-[var(--border)] flex-shrink-0 overflow-y-auto p-4 space-y-4 hidden lg:block">
          <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-4">
            <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${agentConnected ? "bg-[var(--success)] pulse-dot" : "bg-[var(--danger)]"}`} />
              Screen Agent
            </h3>
    {agentConnected ? (
      <div className="space-y-2">
        <div className="aspect-video rounded-lg bg-[var(--bg-primary)] border border-[var(--success)]/20 flex items-center justify-center relative overflow-hidden">
          <div className="text-center">
            <p className="text-[var(--success)] text-[10px] font-mono">Agent active</p>
            <p className="text-[var(--text-secondary)] text-[9px] mt-0.5">{detectedApp ? `${detectedApp.icon} ${detectedApp.name}` : "Monitoring..."}</p>
          </div>
          <div className="absolute inset-0 pointer-events-none scan-line opacity-5">
            <div className="w-full h-px bg-[#6c5ce7]" />
          </div>
        </div>
        {workerStatus === "open" && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--success)]/20">
            <span className="text-xs">🔴</span>
            <span className="text-[10px] text-[var(--success)] font-mono">Worker window open</span>
          </div>
        )}
        <button
          onClick={disconnectAgent}
          className="w-full px-3 py-1.5 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-xs hover:bg-[var(--danger)]/20 transition-colors"
        >
          Disconnect
        </button>
      </div>
            ) : (
              <div className="space-y-3">
                <div className="aspect-video rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center">
                  <div className="text-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1" className="mx-auto mb-2 opacity-30"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
          <p className="text-[var(--text-secondary)] text-[10px]">Agent offline</p>
          </div>
        </div>
        <button
          onClick={() => {
            const cmd = 'bash /Users/tony/Desktop/LUCAAA/cursoreye/agent/start.sh';
            navigator.clipboard.writeText(cmd);
            alert(`1. Open Terminal (Cmd+Space → Terminal)\n2. Paste and run:\n\n   ${cmd}\n\nThis opens the Agent + Worker windows automatically.`);
          }}
          className="w-full px-3 py-2 rounded-lg bg-[#6c5ce7]/20 border border-[#6c5ce7]/30 text-[#6c5ce7] text-xs font-medium hover:bg-[#6c5ce7]/30 transition-colors"
        >
          Start Agent (copy command)
        </button>
        <div>
                  <label className="text-[10px] text-[var(--text-secondary)] mb-1 block">Agent WebSocket URL</label>
                  <input
                    type="text"
                    value={agentWsUrl}
                    onChange={(e) => setAgentWsUrl(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-xs text-white font-mono placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[#6c5ce7]/50"
                    placeholder="ws://localhost:8765"
                  />
                </div>
                <button
                  onClick={connectAgent}
                  disabled={agentStatus === "connecting"}
                  className="w-full px-3 py-2 rounded-lg bg-[#6c5ce7] text-xs font-medium hover:bg-[#5a4bd6] transition-colors disabled:opacity-50"
                >
                  {agentStatus === "connecting" ? "Connecting..." : "Connect Agent"}
                </button>
                {agentStatus === "error" && (
                  <p className="text-[var(--danger)] text-[10px]">Connection failed. Make sure the agent is running.</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-4">
            <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-3">Stats Today</h3>
            <div className="space-y-3">
              {[
                { label: "Screenshots", value: "47" },
                { label: "Time saved", value: "12m" },
                { label: "Apps detected", value: String(appHistory.length) },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">{s.label}</span>
                    <span className="font-mono text-white">{s.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-4">
            <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-3">Quick Actions</h3>
            <div className="space-y-1.5">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-xs hover:border-[#6c5ce7]/50 hover:text-white transition-colors text-[var(--text-secondary)]"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-4">
            <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-3">App History</h3>
            {appHistory.length === 0 ? (
              <p className="text-[10px] text-[var(--text-secondary)]">No apps detected yet</p>
            ) : (
              <div className="space-y-2">
                {appHistory.map((app) => (
                  <div key={`${app.name}-${app.timestamp.getTime()}`} className="flex items-center gap-2 text-xs">
                    <span>{app.icon}</span>
                    <span className="text-white flex-1">{app.name}</span>
                    <span className="text-[var(--text-secondary)] font-mono">{formatTimeAgo(app.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg mx-4 shadow-[0_0_80px_rgba(108,92,231,0.15)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <button
                onClick={() => { setShowSettings(false); setTempConfig(aiConfig); }}
                className="text-[var(--text-secondary)] hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">AI Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  {WELL_KNOWN_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (m.id === "custom") {
                          setTempConfig((c) => ({ ...c, model: "" }));
                        } else {
                          setTempConfig((c) => ({ ...c, model: m.id }));
                        }
                      }}
                      className={`px-3 py-2 rounded-lg border text-left transition-all ${
                        m.id !== "custom" && tempConfig.model === m.id
                          ? "border-[#6c5ce7] bg-[#6c5ce7]/10 text-white"
                          : m.id === "custom" && !WELL_KNOWN_MODELS.some((wm) => wm.id === tempConfig.model)
                          ? "border-[#6c5ce7] bg-[#6c5ce7]/10 text-white"
                          : "border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[#6c5ce7]/50"
                      }`}
                    >
                      <span className="text-xs font-medium block">{m.name}</span>
                      {m.provider && <span className="text-[10px] opacity-60">{m.provider}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {!WELL_KNOWN_MODELS.some((m) => m.id === tempConfig.model) && (
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Custom Model ID</label>
                  <input
                    type="text"
                    value={tempConfig.model}
                    onChange={(e) => setTempConfig((c) => ({ ...c, model: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-white font-mono placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[#6c5ce7]/50"
                    placeholder="org/model-name"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">API Key</label>
                <input
                  type="password"
                  value={tempConfig.apiKey}
                  onChange={(e) => setTempConfig((c) => ({ ...c, apiKey: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-white font-mono placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[#6c5ce7]/50"
                  placeholder="nvapi-..."
                />
                <p className="text-[10px] text-[var(--text-secondary)] mt-1.5">Your key is stored locally in your browser and never sent to our servers.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">API Base URL</label>
                <input
                  type="text"
                  value={tempConfig.baseUrl}
                  onChange={(e) => setTempConfig((c) => ({ ...c, baseUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-white font-mono placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[#6c5ce7]/50"
                  placeholder="https://integrate.api.nvidia.com/v1/chat/completions"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">CORS Proxy URL <span className="opacity-50">(optional)</span></label>
                <input
                  type="text"
                  value={tempConfig.proxyUrl}
                  onChange={(e) => setTempConfig((c) => ({ ...c, proxyUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-white font-mono placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[#6c5ce7]/50"
                  placeholder="http://127.0.0.1:3213/https://integrate.api.nvidia.com/..."
                />
                <p className="text-[10px] text-[var(--text-secondary)] mt-1.5">If you get CORS or connection errors, fill in a CORS proxy. Requests will go through this proxy instead of directly to the API. Leave empty to call API directly.</p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-[var(--border)]">
              <button
                onClick={() => { setShowSettings(false); setTempConfig(aiConfig); }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#6c5ce7] text-sm font-medium hover:bg-[#5a4bd6] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="fixed bottom-6 right-6 z-40 animate-[slideUp_0.3s_ease-out]"
          style={{ bottom: `${6 + toasts.indexOf(toast) * 5}rem` }}
        >
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 shadow-[0_0_40px_rgba(108,92,231,0.2)] max-w-xs">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{toast.appIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{toast.appName} detected</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">I&apos;m good with this app. Need a hand?</p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-[var(--text-secondary)] hover:text-white transition-colors text-lg leading-none"
              >
                &times;
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  sendMessage(`Hey, can you help me with ${toast.appName}?`);
                  dismissToast(toast.id);
                }}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#6c5ce7] text-xs font-medium hover:bg-[#5a4bd6] transition-colors"
              >
                Chat
              </button>
              <button
                onClick={() => dismissToast(toast.id)}
                className="px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
