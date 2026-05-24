"use client";

import Link from "next/link";
import AdminTopbar from "@/components/admin/AdminTopbar";

// ─── Mock data ────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Total users",       value: "1,284",  change: "+48 this week",  up: true,  icon: "👥" },
  { label: "Active subs",       value: "847",    change: "+12 this week",  up: true,  icon: "💳" },
  { label: "Revenue (MTD)",     value: "₦8.4M",  change: "+23% vs last mo",up: true,  icon: "💰" },
  { label: "Posts published",   value: "12,481", change: "+1,204 today",   up: true,  icon: "📤" },
  { label: "AI captions gen.",  value: "34,920", change: "↑ 18% this mo",  up: true,  icon: "✨" },
  { label: "Failed posts",      value: "23",     change: "-8 vs yesterday", up: true,  icon: "⚠️" },
];

const PLAN_BREAKDOWN = [
  { name: "Starter", users: 542, pct: 42, color: "#4e5768",  revenue: "₦1.6M" },
  { name: "Pro",     users: 581, pct: 45, color: "#00C98D",  revenue: "₦5.8M" },
  { name: "Elite",   users: 161, pct: 13, color: "#e24b4a",  revenue: "₦4.0M" },
];

const RECENT_USERS = [
  { id: 1, name: "Amara Okafor",   email: "amara@brand.ng",   plan: "Pro",     joined: "May 23, 2026", status: "active" },
  { id: 2, name: "Tunde Bello",    email: "tunde@shops.ng",   plan: "Elite",   joined: "May 22, 2026", status: "active" },
  { id: 3, name: "Chioma Eze",     email: "chioma@style.ng",  plan: "Starter", joined: "May 22, 2026", status: "active" },
  { id: 4, name: "Femi Adeyemi",   email: "femi@market.ng",   plan: "Pro",     joined: "May 21, 2026", status: "suspended" },
  { id: 5, name: "Ngozi Okonkwo",  email: "ngozi@ng.co",      plan: "Pro",     joined: "May 20, 2026", status: "active" },
];

const RECENT_TICKETS = [
  { id: "TKT-0048", user: "Amara Okafor",  subject: "Instagram not connecting",        status: "open",        time: "2h ago" },
  { id: "TKT-0047", user: "Tunde Bello",   subject: "Billing charge question",          status: "in_progress", time: "5h ago" },
  { id: "TKT-0046", user: "Ngozi Okonkwo", subject: "AI captions not generating",       status: "open",        time: "8h ago" },
  { id: "TKT-0045", user: "Chioma Eze",    subject: "Upgrade to Pro plan",              status: "resolved",    time: "1d ago" },
];

const PLATFORM_USAGE = [
  { name: "Instagram", posts: 7204, pct: 58, color: "#E1306C" },
  { name: "TikTok",    posts: 3481, pct: 28, color: "#69C9D0" },
  { name: "Facebook",  posts: 1796, pct: 14, color: "#1877F2" },
];

const CHART_DATA = [14, 22, 18, 31, 28, 42, 38, 51, 44, 58, 62, 55, 70, 68];

const STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  active:      { bg: "rgba(0,201,141,0.12)",  color: "#00C98D", label: "Active" },
  suspended:   { bg: "rgba(226,75,74,0.12)",  color: "#e24b4a", label: "Suspended" },
  open:        { bg: "rgba(55,138,221,0.12)", color: "#378ADD", label: "Open" },
  in_progress: { bg: "rgba(239,159,39,0.12)", color: "#ef9f27", label: "In progress" },
  resolved:    { bg: "rgba(0,201,141,0.12)",  color: "#00C98D", label: "Resolved" },
};

const PLAN_COLORS: Record<string, string> = {
  Starter: "#4e5768",
  Pro:     "#00C98D",
  Elite:   "#e24b4a",
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  return (
    <>
      <AdminTopbar
        title="Admin Dashboard"
        subtitle="Platform overview — May 23, 2026"
      />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Stats grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{ gap: 12 }}>
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "16px",
                display: "flex", flexDirection: "column", gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span style={{
                  fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 999,
                  background: s.up ? "rgba(0,201,141,0.1)" : "rgba(226,75,74,0.1)",
                  color: s.up ? "#00C98D" : "#e24b4a",
                }}>
                  {s.up ? "↑" : "↓"}
                </span>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 22, fontWeight: 700, color: "#f0f4ff", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 5, lineHeight: 1.4 }}>{s.change}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Revenue chart + plan breakdown ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 20 }}>

          {/* Revenue sparkline (2/3) */}
          <div
            style={{
              gridColumn: "span 2",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Revenue trend</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Monthly revenue — last 14 months</p>
              </div>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 22, fontWeight: 700, color: "#00C98D" }}>₦8.4M</p>
            </div>
            <div style={{ padding: "24px 20px 16px" }}>
              {/* Bar chart */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
                {CHART_DATA.map((val, i) => {
                  const max = Math.max(...CHART_DATA);
                  const isLast = i === CHART_DATA.length - 1;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                      <div
                        style={{
                          width: "100%",
                          height: `${(val / max) * 100}%`,
                          background: isLast ? "#e24b4a" : "rgba(255,255,255,0.1)",
                          borderRadius: "3px 3px 0 0",
                          transition: "height 0.3s",
                          minHeight: 4,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Plan breakdown (1/3) */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Plan breakdown</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>1,284 total users</p>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
              {PLAN_BREAKDOWN.map((p) => (
                <div key={p.name}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#f0f4ff" }}>{p.name}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#f0f4ff" }}>{p.users}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>users</span>
                    </div>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p.pct}%`, background: p.color, borderRadius: 3, opacity: 0.8 }} />
                  </div>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{p.revenue} MRR</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent users + tickets ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20 }}>

          {/* Recent users */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Recent signups</p>
              <Link href="/admin/users" style={{ fontSize: 12, color: "#00C98D", textDecoration: "none" }}>View all →</Link>
            </div>
            <div>
              {RECENT_USERS.map((user, i) => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 20px",
                    borderBottom: i < RECENT_USERS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
                >
                  {/* Avatar */}
                  <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#f0f4ff" }}>
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#f0f4ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{user.email}</p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: `${PLAN_COLORS[user.plan]}22`, color: PLAN_COLORS[user.plan], flexShrink: 0 }}>
                    {user.plan}
                  </span>
                  <StatusPill status={user.status} />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent tickets */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Recent tickets</p>
              <Link href="/admin/tickets" style={{ fontSize: 12, color: "#00C98D", textDecoration: "none" }}>View all →</Link>
            </div>
            <div>
              {RECENT_TICKETS.map((ticket, i) => (
                <Link
                  key={ticket.id}
                  href="/admin/tickets"
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 20px",
                    borderBottom: i < RECENT_TICKETS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{ticket.id}</span>
                      <StatusPill status={ticket.status} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#f0f4ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ticket.subject}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{ticket.user} · {ticket.time}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Platform usage ────────────────────────────────────────────────── */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Platform usage</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Total posts published across all platforms</p>
          </div>
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            {PLATFORM_USAGE.map((p) => (
              <div key={p.name}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                    <span style={{ fontSize: 13, color: "#f0f4ff", fontWeight: 500 }}>{p.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{p.posts.toLocaleString()} posts</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: p.color, width: 36, textAlign: "right" }}>{p.pct}%</span>
                  </div>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p.pct}%`, background: p.color, borderRadius: 3, opacity: 0.85 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick actions ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
          {[
            { emoji: "👥", label: "Manage users",     href: "/admin/users" },
            { emoji: "🎫", label: "Open tickets",      href: "/admin/tickets" },
            { emoji: "💳", label: "Subscriptions",     href: "/admin/subscriptions" },
            { emoji: "⚙️", label: "Platform settings", href: "/admin/settings" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "16px 18px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, textDecoration: "none",
                transition: "border-color 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.14)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "none";
              }}
            >
              <span style={{ fontSize: 22 }}>{a.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#f0f4ff" }}>{a.label}</span>
            </Link>
          ))}
        </div>

      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS PILL
// ─────────────────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.resolved;
  return (
    <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: s.bg, color: s.color, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {s.label}
    </span>
  );
}