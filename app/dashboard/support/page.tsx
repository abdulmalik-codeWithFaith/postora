"use client";

import { useState } from "react";
import Topbar from "@/components/dashboard/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type TicketStatus = "open" | "in_progress" | "resolved";
type Category     = "billing" | "technical" | "account" | "feature" | "other";

interface FAQ {
  q: string;
  a: string;
  category: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: Category;
  status: TicketStatus;
  date: string;
  lastReply: string;
}

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS: FAQ[] = [
  {
    q: "How does Postora automatically publish posts?",
    a: "Once you connect your social accounts and schedule a post, Postora uses the platform's official API to publish on your behalf at the exact time you set. No action needed from you.",
    category: "General",
  },
  {
    q: "Which social media platforms does Postora support?",
    a: "Postora currently supports Instagram, TikTok, and Facebook. Twitter/X is available on the Elite plan. More platforms are coming soon.",
    category: "General",
  },
  {
    q: "Can I edit a post after it's been scheduled?",
    a: "Yes. Go to Schedule & Publish, find the post in your queue, and click the edit icon. You can update the caption, time, or platforms before it goes live.",
    category: "Scheduling",
  },
  {
    q: "Why did my scheduled post fail to publish?",
    a: "This usually happens when your platform connection expires. Go to Connected Accounts and reconnect the affected platform. We'll also notify you by email when this happens.",
    category: "Scheduling",
  },
  {
    q: "How does the AI caption generator work?",
    a: "Postora uses Google's Gemini AI to analyze your product media and generate platform-ready captions. You can choose your brand tone, add context, and regenerate as many times as you need.",
    category: "AI Captions",
  },
  {
    q: "Can I customise the AI-generated captions?",
    a: "Absolutely. Generated captions are fully editable before you use them. You can also set your brand tone and keywords in Settings → Brand & Tone to make every caption feel more like you.",
    category: "AI Captions",
  },
  {
    q: "How do I upgrade or downgrade my plan?",
    a: "Go to Settings → Billing & Plan and choose the plan that fits. Upgrades take effect immediately. Downgrades apply at the end of your current billing period.",
    category: "Billing",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes. Postora uses industry-standard encryption for all payments. We never store your card details directly — all transactions are processed through our secure payment partner.",
    category: "Billing",
  },
  {
    q: "How do I disconnect a social media account?",
    a: "Go to Connected Accounts, find the platform you want to remove, and click Disconnect. Your existing posts won't be deleted, but future scheduled posts to that platform will be paused.",
    category: "Accounts",
  },
];

const FAQ_CATEGORIES = ["All", "General", "Scheduling", "AI Captions", "Billing", "Accounts"];

const MOCK_TICKETS: Ticket[] = [
  { id: "TKT-0042", subject: "Post failed to publish on Instagram",  category: "technical", status: "in_progress", date: "May 22, 2026", lastReply: "2 hours ago" },
  { id: "TKT-0039", subject: "Unable to connect Facebook page",       category: "account",   status: "resolved",    date: "May 18, 2026", lastReply: "May 20, 2026" },
  { id: "TKT-0031", subject: "Billing charge question",               category: "billing",   status: "resolved",    date: "May 10, 2026", lastReply: "May 11, 2026" },
];

const STATUS_MAP: Record<TicketStatus, { label: string; bg: string; color: string }> = {
  open:        { label: "Open",        bg: "rgba(55,138,221,0.12)",  color: "#378ADD" },
  in_progress: { label: "In progress", bg: "rgba(239,159,39,0.12)",  color: "#ef9f27" },
  resolved:    { label: "Resolved",    bg: "rgba(0,201,141,0.12)",   color: "#00C98D" },
};

const CATEGORY_LABELS: Record<Category, string> = {
  billing:   "Billing",
  technical: "Technical",
  account:   "Account",
  feature:   "Feature request",
  other:     "Other",
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function SupportPage() {
  const [search, setSearch]           = useState("");
  const [faqCategory, setFaqCategory] = useState("All");
  const [openFaq, setOpenFaq]         = useState<number | null>(null);
  const [activeSection, setSection]   = useState<"faq" | "ticket" | "tickets">("faq");

  // ── Filtered FAQs ────────────────────────────────────────────────────────────
  const filteredFaqs = FAQS.filter((f) => {
    const matchCat    = faqCategory === "All" || f.category === faqCategory;
    const matchSearch = search === "" || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <Topbar title="Help & Support" subtitle="Find answers or reach our team" />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Hero search ──────────────────────────────────────────────────── */}
        <div
          style={{
            background: "linear-gradient(135deg, var(--surface-2) 0%, rgba(0,201,141,0.06) 100%)",
            border: "1px solid var(--border)",
            borderRadius: 20, padding: "32px 28px",
            display: "flex", flexDirection: "column", alignItems: "center",
            textAlign: "center", gap: 16,
          }}
        >
          <div
            style={{
              width: 52, height: 52, borderRadius: 16,
              background: "var(--green-muted)",
              border: "1px solid rgba(0,201,141,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>
              How can we help?
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-3)" }}>Search our help articles or browse by category</p>
          </div>

          {/* Search */}
          <div style={{ width: "100%", maxWidth: 480, position: "relative" }}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search help articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px 12px 42px",
                background: "var(--surface-3)",
                border: "1px solid var(--border-hover)",
                borderRadius: 12, fontSize: 14,
                color: "var(--text-1)", outline: "none",
                transition: "border-color 0.2s", fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
            />
          </div>
        </div>

        {/* ── Quick links ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
          {[
            { emoji: "📚", label: "Browse FAQs",        action: () => setSection("faq") },
            { emoji: "🎫", label: "Submit a ticket",     action: () => setSection("ticket") },
            { emoji: "📋", label: "My tickets",          action: () => setSection("tickets") },
            { emoji: "💬", label: "Live chat",           action: () => {} },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                padding: "18px 16px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 14, cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                transition: "border-color 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-hover)";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLButtonElement).style.transform = "none";
              }}
            >
              <span style={{ fontSize: 26 }}>{item.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── FAQ section ──────────────────────────────────────────────────── */}
        {activeSection === "faq" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>
                Frequently Asked Questions
              </h3>
              {/* Category pills */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {FAQ_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFaqCategory(cat)}
                    style={{
                      padding: "5px 14px", borderRadius: 999, border: "none",
                      fontSize: 12, fontWeight: 500, cursor: "pointer",
                      background: faqCategory === cat ? "var(--green-muted)" : "var(--surface-2)",
                      color: faqCategory === cat ? "var(--green)" : "var(--text-3)",
                      border: `1px solid ${faqCategory === cat ? "rgba(0,201,141,0.25)" : "var(--border)"}`,
                      transition: "all 0.15s",
                    } as React.CSSProperties}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredFaqs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-3)" }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>🔍</p>
                <p style={{ fontSize: 14 }}>No results for "{search}"</p>
                <button
                  onClick={() => { setSearch(""); setFaqCategory("All"); }}
                  style={{ marginTop: 12, fontSize: 13, color: "var(--green)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredFaqs.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div
                      key={i}
                      style={{
                        background: "var(--surface-2)",
                        border: `1px solid ${isOpen ? "rgba(0,201,141,0.2)" : "var(--border)"}`,
                        borderRadius: 14,
                        overflow: "hidden",
                        transition: "border-color 0.2s",
                      }}
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        style={{
                          width: "100%", padding: "16px 20px",
                          background: "none", border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                          textAlign: "left",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                          <span
                            style={{
                              fontSize: 10, fontWeight: 600, padding: "2px 8px",
                              borderRadius: 999, flexShrink: 0,
                              background: "var(--surface-3)",
                              color: "var(--text-3)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            {faq.category}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{faq.q}</span>
                        </div>
                        <svg
                          width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke={isOpen ? "var(--green)" : "var(--text-3)"}
                          strokeWidth="2" strokeLinecap="round"
                          style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                        >
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>

                      {isOpen && (
                        <div
                          style={{
                            padding: "0 20px 18px 20px",
                            borderTop: "1px solid var(--border)",
                            paddingTop: 16,
                          }}
                        >
                          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>{faq.a}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
                            <span style={{ fontSize: 11, color: "var(--text-3)" }}>Was this helpful?</span>
                            <button style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 12px", fontSize: 12, color: "var(--text-2)", cursor: "pointer" }}>👍 Yes</button>
                            <button style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 12px", fontSize: 12, color: "var(--text-2)", cursor: "pointer" }}>👎 No</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Submit ticket ────────────────────────────────────────────────── */}
        {activeSection === "ticket" && (
          <TicketForm onSuccess={() => setSection("tickets")} />
        )}

        {/* ── My tickets ──────────────────────────────────────────────────── */}
        {activeSection === "tickets" && (
          <TicketsList tickets={MOCK_TICKETS} onNew={() => setSection("ticket")} />
        )}

        {/* ── Contact options ──────────────────────────────────────────────── */}
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 16, overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
              Still need help?
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 0 }}>
            {[
              {
                icon: "📧",
                title: "Email support",
                desc: "Send us an email and we'll respond within 24 hours",
                cta: "support@postora.co",
                href: "mailto:support@postora.co",
                badge: null,
              },
              {
                icon: "💬",
                title: "Live chat",
                desc: "Chat with our team in real time during business hours",
                cta: "Start chat",
                href: "#",
                badge: "Online",
              },
              {
                icon: "📖",
                title: "Documentation",
                desc: "Detailed guides for every Postora feature",
                cta: "Browse docs",
                href: "#",
                badge: null,
              },
            ].map((item, i) => (
              <div
                key={item.title}
                style={{
                  padding: "20px 24px",
                  borderRight: i < 2 ? "1px solid var(--border)" : "none",
                  display: "flex", flexDirection: "column", gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{item.title}</p>
                      {item.badge && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "rgba(0,201,141,0.1)", color: "var(--green)", border: "1px solid rgba(0,201,141,0.2)" }}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.55 }}>{item.desc}</p>
                <a
                  href={item.href}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 12, fontWeight: 600, color: "var(--green)",
                    textDecoration: "none", marginTop: 2,
                  }}
                >
                  {item.cta} →
                </a>
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TICKET FORM
// ─────────────────────────────────────────────────────────────────────────────
function TicketForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm]     = useState({ subject: "", category: "technical" as Category, message: "", email: "jane@example.com" });
  const [submitting, setSub] = useState(false);
  const [done, setDone]     = useState(false);

  function submit() {
    if (!form.subject.trim() || !form.message.trim()) return;
    setSub(true);
    // TODO: POST to /api/support/tickets
    setTimeout(() => {
      setSub(false);
      setDone(true);
      setTimeout(() => { setDone(false); onSuccess(); }, 1800);
    }, 1600);
  }

  if (done) {
    return (
      <div
        style={{
          background: "var(--surface-2)", border: "1px solid rgba(0,201,141,0.2)",
          borderRadius: 16, padding: "48px 28px",
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", gap: 12,
        }}
      >
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--green-muted)", border: "1px solid rgba(0,201,141,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 17, fontWeight: 700, color: "var(--text-1)" }}>Ticket submitted!</p>
        <p style={{ fontSize: 13, color: "var(--text-3)" }}>We'll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Submit a support ticket</p>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>We typically respond within 24 hours</p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: "rgba(0,201,141,0.1)", color: "var(--green)" }}>
          24h response
        </span>
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14 }}>
          {/* Email */}
          <SField label="Email address">
            <SInput value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="your@email.com" type="email" />
          </SField>

          {/* Category */}
          <SField label="Category">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
              style={{ width: "100%", padding: "11px 14px", background: "var(--surface-3)", border: "1px solid var(--border-hover)", borderRadius: 10, fontSize: 13, color: "var(--text-1)", outline: "none", colorScheme: "dark", cursor: "pointer" }}
            >
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </SField>
        </div>

        {/* Subject */}
        <SField label="Subject">
          <SInput value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} placeholder="Brief description of your issue" />
        </SField>

        {/* Message */}
        <SField label="Message">
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={5}
            placeholder="Describe your issue in detail — the more context, the faster we can help."
            style={{ width: "100%", padding: "12px 14px", background: "var(--surface-3)", border: "1px solid var(--border-hover)", borderRadius: 10, fontSize: 13, color: "var(--text-1)", resize: "none", outline: "none", lineHeight: 1.6, fontFamily: "inherit", transition: "border-color 0.2s" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
          />
        </SField>

        <button
          onClick={submit}
          disabled={submitting || !form.subject.trim() || !form.message.trim()}
          style={{
            padding: "12px 28px", background: "var(--green)", border: "none", borderRadius: 11,
            fontSize: 13, fontWeight: 600, color: "#0a0e14",
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting || !form.subject.trim() || !form.message.trim() ? 0.6 : 1,
            display: "flex", alignItems: "center", gap: 8,
            width: "fit-content", transition: "opacity 0.2s",
          }}
        >
          {submitting
            ? <><Spinner /> Submitting…</>
            : <><SendIcon /> Submit ticket</>
          }
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TICKETS LIST
// ─────────────────────────────────────────────────────────────────────────────
function TicketsList({ tickets, onNew }: { tickets: Ticket[]; onNew: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>My tickets</h3>
        <button
          onClick={onNew}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", background: "var(--green)",
            border: "none", borderRadius: 9,
            fontSize: 12, fontWeight: 600, color: "#0a0e14", cursor: "pointer",
          }}
        >
          <PlusIcon /> New ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)" }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>🎫</p>
          <p>No tickets yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tickets.map((ticket) => {
            const s = STATUS_MAP[ticket.status];
            return (
              <div
                key={ticket.id}
                style={{
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: 14, padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: 16,
                  transition: "border-color 0.15s", cursor: "pointer", flexWrap: "wrap",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-hover)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")}
              >
                {/* Ticket ID */}
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", fontFamily: "monospace", flexShrink: 0 }}>
                  {ticket.id}
                </span>

                {/* Subject + category */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {ticket.subject}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text-3)" }}>
                      {CATEGORY_LABELS[ticket.category]}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>Opened {ticket.date}</span>
                  </div>
                </div>

                {/* Last reply */}
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <p style={{ fontSize: 11, color: "var(--text-3)" }}>Last reply</p>
                  <p style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500, marginTop: 2 }}>{ticket.lastReply}</p>
                </div>

                {/* Status */}
                <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: s.bg, color: s.color, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELD + INPUT (local)
// ─────────────────────────────────────────────────────────────────────────────
function SField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}>{label}</label>
      {children}
    </div>
  );
}
function SInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "11px 14px", background: "var(--surface-3)", border: "1px solid var(--border-hover)", borderRadius: 10, fontSize: 13, color: "var(--text-1)", outline: "none", transition: "border-color 0.2s", fontFamily: "inherit" }}
      onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
function SendIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}
function PlusIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function Spinner() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
}