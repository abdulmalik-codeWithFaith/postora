"use client";

import { useState } from "react";
import Topbar from "@/components/dashboard/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type Range    = "7d" | "30d" | "90d";
type Platform = "all" | "Instagram" | "TikTok" | "Facebook";

// ─── Mock data ────────────────────────────────────────────────────────────────

const OVERVIEW_STATS = [
  { label: "Total posts",       value: "47",    change: "+12%",  up: true,  icon: "📤" },
  { label: "Total reach",       value: "28.4K", change: "+34%",  up: true,  icon: "👁️" },
  { label: "Engagements",       value: "3,821", change: "+18%",  up: true,  icon: "❤️" },
  { label: "Avg. engagement",   value: "8.2%",  change: "+2.1%", up: true,  icon: "📊" },
  { label: "Profile visits",    value: "1,204", change: "-5%",   up: false, icon: "👤" },
  { label: "Link clicks",       value: "318",   change: "+41%",  up: true,  icon: "🔗" },
];

const PLATFORM_STATS: Record<string, { posts: number; reach: string; engagement: string; topPost: string }> = {
  Instagram: { posts: 24, reach: "16.2K", engagement: "9.4%",  topPost: "Step into the season…" },
  TikTok:    { posts: 14, reach: "9.8K",  engagement: "7.1%",  topPost: "POV: your wardrobe called…" },
  Facebook:  { posts: 9,  reach: "2.4K",  engagement: "4.3%",  topPost: "New arrivals in store…" },
};

// Sparkline data points (posts per day, last 30 days)
const CHART_DATA_30D = [
  { day: "May 1",  ig: 280,  tk: 120,  fb: 60  },
  { day: "May 3",  ig: 420,  tk: 200,  fb: 80  },
  { day: "May 5",  ig: 390,  tk: 180,  fb: 95  },
  { day: "May 7",  ig: 510,  tk: 310,  fb: 70  },
  { day: "May 9",  ig: 460,  tk: 280,  fb: 90  },
  { day: "May 11", ig: 620,  tk: 340,  fb: 120 },
  { day: "May 13", ig: 580,  tk: 390,  fb: 110 },
  { day: "May 15", ig: 710,  tk: 420,  fb: 140 },
  { day: "May 17", ig: 650,  tk: 380,  fb: 130 },
  { day: "May 19", ig: 820,  tk: 510,  fb: 160 },
  { day: "May 21", ig: 780,  tk: 480,  fb: 150 },
  { day: "May 23", ig: 940,  tk: 620,  fb: 190 },
];

const TOP_POSTS = [
  { id: 1, emoji: "👟", platform: "Instagram", caption: "Step into the season. Made for those who move with purpose 🔗",     date: "May 23", reach: "4,210", engagement: "11.2%", likes: 312, comments: 28 },
  { id: 2, emoji: "👗", platform: "TikTok",    caption: "Your wardrobe called — it wants an upgrade 🔥",                      date: "May 20", reach: "3,840", engagement: "9.8%",  likes: 287, comments: 41 },
  { id: 3, emoji: "🧴", platform: "Instagram", caption: "New drop alert 🚨 Limited stock — don't sleep on this.",             date: "May 17", reach: "3,120", engagement: "8.9%",  likes: 241, comments: 19 },
  { id: 4, emoji: "👜", platform: "TikTok",    caption: "Carry less, do more. New mini bag collection 👜",                    date: "May 14", reach: "2,980", engagement: "8.4%",  likes: 198, comments: 35 },
  { id: 5, emoji: "💛", platform: "Facebook",  caption: "New arrivals in store this weekend. Come see us!",                   date: "May 10", reach: "1,840", engagement: "6.1%",  likes: 87,  comments: 12 },
];

const BEST_TIMES = [
  { hour: "8am",  score: 30 },
  { hour: "9am",  score: 55 },
  { hour: "10am", score: 85 },
  { hour: "11am", score: 70 },
  { hour: "12pm", score: 60 },
  { hour: "1pm",  score: 45 },
  { hour: "2pm",  score: 40 },
  { hour: "3pm",  score: 50 },
  { hour: "4pm",  score: 65 },
  { hour: "5pm",  score: 78 },
  { hour: "6pm",  score: 95 },
  { hour: "7pm",  score: 80 },
  { hour: "8pm",  score: 60 },
  { hour: "9pm",  score: 42 },
];

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "#E1306C",
  TikTok:    "#69C9D0",
  Facebook:  "#1877F2",
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [range, setRange]       = useState<Range>("30d");
  const [platform, setPlatform] = useState<Platform>("all");

  const maxChart = Math.max(...CHART_DATA_30D.flatMap((d) => [d.ig, d.tk, d.fb]));

  return (
    <>
      <Topbar title="Analytics" subtitle="Track your content performance across all platforms" />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Date range */}
          <div
            style={{
              display: "flex",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 10, padding: 3, gap: 2,
            }}
          >
            {(["7d", "30d", "90d"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: "6px 16px", borderRadius: 8, border: "none",
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                  background: range === r ? "var(--surface-4)" : "transparent",
                  color: range === r ? "var(--text-1)" : "var(--text-3)",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
              </button>
            ))}
          </div>

          {/* Platform filter */}
          <div
            style={{
              display: "flex",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 10, padding: 3, gap: 2,
            }}
          >
            {(["all", "Instagram", "TikTok", "Facebook"] as Platform[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                  background: platform === p
                    ? p === "all" ? "var(--surface-4)" : `${PLATFORM_COLORS[p]}22`
                    : "transparent",
                  color: platform === p
                    ? p === "all" ? "var(--text-1)" : PLATFORM_COLORS[p]
                    : "var(--text-3)",
                  transition: "all 0.15s",
                }}
              >
                {p === "all" ? "All platforms" : p}
              </button>
            ))}
          </div>
        </div>

        {/* ── Overview stats ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{ gap: 12 }}>
          {OVERVIEW_STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 14, padding: "16px",
                display: "flex", flexDirection: "column", gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span
                  style={{
                    fontSize: 10, fontWeight: 600,
                    padding: "2px 7px", borderRadius: 999,
                    background: s.up ? "rgba(0,201,141,0.1)" : "rgba(226,75,74,0.1)",
                    color: s.up ? "var(--green)" : "#e24b4a",
                  }}
                >
                  {s.change}
                </span>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 22, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Reach chart + best times ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 20 }}>

          {/* Reach over time (2/3) */}
          <div
            style={{
              gridColumn: "span 2",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 16, overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Reach over time</p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>Daily reach per platform — last 30 days</p>
              </div>
              {/* Legend */}
              <div style={{ display: "flex", gap: 14 }}>
                {[["Instagram","#E1306C"],["TikTok","#69C9D0"],["Facebook","#1877F2"]].map(([name, color]) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>{name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "24px 20px 16px" }}>
              {/* Chart bars */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160 }}>
                {CHART_DATA_30D.map((d) => (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                    {/* Stacked bars */}
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 1, alignItems: "center" }}>
                      {[
                        { val: d.ig, color: "#E1306C" },
                        { val: d.tk, color: "#69C9D0" },
                        { val: d.fb, color: "#1877F2" },
                      ].map((bar, i) => (
                        <div
                          key={i}
                          style={{
                            width: "70%",
                            height: Math.max(3, (bar.val / maxChart) * 120),
                            background: bar.color,
                            borderRadius: i === 0 ? "3px 3px 0 0" : i === 2 ? "0 0 3px 3px" : "0",
                            opacity: 0.85,
                            transition: "height 0.3s",
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: 9, color: "var(--text-3)", marginTop: 4, whiteSpace: "nowrap" }}>
                      {d.day.replace("May ", "")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Best posting times (1/3) */}
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 16, overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Best times to post</p>
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>Based on your audience activity</p>
            </div>
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {BEST_TIMES.map((t) => (
                <div key={t.hour} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, color: "var(--text-3)", width: 32, flexShrink: 0 }}>{t.hour}</span>
                  <div style={{ flex: 1, height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${t.score}%`,
                        background: t.score >= 80
                          ? "var(--green)"
                          : t.score >= 60
                          ? "rgba(0,201,141,0.5)"
                          : "var(--surface-4)",
                        borderRadius: 3,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                  {t.score >= 80 && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: "var(--green)", letterSpacing: "0.05em" }}>PEAK</span>
                  )}
                </div>
              ))}
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                🕕 Your best time: <span style={{ color: "var(--green)", fontWeight: 600 }}>6:00 PM</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Platform breakdown ────────────────────────────────────────────── */}
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 16, overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Platform breakdown</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 0 }}>
            {Object.entries(PLATFORM_STATS).map(([name, stats], i) => (
              <div
                key={name}
                style={{
                  padding: "20px 24px",
                  borderRight: i < 2 ? "1px solid var(--border)" : "none",
                }}
              >
                {/* Platform header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: PLATFORM_COLORS[name],
                    }}
                  />
                  <span style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{name}</span>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Posts",       value: stats.posts },
                    { label: "Reach",       value: stats.reach },
                    { label: "Engagement",  value: stats.engagement },
                  ].map((s) => (
                    <div key={s.label}>
                      <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 3 }}>{s.label}</p>
                      <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}>
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Engagement bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>Engagement rate</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: PLATFORM_COLORS[name] }}>{stats.engagement}</span>
                  </div>
                  <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: stats.engagement,
                        background: PLATFORM_COLORS[name],
                        borderRadius: 3,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                </div>

                {/* Top post */}
                <div
                  style={{
                    marginTop: 14, padding: "10px 12px",
                    background: "var(--surface-3)",
                    border: "1px solid var(--border)", borderRadius: 10,
                  }}
                >
                  <p style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Top post</p>
                  <p style={{ fontSize: 12, color: "var(--text-1)", lineHeight: 1.5 }}>{stats.topPost}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Top posts ────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 16, overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Top performing posts</p>
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>Sorted by reach</span>
          </div>

          {/* Table header */}
          <div
            style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
              padding: "10px 20px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface-3)",
            }}
          >
            {["Post", "Platform", "Date", "Reach", "Engagement"].map((h) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {TOP_POSTS.map((post, i) => (
            <div
              key={post.id}
              style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                padding: "14px 20px",
                borderBottom: i < TOP_POSTS.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--surface-3)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
            >
              {/* Caption */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                    background: "var(--surface-3)",
                    border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {post.emoji}
                </div>
                <p
                  style={{
                    fontSize: 13, color: "var(--text-1)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}
                >
                  {post.caption}
                </p>
              </div>

              {/* Platform */}
              <span
                style={{
                  fontSize: 11, fontWeight: 600,
                  padding: "3px 10px", borderRadius: 999,
                  background: `${PLATFORM_COLORS[post.platform]}18`,
                  color: PLATFORM_COLORS[post.platform],
                  width: "fit-content",
                }}
              >
                {post.platform}
              </span>

              {/* Date */}
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>{post.date}</span>

              {/* Reach */}
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{post.reach}</span>

              {/* Engagement */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>{post.engagement}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 10, color: "var(--text-3)" }}>♥ {post.likes}</span>
                  <span style={{ fontSize: 10, color: "var(--text-3)" }}>💬 {post.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Engagement donut + content mix ───────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>

          {/* Engagement breakdown */}
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 16, overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Engagement breakdown</p>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Likes",    value: 2481, pct: 65, color: "#E1306C" },
                { label: "Comments", value: 634,  pct: 17, color: "#69C9D0" },
                { label: "Shares",   value: 412,  pct: 11, color: "#1877F2" },
                { label: "Saves",    value: 294,  pct: 7,  color: "var(--green)" },
              ].map((e) => (
                <div key={e.label}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.color }} />
                      <span style={{ fontSize: 13, color: "var(--text-1)" }}>{e.label}</span>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "var(--text-3)" }}>{e.value.toLocaleString()}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: e.color, width: 32, textAlign: "right" }}>{e.pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${e.pct}%`, background: e.color, borderRadius: 3, opacity: 0.85 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content type mix */}
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 16, overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Content mix</p>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Photo posts",  count: 28, pct: 60, engagement: "8.1%" },
                { label: "Video/Reels",  count: 13, pct: 28, engagement: "11.4%" },
                { label: "Carousel",     count: 6,  pct: 12, engagement: "9.2%" },
              ].map((c) => (
                <div
                  key={c.label}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "12px 14px",
                    background: "var(--surface-3)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{c.label}</span>
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>{c.count} posts</span>
                    </div>
                    <div style={{ height: 4, background: "var(--surface-4)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${c.pct}%`, background: "var(--green)", borderRadius: 2, opacity: 0.7 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--green)", letterSpacing: "-0.01em" }}>{c.engagement}</p>
                    <p style={{ fontSize: 10, color: "var(--text-3)" }}>avg. eng.</p>
                  </div>
                </div>
              ))}

              {/* Insight */}
              <div
                style={{
                  padding: "12px 14px",
                  background: "var(--green-muted)",
                  border: "1px solid rgba(0,201,141,0.2)",
                  borderRadius: 12,
                  display: "flex", alignItems: "flex-start", gap: 10,
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>
                  Videos get <strong style={{ color: "var(--green)" }}>41% more engagement</strong> than photos. Try posting more reels this month.
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}