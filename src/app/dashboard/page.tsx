import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — CursorEye" };

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <nav className="border-b border-[var(--border)] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#06b6d4] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /></svg>
          </div>
          <span className="font-bold">CursorEye</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-xs font-mono border border-[var(--success)]/20">Observer Plan</span>
          <button className="px-4 py-2 rounded-lg bg-[#6c5ce7] text-sm font-medium hover:bg-[#5a4bd6] transition-colors">Upgrade</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Your Screen Agent</h1>
          <p className="text-[var(--text-secondary)]">Download the desktop agent to start. It watches your screen and executes actions on your command.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] pulse-dot" />
              Live Screen Feed
            </h2>
            <div className="aspect-video rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1" className="mx-auto mb-3 opacity-30"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                <p className="text-[var(--text-secondary)] text-sm mb-1">No agent connected</p>
                <p className="text-[var(--text-secondary)] text-xs">Install the desktop agent to start screen sharing</p>
              </div>
              <div className="absolute inset-0 pointer-events-none scan-line opacity-5">
                <div className="w-full h-px bg-[#6c5ce7]" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Today&apos;s Stats</h3>
              <div className="space-y-4">
                {[
                  { label: "Actions Taken", value: "0", max: "5" },
                  { label: "Screen Captures", value: "0", max: "∞" },
                  { label: "Time Saved", value: "0m", max: "" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[var(--text-secondary)]">{s.label}</span>
                      <span className="font-mono">{s.value}{s.max && <span className="text-[var(--text-secondary)]">/{s.max}</span>}</span>
                    </div>
                    {s.max && <div className="h-1.5 rounded-full bg-[var(--bg-primary)] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-[#6c5ce7] to-[#06b6d4]" style={{ width: "0%" }} /></div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {["Fill form from clipboard", "Auto-click repeated pattern", "Watch for errors"].map((a) => (
                  <button key={a} className="w-full text-left px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm hover:border-[#6c5ce7]/50 transition-colors text-[var(--text-secondary)] hover:text-white">
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold mb-4">Install Desktop Agent</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] hover:border-[#6c5ce7]/50 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--text-secondary)]"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              <div>
                <p className="text-sm font-medium">macOS</p>
                <p className="text-xs text-[var(--text-secondary)]">Apple Silicon & Intel</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] hover:border-[#6c5ce7]/50 transition-colors opacity-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--text-secondary)]"><path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .08V5.21L20 3zM3 13l6 .09v6.81l-6-1.15V13zm7 .18L20 13v8.5l-10-1.91V13.18z" /></svg>
              <div>
                <p className="text-sm font-medium">Windows</p>
                <p className="text-xs text-[var(--text-secondary)]">Coming soon</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] hover:border-[#6c5ce7]/50 transition-colors opacity-50">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--text-secondary)]"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" /></svg>
              <div>
                <p className="text-sm font-medium">Linux</p>
                <p className="text-xs text-[var(--text-secondary)]">Coming soon</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
