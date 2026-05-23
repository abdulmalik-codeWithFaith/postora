"use client";

import { useState } from "react";
import Topbar from "@/components/dashboard/Topbar";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type Platform = "Instagram" | "TikTok" | "Facebook";
type Status   = "published" | "scheduled" | "draft";
type View     = "month" | "week";

interface Post {
  id: number;
  date: string;       // "YYYY-MM-DD"
  time: string;       // "HH:MM"
  platform: Platform;
  status: Status;
  caption: string;
  emoji: string;
}

// ─── Mock posts ───────────────────────────────────────────────────────────────
const POSTS: Post[] = [
  { id: 1,  date: "2026-05-01", time: "10:00", platform: "Instagram", status: "published", caption: "Spring collection just dropped. Shop link in bio 🔗", emoji: "👗" },
  { id: 2,  date: "2026-05-03", time: "18:00", platform: "TikTok",    status: "published", caption: "POV: your wardrobe finally got the upgrade it deserved ✨", emoji: "👟" },
  { id: 3,  date: "2026-05-05", time: "09:00", platform: "Facebook",  status: "published", caption: "New arrivals in store this weekend. Come see us!", emoji: "🛍️" },
  { id: 4,  date: "2026-05-08", time: "12:00", platform: "Instagram", status: "published", caption: "Carry less, do more. New mini bag collection 👜", emoji: "👜" },
  { id: 5,  date: "2026-05-10", time: "17:00", platform: "TikTok",    status: "published", caption: "New drop alert 🚨 limited stock — don't sleep on this", emoji: "🧴" },
  { id: 6,  date: "2026-05-14", time: "10:00", platform: "Instagram", status: "published", caption: "Style is a way to say who you are without speaking 🌿", emoji: "💛" },
  { id: 7,  date: "2026-05-17", time: "11:00", platform: "Facebook",  status: "published", caption: "We're proud to introduce our care line. Explore now.", emoji: "🧪" },
  { id: 8,  date: "2026-05-20", time: "09:00", platform: "Instagram", status: "published", caption: "Every great day starts with feeling good in what you wear ☀️", emoji: "⌚" },
  { id: 9,  date: "2026-05-23", time: "10:00", platform: "Instagram", status: "published", caption: "Step into the season. Made for those who move with purpose 🔗", emoji: "👟" },
  { id: 10, date: "2026-05-23", time: "18:00", platform: "TikTok",    status: "scheduled", caption: "Your wardrobe called — it wants an upgrade 🔥", emoji: "👗" },
  { id: 11, date: "2026-05-24", time: "09:00", platform: "Facebook",  status: "scheduled", caption: "New week, new drops. Come see what just landed in store 🛍️", emoji: "👜" },
  { id: 12, date: "2026-05-25", time: "12:00", platform: "Instagram", status: "scheduled", caption: "Dress like the version of yourself you're becoming 💫", emoji: "👡" },
  { id: 13, date: "2026-05-26", time: "10:00", platform: "TikTok",    status: "scheduled", caption: "SHOP THIS before it sells out 🚨 Limited edition!", emoji: "📦" },
  { id: 14, date: "2026-05-26", time: "15:00", platform: "Instagram", status: "scheduled", caption: "Elevate your everyday look. Precision meets contemporary design.", emoji: "📸" },
  { id: 15, date: "2026-05-28", time: "09:00", platform: "Facebook",  status: "draft",     caption: "Free delivery on orders over ₦10,000 this weekend 🎉", emoji: "✨" },
  { id: 16, date: "2026-05-29", time: "11:00", platform: "Instagram", status: "draft",     caption: "Summer edit is coming. Stay tuned 👀", emoji: "🌸" },
  { id: 17, date: "2026-05-30", time: "17:00", platform: "TikTok",    status: "draft",     caption: "POV: you found your new favourite brand 💚", emoji: "🎬" },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<Platform, string> = {
  Instagram: "#E1306C",
  TikTok:    "#69C9D0",
  Facebook:  "#1877F2",
};

const STATUS_COLORS: Record<Status, { bg: string; color: string }> = {
  published: { bg: "rgba(0,201,141,0.12)",  color: "#00C98D" },
  scheduled: { bg: "rgba(55,138,221,0.12)", color: "#378ADD" },
  draft:     { bg: "rgba(255,255,255,0.06)", color: "#4e5768" },
};

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const today        = new Date(2026, 4, 23); // May 23 2026
  const [view, setView]               = useState<View>("month");
  const [current, setCurrent]         = useState(new Date(2026, 4, 1));
  const [filterPlatform, setFilter]   = useState<Platform | "all">("all");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedDay, setSelectedDay]   = useState<string | null>(null);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const year  = current.getFullYear();
  const month = current.getMonth();

  function prevMonth() { setCurrent(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrent(new Date(year, month + 1, 1)); }
  function goToday()   { setCurrent(new Date(today.getFullYear(), today.getMonth(), 1)); }

  function postsForDay(dateStr: string) {
    return POSTS.filter((p) => {
      const matchDate     = p.date === dateStr;
      const matchPlatform = filterPlatform === "all" || p.platform === filterPlatform;
      return matchDate && matchPlatform;
    });
  }

  function toDateStr(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  // ── Build month grid ────────────────────────────────────────────────────────
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const totalCells  = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const cells: { date: number; month: "prev" | "cur" | "next"; dateStr: string }[] = [];
  for (let i = 0; i < totalCells; i++) {
    if (i < firstDay) {
      const d = daysInPrev - firstDay + 1 + i;
      cells.push({ date: d, month: "prev", dateStr: toDateStr(year, month - 1, d) });
    } else if (i < firstDay + daysInMonth) {
      const d = i - firstDay + 1;
      cells.push({ date: d, month: "cur", dateStr: toDateStr(year, month, d) });
    } else {
      const d = i - firstDay - daysInMonth + 1;
      cells.push({ date: d, month: "next", dateStr: toDateStr(year, month + 1, d) });
    }
  }

  // ── Stats for current month ──────────────────────────────────────────────────
  const monthPosts     = POSTS.filter((p) => p.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`));
  const publishedCount = monthPosts.filter((p) => p.status === "published").length;
  const scheduledCount = monthPosts.filter((p) => p.status === "scheduled").length;
  const draftCount     = monthPosts.filter((p) => p.status === "draft").length;

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const dayPosts = selectedDay ? postsForDay(selectedDay) : postsForDay(todayStr);
  const dayLabel = selectedDay ?? todayStr;

  return (
    <>
      <Topbar
        title="Content Calendar"
        subtitle={`${MONTHS[month]} ${year}`}
      />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
          {[
            { label: "Total this month", value: monthPosts.length,   color: "var(--text-1)" },
            { label: "Published",        value: publishedCount,       color: "#00C98D" },
            { label: "Scheduled",        value: scheduledCount,       color: "#378ADD" },
            { label: "Drafts",           value: draftCount,           color: "var(--text-3)" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "14px 18px",
              }}
            >
              <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500, marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4" style={{ gap: 20, alignItems: "start" }}>

          {/* ── Calendar (3/4) ───────────────────────────────────────────── */}
          <div
            style={{
              gridColumn: "span 3",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            {/* Calendar toolbar */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              }}
            >
              {/* Month nav */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <NavBtn onClick={prevMonth}><ChevronLeft /></NavBtn>
                <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-1)", minWidth: 140, textAlign: "center" }}>
                  {MONTHS[month]} {year}
                </span>
                <NavBtn onClick={nextMonth}><ChevronRight /></NavBtn>
              </div>

              <button
                onClick={goToday}
                style={{
                  padding: "6px 14px", borderRadius: 8,
                  background: "var(--surface-3)", border: "1px solid var(--border)",
                  fontSize: 12, fontWeight: 500, color: "var(--text-2)", cursor: "pointer",
                }}
              >
                Today
              </button>

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Platform filter */}
              <div style={{ display: "flex", gap: 6 }}>
                {(["all", "Instagram", "TikTok", "Facebook"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilter(p)}
                    style={{
                      padding: "5px 12px", borderRadius: 8, border: "none",
                      fontSize: 12, fontWeight: 500, cursor: "pointer",
                      background: filterPlatform === p
                        ? p === "all" ? "var(--surface-4)" : `${PLATFORM_COLORS[p as Platform]}22`
                        : "transparent",
                      color: filterPlatform === p
                        ? p === "all" ? "var(--text-1)" : PLATFORM_COLORS[p as Platform]
                        : "var(--text-3)",
                      transition: "all 0.15s",
                    }}
                  >
                    {p === "all" ? "All" : p}
                  </button>
                ))}
              </div>

              {/* New post CTA */}
              <Link
                href="/dashboard/schedule"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 9,
                  background: "var(--green)", border: "none",
                  fontSize: 12, fontWeight: 600, color: "#0a0e14",
                  textDecoration: "none",
                }}
              >
                <PlusIcon /> New post
              </Link>
            </div>

            {/* Day headers */}
            <div
              style={{
                display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {DAYS.map((d) => (
                <div
                  key={d}
                  style={{
                    padding: "10px 0",
                    textAlign: "center",
                    fontSize: 11, fontWeight: 600,
                    color: "var(--text-3)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
              {cells.map((cell, idx) => {
                const posts    = postsForDay(cell.dateStr);
                const isToday  = cell.dateStr === todayStr;
                const isCur    = cell.month === "cur";
                const isSelected = cell.dateStr === selectedDay;
                const isLast   = idx >= cells.length - 7;

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => setSelectedDay(cell.dateStr === selectedDay ? null : cell.dateStr)}
                    style={{
                      minHeight: 100,
                      padding: "8px 6px",
                      borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--border)" : "none",
                      borderBottom: !isLast ? "1px solid var(--border)" : "none",
                      background: isSelected ? "rgba(0,201,141,0.04)" : "transparent",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "var(--surface-3)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }}
                  >
                    {/* Date number */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                      <span
                        style={{
                          width: 26, height: 26,
                          borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: isToday ? 700 : 400,
                          background: isToday ? "var(--green)" : "transparent",
                          color: isToday ? "#0a0e14" : isCur ? "var(--text-1)" : "var(--text-3)",
                        }}
                      >
                        {cell.date}
                      </span>
                    </div>

                    {/* Post dots / pills */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {posts.slice(0, 3).map((post) => (
                        <div
                          key={post.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 4,
                            padding: "2px 6px",
                            borderRadius: 5,
                            background: `${PLATFORM_COLORS[post.platform]}18`,
                            borderLeft: `2px solid ${PLATFORM_COLORS[post.platform]}`,
                            cursor: "pointer",
                            transition: "opacity 0.15s",
                          }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = "0.7")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = "1")}
                        >
                          <span style={{ fontSize: 10 }}>{post.emoji}</span>
                          <span
                            style={{
                              fontSize: 10, fontWeight: 500,
                              color: "var(--text-1)",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                              flex: 1,
                            }}
                          >
                            {post.time}
                          </span>
                        </div>
                      ))}
                      {posts.length > 3 && (
                        <span style={{ fontSize: 9, color: "var(--text-3)", paddingLeft: 6 }}>
                          +{posts.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right panel (1/4) ─────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Day detail */}
            <div
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>
                  {dayLabel === todayStr ? "Today" : formatDateLabel(dayLabel)}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                  {dayPosts.length} post{dayPosts.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div style={{ padding: "12px 0" }}>
                {dayPosts.length === 0 ? (
                  <div style={{ padding: "24px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 22, marginBottom: 6 }}>📭</p>
                    <p style={{ fontSize: 12, color: "var(--text-3)" }}>Nothing scheduled</p>
                    <Link
                      href="/dashboard/schedule"
                      style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", display: "block", marginTop: 8 }}
                    >
                      + Add a post
                    </Link>
                  </div>
                ) : (
                  dayPosts.map((post, i) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 10,
                        padding: "10px 16px",
                        borderBottom: i < dayPosts.length - 1 ? "1px solid var(--border)" : "none",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--surface-3)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
                    >
                      {/* Platform dot */}
                      <div
                        style={{
                          width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                          background: PLATFORM_COLORS[post.platform],
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: PLATFORM_COLORS[post.platform] }}>
                            {post.platform}
                          </span>
                          <span style={{ fontSize: 10, color: "var(--text-3)" }}>{post.time}</span>
                        </div>
                        <p
                          style={{
                            fontSize: 11, color: "var(--text-2)", lineHeight: 1.5,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                          }}
                        >
                          {post.caption}
                        </p>
                        <StatusPill status={post.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Legend */}
            <div
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "14px 16px",
                display: "flex", flexDirection: "column", gap: 10,
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Legend
              </p>
              {Object.entries(STATUS_COLORS).map(([status, c]) => (
                <div key={status} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--text-2)", textTransform: "capitalize" }}>{status}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(PLATFORM_COLORS).map(([platform, color]) => (
                  <div key={platform} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--text-2)" }}>{platform}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Post detail modal ─────────────────────────────────────────────── */}
      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POST DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
function PostModal({ post, onClose }: { post: Post; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border-hover)",
          borderRadius: 20,
          width: "100%", maxWidth: 420,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{post.emoji}</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{post.platform}</p>
              <p style={{ fontSize: 11, color: "var(--text-3)" }}>{post.date} at {post.time}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4, display: "flex", borderRadius: 6 }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "14px 16px",
              fontSize: 14, color: "var(--text-1)", lineHeight: 1.7,
            }}
          >
            {post.caption}
          </div>

          <div className="grid grid-cols-2" style={{ gap: 10 }}>
            {[
              { label: "Platform", value: post.platform },
              { label: "Status",   value: post.status },
              { label: "Date",     value: post.date },
              { label: "Time",     value: post.time },
            ].map((m) => (
              <div key={m.label} style={{ background: "var(--surface-3)", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 3 }}>{m.label}</p>
                <p style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500, textTransform: "capitalize" }}>{m.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Link
              href="/dashboard/schedule"
              style={{
                flex: 1, textAlign: "center",
                padding: "11px",
                background: "var(--green)", borderRadius: 10,
                fontSize: 13, fontWeight: 600, color: "#0a0e14",
                textDecoration: "none",
              }}
            >
              Edit post
            </Link>
            <button
              onClick={onClose}
              style={{
                padding: "11px 18px",
                background: "var(--surface-3)",
                border: "1px solid var(--border-hover)",
                borderRadius: 10,
                fontSize: 13, color: "var(--text-2)", cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS & SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function formatDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}

function StatusPill({ status }: { status: Status }) {
  const s = STATUS_COLORS[status];
  return (
    <span
      style={{
        display: "inline-block", marginTop: 5,
        fontSize: 9, fontWeight: 700,
        padding: "2px 7px", borderRadius: 999,
        background: s.bg, color: s.color,
        textTransform: "uppercase", letterSpacing: "0.05em",
      }}
    >
      {status}
    </span>
  );
}

function NavBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 30, height: 30, borderRadius: 8,
        background: "var(--surface-3)",
        border: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "var(--text-2)",
        transition: "border-color 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-hover)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)";
      }}
    >
      {children}
    </button>
  );
}

function ChevronLeft() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function ChevronRight() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function PlusIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}