"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "ai" | "user" | "system";
  content: string;
  timestamp: Date;
}

interface DetectedApp {
  name: string;
  icon: string;
  timestamp: Date;
}

const MOCK_CONVERSATION: Message[] = [
  {
    id: "1",
    role: "ai",
    content: "Hey! I noticed you opened Figma. I'm pretty good with design tools — I can auto-export assets, batch-rename layers, or help you find that one component buried in your file. Anything I can help with?",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    role: "user",
    content: "Yeah actually, can you export all the icons as PNGs?",
    timestamp: new Date(Date.now() - 280000),
  },
  {
    id: "3",
    role: "ai",
    content: "On it. I see 24 icon frames across 3 pages. Exporting at 1x, 2x, and 3x — that's 72 files. They'll land in your Downloads folder in about 5 seconds.",
    timestamp: new Date(Date.now() - 270000),
  },
  {
    id: "4",
    role: "system",
    content: "Exported 72 PNGs → ~/Downloads/figma-icons-export/",
    timestamp: new Date(Date.now() - 265000),
  },
  {
    id: "5",
    role: "ai",
    content: "Done! 72 files exported. I also noticed 3 icons have slightly different padding — want me to fix those too?",
    timestamp: new Date(Date.now() - 260000),
  },
];

const APP_SUGGESTIONS: Record<string, string[]> = {
  Figma: ["Export assets", "Batch rename layers", "Find unused components", "Auto-layout cleanup"],
  "Google Chrome": ["Fill forms from clipboard", "Auto-scroll and extract data", "Monitor page changes"],
  Terminal: ["Auto-run repetitive commands", "Watch for error patterns", "Suggest command fixes"],
  "VS Code": ["Batch refactor", "Find and fix lint errors", "Generate boilerplate"],
  Slack: ["Draft replies", "Summarize unread channels", "Schedule messages"],
  Excel: ["Auto-fill formulas", "Clean data formats", "Generate pivot tables"],
  Notion: ["Auto-format pages", "Generate templates", "Link related docs"],
};

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>(MOCK_CONVERSATION);
  const [input, setInput] = useState("");
  const [detectedApp, setDetectedApp] = useState<DetectedApp | null>({
    name: "Figma",
    icon: "🎨",
    timestamp: new Date(),
  });
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Let me take a look at your screen... I can see what's going on. Give me a moment to figure out the best way to help.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const quickActions = detectedApp
    ? APP_SUGGESTIONS[detectedApp.name] || ["Take screenshot", "Read screen text", "Describe current view"]
    : ["Take screenshot", "Read screen text", "Describe current view"];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <nav className="border-b border-[var(--border)] px-6 h-14 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#06b6d4] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /></svg>
          </div>
          <span className="font-bold text-sm">CursorEye</span>
          {detectedApp && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
              {detectedApp.icon} {detectedApp.name}
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-xs font-mono border border-[var(--success)]/20">Observer</span>
          <button className="px-3 py-1.5 rounded-lg bg-[#6c5ce7] text-xs font-medium hover:bg-[#5a4bd6] transition-colors">Upgrade</button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
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
                    ? "bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)] font-mono text-xs rounded-bl-md"
                    : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] rounded-bl-md"
                }`}>
                  {msg.content}
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
            {detectedApp && messages.length <= 1 && (
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
                placeholder={detectedApp ? `Ask about ${detectedApp.name}, or anything on your screen...` : "Ask me anything about your screen..."}
                className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[#6c5ce7]/50 transition-colors"
              />
              <button
                onClick={() => sendMessage(input)}
                className="px-5 py-3 rounded-xl bg-[#6c5ce7] hover:bg-[#5a4bd6] transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="w-72 border-l border-[var(--border)] flex-shrink-0 overflow-y-auto p-4 space-y-4 hidden lg:block">
          <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-4">
            <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] pulse-dot" />
              Live Screen
            </h3>
            <div className="aspect-video rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1" className="mx-auto mb-2 opacity-30"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                <p className="text-[var(--text-secondary)] text-[10px]">Agent offline</p>
              </div>
              <div className="absolute inset-0 pointer-events-none scan-line opacity-5">
                <div className="w-full h-px bg-[#6c5ce7]" />
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-mono text-center">0.3s latency • 30fps capture</p>
          </div>

          <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-4">
            <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-3">Stats Today</h3>
            <div className="space-y-3">
              {[
                { label: "Actions", value: "1", max: "5" },
                { label: "Screenshots", value: "47", max: "" },
                { label: "Time saved", value: "12m", max: "" },
                { label: "Apps detected", value: "3", max: "" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)]">{s.label}</span>
                    <span className="font-mono text-white">
                      {s.value}
                      {s.max && <span className="text-[var(--text-secondary)]">/{s.max}</span>}
                    </span>
                  </div>
                  {s.max && (
                    <div className="h-1 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#6c5ce7] to-[#06b6d4]"
                        style={{ width: `${(parseInt(s.value) / parseInt(s.max)) * 100}%` }}
                      />
                    </div>
                  )}
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
            <div className="space-y-2">
              {[
                { name: "Figma", icon: "🎨", time: "Now" },
                { name: "Chrome", icon: "🌐", time: "2m ago" },
                { name: "Terminal", icon: "⬛", time: "8m ago" },
              ].map((app) => (
                <div key={app.name} className="flex items-center gap-2 text-xs">
                  <span>{app.icon}</span>
                  <span className="text-white flex-1">{app.name}</span>
                  <span className="text-[var(--text-secondary)] font-mono">{app.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
