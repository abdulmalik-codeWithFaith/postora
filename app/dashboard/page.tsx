"use client";

import Topbar from "@/components/dashboard/Topbar";
import Link from "next/link";

// ─── Mock data ────────────────────────────────────────────────────────────────
const STATS = [
  {
    label: "Posts published",
    value: "24",
    change: "+8 this month",
    up: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    ),
  },
  {
    label: "Posts scheduled",
    value: "12",
    change: "Next: Today 6pm",
    up: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    label: "Media files",
    value: "47",
    change: "+5 this week",
    up: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
  {
    label: "AI captions generated",
    value: "63",
    change: "30 remaining",
    up: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l1.6 5H19l-4.1 3 1.5 5L12 12l-4.4 3 1.5-5L5 7h5.4z"/>
      </svg>
    ),
  },
];

const RECENT_POSTS = [
  {
    id: 1,
    image: "🥿",
    caption: "Step into the season. Made for those who move with purpose. Shop link in bio 🔗",
    platform: "Instagram",
    status: "published",
    time: "Today, 10:00 am",
  },
  {
    id: 2,
    image: "👗",
    caption: "New arrivals just dropped. Your wardrobe called — it wants an upgrade.",
    platform: "TikTok",
    status: "scheduled",
    time: "Today, 6:00 pm",
  },
  {
    id: 3,
    image: "👜",
    caption: "Carry less, do more. Our new mini bag collection is here.",
    platform: "Facebook",
    status: "scheduled",
    time: "Tomorrow, 9:00 am",
  },
  {
    id: 4,
    image: "🧴",
    caption: "Your skin deserves better. Introducing our new care line.",
    platform: "Instagram",
    status: "draft",
    time: "Not scheduled",
  },
];

const PLATFORMS = [
  { name: "Instagram", handle: "@mybrand", connected: true, color: "#E1306C", posts: 16 },
  { name: "TikTok",    handle: "@mybrand", connected: true, color: "#69C9D0", posts: 8 },
  { name: "Facebook",  handle: "My Brand Page", connected: false, color: "#1877F2", posts: 0 },
];

const UPCOMING = [
  { day: "Mon", date: "23", posts: 2 },
  { day: "Tue", date: "24", posts: 1 },
  { day: "Wed", date: "25", posts: 0 },
  { day: "Thu", date: "26", posts: 3 },
  { day: "Fri", date: "27", posts: 1 },
  { day: "Sat", date: "28", posts: 2 },
  { day: "Sun", date: "29", posts: 0 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Good morning, Jane 👋"
      />

      <main style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 16 }}>
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>{s.label}</p>
                <div
                  style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: "var(--green-muted)",
                    border: "1px solid rgba(0,201,141,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--green)",
                  }}
                >
                  {s.icon}
                </div>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-sora), sans-serif",
                    fontSize: 30, fontWeight: 700,
                    color: "var(--text-1)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </p>
                <p style={{ fontSize: 11, color: s.up ? "var(--green)" : "var(--text-3)", marginTop: 5 }}>
                  {s.change}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Middle row: Recent posts + mini calendar ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 20 }}>

          {/* Recent posts — takes 2/3 */}
          <div
            style={{
              gridColumn: "span 2",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-sora), sans-serif",
                  fontSize: 14, fontWeight: 700,
                  color: "var(--text-1)",
                }}
              >
                Recent posts
              </h2>
              <Link
                href="/dashboard/schedule"
                style={{ fontSize: 12, color: "var(--green)", textDecoration: "none" }}
              >
                View all →
              </Link>
            </div>

            {/* Post list */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {RECENT_POSTS.map((post, i) => (
                <div
                  key={post.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 20px",
                    borderBottom: i < RECENT_POSTS.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--surface-3)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
                >
                  {/* Thumbnail placeholder */}
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                      background: "var(--surface-3)",
                      border: "1px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    {post.image}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 13, color: "var(--text-1)", fontWeight: 500,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        marginBottom: 4,
                      }}
                    >
                      {post.caption}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <PlatformPill name={post.platform} />
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>{post.time}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <StatusBadge status={post.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Mini week view */}
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-sora), sans-serif",
                  fontSize: 14, fontWeight: 700,
                  color: "var(--text-1)",
                }}
              >
                This week
              </h2>
              <Link
                href="/dashboard/calendar"
                style={{ fontSize: 12, color: "var(--green)", textDecoration: "none" }}
              >
                Calendar →
              </Link>
            </div>

            <div style={{ padding: "20px" }}>
              {/* Day columns */}
              <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
                {UPCOMING.map((d) => {
                  const isToday = d.date === "23";
                  return (
                    <div
                      key={d.date}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                        flex: 1,
                      }}
                    >
                      <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 500 }}>{d.day}</span>
                      <div
                        style={{
                          width: "100%", aspectRatio: "1",
                          maxWidth: 36,
                          borderRadius: 10,
                          background: isToday ? "var(--green)" : "var(--surface-3)",
                          border: `1px solid ${isToday ? "transparent" : "var(--border)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700,
                          color: isToday ? "#0a0e14" : "var(--text-1)",
                        }}
                      >
                        {d.date}
                      </div>
                      {/* Post dots */}
                      <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", minHeight: 8 }}>
                        {Array.from({ length: d.posts }).map((_, i) => (
                          <div
                            key={i}
                            style={{
                              width: 5, height: 5, borderRadius: "50%",
                              background: "var(--green)",
                              opacity: 0.7,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Upcoming list */}
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Upcoming
                </p>
                {RECENT_POSTS.filter((p) => p.status === "scheduled").map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "var(--green)", flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 12, color: "var(--text-1)", fontWeight: 500,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}
                      >
                        {p.caption.slice(0, 38)}…
                      </p>
                      <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 1 }}>{p.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom row: Connected platforms + Quick actions ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 20 }}>

          {/* Connected platforms */}
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
                Connected accounts
              </h2>
              <Link href="/dashboard/accounts" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none" }}>
                Manage →
              </Link>
            </div>
            <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
              {PLATFORMS.map((p) => (
                <div
                  key={p.name}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      background: `${p.color}18`,
                      border: `1px solid ${p.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                    }}
                  >
                    {p.name === "Instagram" ? "📸" : p.name === "TikTok" ? "🎵" : "📘"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-3)" }}>{p.connected ? p.handle : "Not connected"}</p>
                  </div>
                  {p.connected ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }}/>
                      <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 500 }}>{p.posts} posts</span>
                    </div>
                  ) : (
                    <Link
                      href="/dashboard/accounts"
                      style={{
                        fontSize: 11, fontWeight: 600,
                        padding: "4px 10px", borderRadius: 6,
                        background: "var(--surface-3)",
                        border: "1px solid var(--border-hover)",
                        color: "var(--text-2)", textDecoration: "none",
                      }}
                    >
                      Connect
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div
            style={{
              gridColumn: "span 2",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>
                Quick actions
              </h2>
            </div>
            <div className="grid grid-cols-2" style={{ padding: 20, gap: 12 }}>
              {[
                {
                  href: "/dashboard/media",
                  emoji: "📤",
                  label: "Upload media",
                  desc: "Add photos or videos to your library",
                },
                {
                  href: "/dashboard/captions",
                  emoji: "✨",
                  label: "Generate captions",
                  desc: "Let AI write posts for your products",
                },
                {
                  href: "/dashboard/schedule",
                  emoji: "🗓️",
                  label: "Schedule a post",
                  desc: "Pick time and platform to publish",
                },
                {
                  href: "/dashboard/calendar",
                  emoji: "📅",
                  label: "View calendar",
                  desc: "See your full content plan",
                },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "16px",
                    background: "var(--surface-3)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    textDecoration: "none",
                    transition: "border-color 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-hover)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{a.emoji}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 3 }}>{a.label}</p>
                    <p style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>{a.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

      </main>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    published: { bg: "rgba(0,201,141,0.1)",   color: "var(--green)",  label: "Published" },
    scheduled: { bg: "rgba(55,138,221,0.1)",  color: "#378ADD",       label: "Scheduled" },
    draft:     { bg: "rgba(255,255,255,0.06)", color: "var(--text-3)", label: "Draft" },
  };
  const s = map[status] ?? map.draft;
  return (
    <span
      style={{
        fontSize: 10, fontWeight: 600,
        padding: "3px 9px", borderRadius: 999,
        background: s.bg, color: s.color,
        whiteSpace: "nowrap", flexShrink: 0,
        textTransform: "uppercase", letterSpacing: "0.05em",
      }}
    >
      {s.label}
    </span>
  );
}

function PlatformPill({ name }: { name: string }) {
  const colors: Record<string, string> = {
    Instagram: "#E1306C",
    TikTok:    "#69C9D0",
    Facebook:  "#1877F2",
  };
  return (
    <span
      style={{
        fontSize: 10, fontWeight: 600,
        padding: "2px 8px", borderRadius: 999,
        background: `${colors[name] ?? "#888"}18`,
        color: colors[name] ?? "var(--text-2)",
        flexShrink: 0,
      }}
    >
      {name}
    </span>
  );
}