"use client";

import { useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type Range = "7d" | "30d" | "90d" | "12m";

// ─── Mock data ────────────────────────────────────────────────────────────────
const GROWTH_DATA = [
  { label: "Dec",  users: 820,  revenue: 4200000, posts: 6240  },
  { label: "Jan",  users: 940,  revenue: 5100000, posts: 7810  },
  { label: "Feb",  users: 1020, revenue: 5800000, posts: 8940  },
  { label: "Mar",  users: 1080, revenue: 6400000, posts: 9620  },
  { label: "Apr",  users: 1180, revenue: 7200000, posts: 10980 },
  { label: "May",  users: 1284, revenue: 8400000, posts: 12481 },
];

const WEEKLY_SIGNUPS = [8, 14, 11, 19, 16, 22, 18, 28, 24, 31, 27, 35, 42, 48];

const TOP_USERS = [
  { name: "Sade Ojo",       plan: "Elite", posts: 112, reach: "28.4K", engagement: "11.2%" },
  { name: "Chidi Okeke",    plan: "Elite", posts: 76,  reach: "19.1K", engagement: "9.8%"  },
  { name: "Kelechi Nwosu",  plan: "Elite", posts: 88,  reach: "22.3K", engagement: "10.4%" },
  { name: "Tunde Bello",    plan: "Elite", posts: 61,  reach: "15.4K", engagement: "8.9%"  },
  { name: "Ngozi Okonkwo",  plan: "Pro",   posts: 44,  reach: "11.2K", engagement: "8.1%"  },
];

const PLATFORM_DATA = [
  { name: "Instagram", posts: 7204, reach: "16.2K", engagement: "9.4%", color: "#E1306C", pct: 58 },
  { name: "TikTok",    posts: 3481, reach: "9.8K",  engagement: "7.1%", color: "#69C9D0", pct: 28 },
  { name: "Facebook",  posts: 1796, reach: "2.4K",  engagement: "4.3%", color: "#1877F2", pct: 14 },
];

const AI_USAGE = [
  { label: "Dec", captions: 3200 },
  { label: "Jan", captions: 4100 },
  { label: "Feb", captions: 5600 },
  { label: "Mar", captions: 7200 },
  { label: "Apr", captions: 9400 },
  { label: "May", captions: 12480 },
];

const PLAN_DIST = [
  { name: "Starter", users: 542, pct: 42, color: "#4e5768", mrr: "₦1.6M" },
  { name: "Pro",     users: 581, pct: 45, color: "#00C98D", mrr: "₦5.8M" },
  { name: "Elite",   users: 161, pct: 13, color: "#e24b4a", mrr: "₦4.0M" },
];

const PLAN_COLORS: Record<string, string> = {
  Starter: "#4e5768",
  Pro:     "#00C98D",
  Elite:   "#e24b4a",
};

const FAIL_REASONS = [
  { reason: "Account disconnected", count: 14, pct: 48 },
  { reason: "Rate limit exceeded",  count: 8,  pct: 28 },
  { reason: "Access token expired", count: 5,  pct: 17 },
  { reason: "Other / Unknown",      count: 2,  pct: 7  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<Range>("30d");

  const maxGrowth  = Math.max(...GROWTH_DATA.map((d) => d.users));
  const maxRevenue = Math.max(...GROWTH_DATA.map((d) => d.revenue));
  const maxPosts   = Math.max(...GROWTH_DATA.map((d) => d.posts));
  const maxWeekly  = Math.max(...WEEKLY_SIGNUPS);
  const maxAI      = Math.max(...AI_USAGE.map((d) => d.captions));

  return (
    <>
      <AdminTopbar
        title="Platform Analytics"
        subtitle="Postora-wide performance — all users, all plans"
      />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Range picker ─────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Showing data for <span style={{ color: "#f0f4ff", fontWeight: 500 }}>May 2026</span>
          </p>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 3, gap: 2 }}>
            {(["7d","30d","90d","12m"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                  background: range === r ? "rgba(255,255,255,0.1)" : "transparent",
                  color: range === r ? "#f0f4ff" : "rgba(255,255,255,0.35)",
                  transition: "all 0.15s",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI strip ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
          {[
            { label: "Total users",       value: "1,284", change: "+48",   up: true,  sub: "vs last month" },
            { label: "MRR",               value: "₦8.4M", change: "+23%",  up: true,  sub: "vs last month" },
            { label: "Posts published",   value: "12,481",change: "+1,204", up: true,  sub: "this month"    },
            { label: "AI captions gen.",  value: "34,920",change: "+18%",   up: true,  sub: "this month"    },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: s.up ? "rgba(0,201,141,0.1)" : "rgba(226,75,74,0.1)", color: s.up ? "#00C98D" : "#e24b4a" }}>
                  {s.up ? "↑" : "↓"} {s.change}
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 28, fontWeight: 700, color: "#f0f4ff", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Growth chart (users + revenue) ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20 }}>

          {/* User growth */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>User growth</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Total registered users</p>
              </div>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 22, fontWeight: 700, color: "#00C98D" }}>1,284</p>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                {GROWTH_DATA.map((d, i) => {
                  const isLast = i === GROWTH_DATA.length - 1;
                  return (
                    <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                      <div
                        style={{
                          width: "100%",
                          height: `${(d.users / maxGrowth) * 100}%`,
                          background: isLast ? "#00C98D" : "rgba(0,201,141,0.2)",
                          borderRadius: "4px 4px 0 0",
                          minHeight: 4,
                          transition: "height 0.3s",
                          position: "relative",
                        }}
                      >
                        {isLast && (
                          <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: 600, color: "#00C98D", whiteSpace: "nowrap" }}>
                            {d.users.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Revenue growth */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Revenue growth</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Monthly recurring revenue (₦)</p>
              </div>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 22, fontWeight: 700, color: "#e24b4a" }}>₦8.4M</p>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                {GROWTH_DATA.map((d, i) => {
                  const isLast = i === GROWTH_DATA.length - 1;
                  return (
                    <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                      <div
                        style={{
                          width: "100%",
                          height: `${(d.revenue / maxRevenue) * 100}%`,
                          background: isLast ? "#e24b4a" : "rgba(226,75,74,0.2)",
                          borderRadius: "4px 4px 0 0",
                          minHeight: 4,
                          transition: "height 0.3s",
                          position: "relative",
                        }}
                      >
                        {isLast && (
                          <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: 600, color: "#e24b4a", whiteSpace: "nowrap" }}>
                            ₦{(d.revenue / 1000000).toFixed(1)}M
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Posts + AI usage ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20 }}>

          {/* Posts published */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Posts published</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Across all users and platforms</p>
              </div>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 22, fontWeight: 700, color: "#378ADD" }}>12,481</p>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                {GROWTH_DATA.map((d, i) => {
                  const isLast = i === GROWTH_DATA.length - 1;
                  return (
                    <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                      <div style={{ width: "100%", height: `${(d.posts / maxPosts) * 100}%`, background: isLast ? "#378ADD" : "rgba(55,138,221,0.2)", borderRadius: "4px 4px 0 0", minHeight: 4 }} />
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI captions */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>AI captions generated</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Gemini AI usage across all users</p>
              </div>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 22, fontWeight: 700, color: "#ef9f27" }}>34,920</p>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
                {AI_USAGE.map((d, i) => {
                  const isLast = i === AI_USAGE.length - 1;
                  return (
                    <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                      <div style={{ width: "100%", height: `${(d.captions / maxAI) * 100}%`, background: isLast ? "#ef9f27" : "rgba(239,159,39,0.2)", borderRadius: "4px 4px 0 0", minHeight: 4, position: "relative" }}>
                        {isLast && (
                          <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: 600, color: "#ef9f27", whiteSpace: "nowrap" }}>
                            {d.captions.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Weekly signups sparkline ──────────────────────────────────────── */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Weekly new signups</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>New users per week — last 14 weeks</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 20, fontWeight: 700, color: "#00C98D" }}>+48</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>this week</p>
            </div>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
              {WEEKLY_SIGNUPS.map((val, i) => {
                const isLast = i === WEEKLY_SIGNUPS.length - 1;
                return (
                  <div key={i} style={{ flex: 1, height: `${(val / maxWeekly) * 100}%`, background: isLast ? "#00C98D" : "rgba(255,255,255,0.08)", borderRadius: "3px 3px 0 0", minHeight: 3, transition: "height 0.3s" }} />
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Platform breakdown + plan distribution ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20 }}>

          {/* Platform breakdown */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Platform breakdown</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Posts distribution across platforms</p>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {PLATFORM_DATA.map((p) => (
                <div key={p.name}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                      <span style={{ fontSize: 13, color: "#f0f4ff", fontWeight: 500 }}>{p.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{p.posts.toLocaleString()} posts</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: p.color, width: 30, textAlign: "right" }}>{p.pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p.pct}%`, background: p.color, borderRadius: 3, opacity: 0.85 }} />
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>Reach: {p.reach}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>Engagement: {p.engagement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plan distribution */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Plan distribution</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Users and revenue per plan</p>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {PLAN_DIST.map((p) => (
                <div key={p.name}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                      <span style={{ fontSize: 13, color: "#f0f4ff", fontWeight: 500 }}>{p.name}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#f0f4ff" }}>{p.users} users</p>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{p.mrr} MRR</p>
                    </div>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p.pct}%`, background: p.color, borderRadius: 3, opacity: 0.85 }} />
                  </div>
                </div>
              ))}

              {/* Total MRR */}
              <div style={{ marginTop: 6, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Total MRR</span>
                <span style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 20, fontWeight: 700, color: "#00C98D", letterSpacing: "-0.02em" }}>₦11.4M</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Top users + failed posts ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20 }}>

          {/* Top performing users */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Top performing users</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>By total reach this month</p>
            </div>
            <div>
              {TOP_USERS.map((u, i) => (
                <div
                  key={u.name}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "13px 20px",
                    borderBottom: i < TOP_USERS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                >
                  {/* Rank */}
                  <span style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: i === 0 ? "#ef9f27" : "rgba(255,255,255,0.2)", width: 20, textAlign: "center", flexShrink: 0 }}>
                    {i + 1}
                  </span>

                  {/* Avatar */}
                  <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: `${PLAN_COLORS[u.plan]}22`, border: `1px solid ${PLAN_COLORS[u.plan]}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: PLAN_COLORS[u.plan] }}>
                    {u.name.split(" ").map((n) => n[0]).join("")}
                  </div>

                  {/* Name + plan */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#f0f4ff" }}>{u.name}</p>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 999, background: `${PLAN_COLORS[u.plan]}18`, color: PLAN_COLORS[u.plan] }}>{u.plan}</span>
                  </div>

                  {/* Stats */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>{u.reach}</p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{u.posts} posts · {u.engagement}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Failed posts breakdown */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Failed post reasons</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>29 total failed posts this month</p>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "rgba(226,75,74,0.1)", color: "#e24b4a" }}>
                NEEDS ATTENTION
              </span>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              {FAIL_REASONS.map((f) => (
                <div key={f.reason}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ fontSize: 13, color: "#f0f4ff" }}>{f.reason}</span>
                    <div style={{ display: "flex", gap: 10 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{f.count} posts</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#e24b4a", width: 32, textAlign: "right" }}>{f.pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${f.pct}%`, background: "#e24b4a", borderRadius: 3, opacity: 0.7 }} />
                  </div>
                </div>
              ))}

              {/* Tip */}
              <div style={{ marginTop: 4, padding: "12px 14px", background: "rgba(226,75,74,0.07)", border: "1px solid rgba(226,75,74,0.15)", borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>
                  Most failures are from <span style={{ color: "#e24b4a", fontWeight: 600 }}>disconnected accounts</span>. Consider sending users a re-connect notification.
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}