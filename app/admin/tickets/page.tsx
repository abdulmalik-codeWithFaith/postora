"use client";

import { useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type TicketStatus   = "open" | "in_progress" | "resolved" | "closed";
type TicketCategory = "technical" | "billing" | "account" | "feature" | "other";
type Priority       = "low" | "medium" | "high" | "urgent";

interface Message {
  id: number;
  author: string;
  role: "user" | "admin";
  avatar: string;
  text: string;
  time: string;
}

interface Ticket {
  id: string;
  user: string;
  email: string;
  plan: "Starter" | "Pro" | "Elite";
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  assignedTo: string | null;
  messages: Message[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const TICKETS: Ticket[] = [
  {
    id: "TKT-0048", user: "Amara Okafor",   email: "amara@brand.ng",       plan: "Pro",
    subject: "Instagram not connecting after reconnect",
    category: "technical", status: "open", priority: "high",
    createdAt: "May 23, 2026 · 08:14", updatedAt: "2 hours ago",
    assignedTo: null,
    messages: [
      { id: 1, author: "Amara Okafor",   role: "user",  avatar: "AO", text: "Hi, I tried reconnecting my Instagram account but it keeps failing. The button shows 'Connecting...' and then nothing happens. I've tried 3 times already.", time: "08:14" },
      { id: 2, author: "Blessing Adaeze",role: "admin", avatar: "BA", text: "Hi Amara, thanks for reaching out. Could you let us know what browser and device you're using? Also, please try clearing your browser cache and attempting the reconnect again.", time: "09:02" },
      { id: 3, author: "Amara Okafor",   role: "user",  avatar: "AO", text: "I'm on Chrome on a MacBook. I cleared the cache and it still does the same thing. I have 3 posts scheduled for tomorrow and I'm worried they won't go out.", time: "09:45" },
    ],
  },
  {
    id: "TKT-0047", user: "Tunde Bello",    email: "tunde@shops.ng",       plan: "Elite",
    subject: "Billing charge question — double payment",
    category: "billing", status: "in_progress", priority: "urgent",
    createdAt: "May 22, 2026 · 14:30", updatedAt: "5 hours ago",
    assignedTo: "Tobi Fashola",
    messages: [
      { id: 1, author: "Tunde Bello",    role: "user",  avatar: "TB", text: "I was charged twice for my Elite plan this month — ₦25,000 appeared on my statement two times on May 22nd. Please look into this.", time: "14:30" },
      { id: 2, author: "Tobi Fashola",   role: "admin", avatar: "TF", text: "Hi Tunde, I can see the issue — there was a duplicate payment triggered during a brief payment gateway issue. I've raised a refund for ₦25,000 which should reflect in 3–5 business days. I'm very sorry for the inconvenience.", time: "15:12" },
    ],
  },
  {
    id: "TKT-0046", user: "Ngozi Okonkwo",  email: "ngozi@ng.co",          plan: "Pro",
    subject: "AI captions not generating — loading forever",
    category: "technical", status: "open", priority: "medium",
    createdAt: "May 23, 2026 · 06:50", updatedAt: "8 hours ago",
    assignedTo: null,
    messages: [
      { id: 1, author: "Ngozi Okonkwo",  role: "user",  avatar: "NO", text: "The AI caption generator has been stuck on 'Gemini is writing...' for over 10 minutes. I've refreshed the page multiple times. Is there an outage?", time: "06:50" },
    ],
  },
  {
    id: "TKT-0045", user: "Chioma Eze",     email: "chioma@style.ng",      plan: "Starter",
    subject: "How to upgrade to Pro plan",
    category: "billing", status: "resolved", priority: "low",
    createdAt: "May 18, 2026 · 11:20", updatedAt: "May 20, 2026",
    assignedTo: "Blessing Adaeze",
    messages: [
      { id: 1, author: "Chioma Eze",     role: "user",  avatar: "CE", text: "I'd like to upgrade from Starter to Pro. How do I do that and will I lose my existing posts?", time: "11:20" },
      { id: 2, author: "Blessing Adaeze",role: "admin", avatar: "BA", text: "Hi Chioma! To upgrade, go to Settings → Billing & Plan and click 'Start Pro'. Your existing posts and media will be completely safe — nothing gets deleted. The upgrade takes effect immediately.", time: "12:05" },
      { id: 3, author: "Chioma Eze",     role: "user",  avatar: "CE", text: "Thank you! That worked perfectly.", time: "13:30" },
      { id: 4, author: "Blessing Adaeze",role: "admin", avatar: "BA", text: "Glad to hear it! Marking this as resolved. Don't hesitate to reach out if you need anything else 😊", time: "13:45" },
    ],
  },
  {
    id: "TKT-0044", user: "Sade Ojo",       email: "sade@luxe.ng",         plan: "Elite",
    subject: "Feature request: Pinterest integration",
    category: "feature", status: "closed", priority: "low",
    createdAt: "May 15, 2026 · 09:00", updatedAt: "May 16, 2026",
    assignedTo: "Tobi Fashola",
    messages: [
      { id: 1, author: "Sade Ojo",       role: "user",  avatar: "SO", text: "Would love to see Pinterest added as a platform. A lot of my audience is there and it would complete my content strategy.", time: "09:00" },
      { id: 2, author: "Tobi Fashola",   role: "admin", avatar: "TF", text: "Thanks for the suggestion, Sade! Pinterest is actually on our roadmap for Q3 2026. I've added your vote to the feature request tracker. We'll notify you when it launches!", time: "10:30" },
    ],
  },
  {
    id: "TKT-0043", user: "Femi Adeyemi",   email: "femi@market.ng",       plan: "Pro",
    subject: "Account suspended without notice",
    category: "account", status: "in_progress", priority: "urgent",
    createdAt: "May 21, 2026 · 16:00", updatedAt: "1 day ago",
    assignedTo: "Tobi Fashola",
    messages: [
      { id: 1, author: "Femi Adeyemi",   role: "user",  avatar: "FA", text: "My account was suddenly suspended. I didn't violate any terms. I have active posts scheduled and this is affecting my business. Please restore access immediately.", time: "16:00" },
      { id: 2, author: "Tobi Fashola",   role: "admin", avatar: "TF", text: "Hi Femi, I can see your account was flagged by our automated system for an unusual activity pattern. I'm reviewing this manually now and will update you within 2 hours.", time: "16:45" },
    ],
  },
];

const STATUS_MAP: Record<TicketStatus, { bg: string; color: string; label: string; dot: string }> = {
  open:        { bg: "rgba(55,138,221,0.12)",  color: "#378ADD", label: "Open",        dot: "#378ADD" },
  in_progress: { bg: "rgba(239,159,39,0.12)",  color: "#ef9f27", label: "In progress", dot: "#ef9f27" },
  resolved:    { bg: "rgba(0,201,141,0.12)",   color: "#00C98D", label: "Resolved",    dot: "#00C98D" },
  closed:      { bg: "rgba(255,255,255,0.06)", color: "#4e5768", label: "Closed",      dot: "#4e5768" },
};

const PRIORITY_MAP: Record<Priority, { bg: string; color: string; label: string }> = {
  low:    { bg: "rgba(255,255,255,0.05)", color: "#4e5768", label: "Low"    },
  medium: { bg: "rgba(55,138,221,0.1)",  color: "#378ADD", label: "Medium" },
  high:   { bg: "rgba(239,159,39,0.1)",  color: "#ef9f27", label: "High"   },
  urgent: { bg: "rgba(226,75,74,0.1)",   color: "#e24b4a", label: "Urgent" },
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  technical: "Technical",
  billing:   "Billing",
  account:   "Account",
  feature:   "Feature",
  other:     "Other",
};

const PLAN_COLORS: Record<string, string> = {
  Starter: "#4e5768",
  Pro:     "#00C98D",
  Elite:   "#e24b4a",
};

const ADMINS = ["Tobi Fashola", "Blessing Adaeze"];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminTicketsPage() {
  const [tickets, setTickets]         = useState<Ticket[]>(TICKETS);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatus]     = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriority] = useState<Priority | "all">("all");
  const [activeTicket, setActive]     = useState<Ticket | null>(null);
  const [reply, setReply]             = useState("");
  const [sending, setSending]         = useState(false);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = tickets.filter((t) => {
    const matchSearch   = search === "" || t.subject.toLowerCase().includes(search.toLowerCase()) || t.user.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = statusFilter   === "all" || t.status   === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = {
    open:        tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved:    tickets.filter((t) => t.status === "resolved").length,
    urgent:      tickets.filter((t) => t.priority === "urgent").length,
  };

  // ── Send reply ────────────────────────────────────────────────────────────
  function sendReply() {
    if (!reply.trim() || !activeTicket) return;
    setSending(true);
    setTimeout(() => {
      const newMsg: Message = {
        id: Date.now(),
        author: "Super Admin",
        role: "admin",
        avatar: "SA",
        text: reply.trim(),
        time: new Date().toTimeString().slice(0, 5),
      };
      const updated = tickets.map((t) =>
        t.id === activeTicket.id
          ? { ...t, messages: [...t.messages, newMsg], updatedAt: "Just now", status: t.status === "open" ? "in_progress" as TicketStatus : t.status }
          : t
      );
      setTickets(updated);
      setActive(updated.find((t) => t.id === activeTicket.id) ?? null);
      setReply("");
      setSending(false);
    }, 800);
  }

  // ── Update status ────────────────────────────────────────────────────────
  function updateStatus(id: string, status: TicketStatus) {
    const updated = tickets.map((t) => t.id === id ? { ...t, status, updatedAt: "Just now" } : t);
    setTickets(updated);
    if (activeTicket?.id === id) setActive(updated.find((t) => t.id === id) ?? null);
  }

  // ── Assign admin ─────────────────────────────────────────────────────────
  function assignAdmin(id: string, admin: string | null) {
    const updated = tickets.map((t) => t.id === id ? { ...t, assignedTo: admin } : t);
    setTickets(updated);
    if (activeTicket?.id === id) setActive(updated.find((t) => t.id === id) ?? null);
  }

  return (
    <>
      <AdminTopbar
        title="Support Tickets"
        subtitle={`${stats.open} open · ${stats.in_progress} in progress · ${stats.urgent} urgent`}
      />

      <main style={{ padding: 28, display: "flex", gap: 20, alignItems: "flex-start", height: "calc(100vh - 64px)", overflow: "hidden" }}>

        {/* ── LEFT: Ticket list ────────────────────────────────────────────── */}
        <div style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14, height: "100%", overflow: "hidden" }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flexShrink: 0 }}>
            {[
              { label: "Open",        value: stats.open,        color: "#378ADD" },
              { label: "In progress", value: stats.in_progress, color: "#ef9f27" },
              { label: "Resolved",    value: stats.resolved,    color: "#00C98D" },
              { label: "Urgent",      value: stats.urgent,      color: "#e24b4a" },
            ].map((s) => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 14px" }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>{s.label}</p>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search tickets…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "9px 14px 9px 36px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, fontSize: 13, color: "#f0f4ff", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.target.style.borderColor = "#e24b4a")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
            />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
            {(["all","open","in_progress","resolved","closed"] as const).map((s) => {
              const active = statusFilter === s;
              const cfg    = s !== "all" ? STATUS_MAP[s] : null;
              return (
                <button key={s} onClick={() => setStatus(s)} style={{ padding: "4px 12px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500, background: active ? (cfg ? `${cfg.color}22` : "rgba(255,255,255,0.08)") : "transparent", color: active ? (cfg?.color ?? "#f0f4ff") : "rgba(255,255,255,0.35)", transition: "all 0.15s", textTransform: "capitalize" }}>
                  {s === "all" ? "All" : s.replace("_", " ")}
                </button>
              );
            })}
          </div>

          {/* Ticket list */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.2)" }}>
                <p style={{ fontSize: 24, marginBottom: 8 }}>🎫</p>
                <p style={{ fontSize: 13 }}>No tickets found</p>
              </div>
            ) : (
              filtered.map((ticket) => {
                const s = STATUS_MAP[ticket.status];
                const p = PRIORITY_MAP[ticket.priority];
                const isActive = activeTicket?.id === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setActive(ticket)}
                    style={{
                      background: isActive ? "rgba(226,75,74,0.07)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isActive ? "rgba(226,75,74,0.3)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 14, padding: "14px 16px",
                      cursor: "pointer", transition: "all 0.15s",
                      display: "flex", flexDirection: "column", gap: 8,
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{ticket.id}</span>
                      <div style={{ display: "flex", gap: 5 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: p.bg, color: p.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{p.label}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: s.bg, color: s.color, display: "flex", alignItems: "center", gap: 3 }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: s.dot }} />
                          {s.label}
                        </span>
                      </div>
                    </div>

                    {/* Subject */}
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#f0f4ff", lineHeight: 1.4 }}>{ticket.subject}</p>

                    {/* Meta */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${PLAN_COLORS[ticket.plan]}22`, border: `1px solid ${PLAN_COLORS[ticket.plan]}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: PLAN_COLORS[ticket.plan] }}>
                          {ticket.user.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{ticket.user}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{ticket.messages.length} msg{ticket.messages.length !== 1 ? "s" : ""}</span>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>· {ticket.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Ticket detail ──────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18 }}>
          {!activeTicket ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "rgba(255,255,255,0.2)" }}>
              <p style={{ fontSize: 36 }}>💬</p>
              <p style={{ fontSize: 14 }}>Select a ticket to view</p>
            </div>
          ) : (
            <>
              {/* Ticket header */}
              <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", fontWeight: 600 }}>{activeTicket.id}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: PRIORITY_MAP[activeTicket.priority].bg, color: PRIORITY_MAP[activeTicket.priority].color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {PRIORITY_MAP[activeTicket.priority].label}
                      </span>
                    </div>
                    <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 15, fontWeight: 700, color: "#f0f4ff", lineHeight: 1.3 }}>{activeTicket.subject}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                      {activeTicket.user} · {activeTicket.email} ·
                      <span style={{ fontSize: 9, fontWeight: 700, marginLeft: 6, padding: "1px 6px", borderRadius: 999, background: `${PLAN_COLORS[activeTicket.plan]}18`, color: PLAN_COLORS[activeTicket.plan] }}>{activeTicket.plan}</span>
                    </p>
                  </div>

                  {/* Controls */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
                    {/* Status */}
                    <select
                      value={activeTicket.status}
                      onChange={(e) => updateStatus(activeTicket.id, e.target.value as TicketStatus)}
                      style={{ padding: "6px 12px", background: `${STATUS_MAP[activeTicket.status].color}18`, border: `1px solid ${STATUS_MAP[activeTicket.status].color}44`, borderRadius: 9, fontSize: 12, fontWeight: 600, color: STATUS_MAP[activeTicket.status].color, outline: "none", cursor: "pointer", colorScheme: "dark" }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>

                    {/* Assign */}
                    <select
                      value={activeTicket.assignedTo ?? ""}
                      onChange={(e) => assignAdmin(activeTicket.id, e.target.value || null)}
                      style={{ padding: "6px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, fontSize: 12, color: "rgba(255,255,255,0.6)", outline: "none", cursor: "pointer", colorScheme: "dark" }}
                    >
                      <option value="">Unassigned</option>
                      {ADMINS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
                {activeTicket.messages.map((msg) => {
                  const isAdmin = msg.role === "admin";
                  return (
                    <div key={msg.id} style={{ display: "flex", gap: 12, flexDirection: isAdmin ? "row-reverse" : "row" }}>
                      {/* Avatar */}
                      <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: isAdmin ? "linear-gradient(135deg, rgba(226,75,74,0.5),rgba(226,75,74,0.2))" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: isAdmin ? "#e24b4a" : "#f0f4ff" }}>
                        {msg.avatar}
                      </div>
                      {/* Bubble */}
                      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 4, alignItems: isAdmin ? "flex-end" : "flex-start" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: isAdmin ? "#e24b4a" : "#f0f4ff" }}>{msg.author}</span>
                          {isAdmin && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 999, background: "rgba(226,75,74,0.12)", color: "#e24b4a" }}>Admin</span>}
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{msg.time}</span>
                        </div>
                        <div style={{
                          padding: "11px 15px",
                          background: isAdmin ? "rgba(226,75,74,0.1)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${isAdmin ? "rgba(226,75,74,0.2)" : "rgba(255,255,255,0.08)"}`,
                          borderRadius: isAdmin ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                          fontSize: 13, color: "#f0f4ff", lineHeight: 1.65,
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply box */}
              {activeTicket.status !== "closed" && activeTicket.status !== "resolved" ? (
                <div style={{ padding: "16px 22px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write a reply…"
                      rows={3}
                      onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendReply(); }}
                      style={{ flex: 1, padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 13, color: "#f0f4ff", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.6, transition: "border-color 0.2s" }}
                      onFocus={(e) => (e.target.style.borderColor = "#e24b4a")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button
                        onClick={sendReply}
                        disabled={!reply.trim() || sending}
                        style={{ padding: "11px 20px", background: reply.trim() ? "#e24b4a" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 11, fontSize: 13, fontWeight: 600, color: reply.trim() ? "#fff" : "rgba(255,255,255,0.25)", cursor: reply.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s", whiteSpace: "nowrap" }}
                      >
                        {sending ? <Spinner /> : <SendIcon />}
                        {sending ? "Sending…" : "Send reply"}
                      </button>
                      <button
                        onClick={() => updateStatus(activeTicket.id, "resolved")}
                        style={{ padding: "8px", background: "rgba(0,201,141,0.1)", border: "1px solid rgba(0,201,141,0.2)", borderRadius: 10, fontSize: 11, fontWeight: 500, color: "#00C98D", cursor: "pointer", textAlign: "center" }}
                      >
                        ✓ Mark resolved
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 7 }}>Ctrl+Enter to send</p>
                </div>
              ) : (
                <div style={{ padding: "14px 22px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                    This ticket is {activeTicket.status}
                  </span>
                  <button
                    onClick={() => updateStatus(activeTicket.id, "open")}
                    style={{ padding: "7px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, fontSize: 12, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                  >
                    Reopen ticket
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
function SendIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}
function Spinner() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
}