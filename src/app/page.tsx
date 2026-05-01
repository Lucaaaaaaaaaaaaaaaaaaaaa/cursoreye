import LiveCounter from "@/components/LiveCounter";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#06b6d4] opacity-80" />
              <div className="absolute inset-1 rounded-full bg-[var(--bg-primary)] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#6c5ce7]">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight">CursorEye</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#6c5ce7]/20 text-[#6c5ce7] border border-[#6c5ce7]/30">BETA</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Pricing</a>
            <a href="/dashboard" className="text-sm font-medium px-4 py-2 rounded-lg bg-[#6c5ce7] hover:bg-[#5a4bd6] transition-colors">Get Started</a>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#6c5ce7]/5 blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
      <LiveCounter />

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Your AI has
            <span className="gradient-hero"> eyes </span>
            and
            <span className="gradient-hero"> hands</span>
          </h1>

        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Not another chatbot. CursorEye watches your screen, notices when you&apos;re stuck or repeating yourself, and gently offers to help — only when you want it. The first non-intrusive screen AI.
        </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a href="/dashboard" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white font-semibold text-lg glow-accent hover:opacity-90 transition-opacity">
              Start Free — No Card Needed
            </a>
            <a href="#how" className="px-8 py-4 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[#6c5ce7]/50 transition-all font-medium text-lg">
              See it in action
            </a>
          </div>

          <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden screen-glow border border-[var(--border)]">
            <div className="bg-[var(--bg-card)] p-1">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border)]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff6b6b]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#ffb347]/80" />
                  <div className="w-3 h-3 rounded-full bg-[#00d2a0]/80" />
                </div>
                <span className="text-xs text-[var(--text-secondary)] ml-2 font-mono">CursorEye — Desktop Agent</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#6c5ce7]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6c5ce7]">CursorEye</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Hey! I noticed you opened Figma. I&apos;m pretty good with design tools — want a hand?</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--success)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--success)]">You</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Yeah, export all icons as PNGs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#6c5ce7]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6c5ce7" strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6c5ce7]">CursorEye</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Done! 72 files exported in 5 seconds. I also noticed 3 icons have inconsistent padding — want me to fix those?</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)] pulse-dot" />
                  <span className="text-xs font-mono text-[var(--success)]">Screen watching — 0.3s latency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Chatbots answer questions.<br />CursorEye does the work.</h2>
          <p className="text-[var(--text-secondary)] text-center max-w-2xl mx-auto mb-16">Every AI assistant is passive — you ask, it answers. CursorEye is the first AI that actively watches and acts.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /><line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" /></svg>,
                title: "Sees Everything",
                desc: "Real-time screen understanding via vision AI. Reads text, recognizes UI elements, understands context — not screenshots, continuous perception.",
                tag: "Vision",
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>,
                title: "Acts When Asked",
                desc: "Controls your mouse, keyboard, and clipboard. But only when you say so — no surprise takeovers. Fast, precise, human-like movements.",
                tag: "Action",
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" /></svg>,
                title: "Gentle Suggestions",
                desc: "Notices when you open an app and offers help — like a smart colleague, not a popup. You chat, it acts. Zero pressure.",
                tag: "Intelligence",
              },
            ].map((f) => (
              <div key={f.tag} className="gradient-border rounded-2xl p-8 card-hover bg-[var(--bg-card)]">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6c5ce7]/10 border border-[#6c5ce7]/20 text-xs font-mono text-[#6c5ce7] mb-6">{f.tag}</div>
                <div className="text-[var(--text-secondary)] mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">What it can do — that ChatGPT can&apos;t</h2>
          <p className="text-[var(--text-secondary)] text-center max-w-2xl mx-auto mb-16">It watches, it understands, it asks before it acts.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Detect when you open an app and offer relevant help", time: "Instant", icon: "👁️" },
              { title: "Export 24 Figma icons at 3 resolutions in 5 seconds", time: "~5 seconds", icon: "🎨" },
              { title: "Fill 100+ form rows from clipboard when you ask", time: "~8 seconds", icon: "📋" },
              { title: "Watch your terminal and warn before destructive commands", time: "Proactive", icon: "🛡️" },
              { title: "Chat naturally — not just Q&A, but real conversation", time: "Always on", icon: "💬" },
              { title: "Auto-rename downloaded files based on content", time: "Instant", icon: "📂" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[#6c5ce7]/30 transition-colors">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pay for what it sees</h2>
          <p className="text-[var(--text-secondary)] mb-16">Free to try. Scale when you need it.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Observer",
                price: "Free",
                period: "",
                desc: "Try it out on simple tasks",
                features: ["5 screen actions/day", "Text-only understanding", "Manual approval for every action", "Community support"],
                cta: "Start Free",
                highlight: false,
              },
              {
                name: "Operator",
                price: "$19",
                period: "/mo",
                desc: "For daily power users",
                features: ["Unlimited screen actions", "Full vision understanding", "Auto-approve safe actions", "Custom automation workflows", "Priority support"],
                cta: "Start Operating",
                highlight: true,
              },
              {
                name: "Commander",
                price: "$79",
                period: "/mo",
                desc: "For teams & heavy automation",
                features: ["Everything in Operator", "Multi-screen monitoring", "Team shared automations", "API access", "SSO & audit logs", "Dedicated support"],
                cta: "Start Commanding",
                highlight: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 ${plan.highlight ? "bg-gradient-to-b from-[#6c5ce7]/20 to-[var(--bg-card)] border-2 border-[#6c5ce7]/50 glow-accent" : "bg-[var(--bg-card)] border border-[var(--border)]"} flex flex-col`}>
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold mb-1">{plan.price}<span className="text-base font-normal text-[var(--text-secondary)]">{plan.period}</span></div>
                <p className="text-sm text-[var(--text-secondary)] mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" className="flex-shrink-0 mt-0.5"><path d="M20 6L9 17l-5-5" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/dashboard" className={`block text-center py-3 rounded-xl font-medium transition-all ${plan.highlight ? "bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white hover:opacity-90" : "border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-[#6c5ce7]/50"}`}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[var(--bg-secondary)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Your screen is the new API</h2>
          <p className="text-[var(--text-secondary)] text-lg mb-8">Every app, every website, every workflow — now accessible to AI without waiting for integrations.</p>
          <a href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#6c5ce7] to-[#a855f7] text-white font-semibold glow-accent hover:opacity-90 transition-opacity text-lg">
            Start Free
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </a>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="font-semibold text-white">CursorEye</span> — AI with eyes & hands
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
            <a href="mailto:hello@cursoreye.ai" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
