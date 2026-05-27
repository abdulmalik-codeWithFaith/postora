"use client";

import { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/dashboard/Topbar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserPosts, updatePost, deletePost } from "@/lib/firestore";
import { Post } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
type Platform = "Instagram" | "TikTok" | "Facebook";
type Status   = "published" | "scheduled" | "draft" | "failed";

// ─── Config ───────────────────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "#E1306C",
  TikTok:    "#69C9D0",
  Facebook:  "#1877F2",
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  published: { bg: "rgba(0,201,141,0.12)",   color: "#00C98D" },
  scheduled: { bg: "rgba(55,138,221,0.12)",  color: "#378ADD" },
  draft:     { bg: "rgba(255,255,255,0.06)", color: "#4e5768" },
  failed:    { bg: "rgba(226,75,74,0.12)",   color: "#e24b4a" },
};

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const { user } = useAuth();

  const today = new Date();

  const [posts,          setPosts]          = useState<Post[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [current,        setCurrent]        = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [filterPlatform, setFilter]         = useState<Platform | "all">("all");
  const [selectedPost,   setSelectedPost]   = useState<Post | null>(null);
  const [selectedDay,    setSelectedDay]    = useState<string | null>(null);
  const [deleting,       setDeleting]       = useState(false);

  // ── Load posts from Firestore ─────────────────────────────────────────────
  const loadPosts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const items = await getUserPosts(user.uid);
      setPosts(items);
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const year  = current.getFullYear();
  const month = current.getMonth();

  function prevMonth() { setCurrent(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrent(new Date(year, month + 1, 1)); }
  function goToday()   { setCurrent(new Date(today.getFullYear(), today.getMonth(), 1)); }

  function toDateStr(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  // ── Get post date string (YYYY-MM-DD) from ISO scheduledAt ────────────────
  function getPostDate(post: Post): string {
    const iso = post.scheduledAt ?? post.publishedAt ?? post.createdAt;
    if (!iso) return "";
    return iso.slice(0, 10);
  }

  function getPostTime(post: Post): string {
    const iso = post.scheduledAt ?? post.publishedAt ?? post.createdAt;
    if (!iso) return "";
    return new Date(iso).toTimeString().slice(0, 5);
  }

  function postsForDay(dateStr: string): Post[] {
    return posts.filter((p) => {
      const matchDate     = getPostDate(p) === dateStr;
      const matchPlatform = filterPlatform === "all" || p.platforms.includes(filterPlatform as Platform);
      return matchDate && matchPlatform;
    });
  }

  // ── Build month grid ──────────────────────────────────────────────────────
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

  // ── Stats for current month ───────────────────────────────────────────────
  const monthPrefix    = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthPosts     = posts.filter((p) => getPostDate(p).startsWith(monthPrefix));
  const publishedCount = monthPosts.filter((p) => p.status === "published").length;
  const scheduledCount = monthPosts.filter((p) => p.status === "scheduled").length;
  const draftCount     = monthPosts.filter((p) => p.status === "draft").length;

  const dayLabel = selectedDay ?? todayStr;
  const dayPosts = postsForDay(dayLabel);

  // ── Delete post ───────────────────────────────────────────────────────────
  async function handleDelete(post: Post) {
    try {
      setDeleting(true);
      await deletePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setSelectedPost(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  }

  // ── Update post status ────────────────────────────────────────────────────
  async function handleStatusChange(post: Post, status: string) {
    try {
      await updatePost(post.id, { status: status as Post["status"] });
      setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, status: status as Post["status"] } : p));
      setSelectedPost((prev) => prev ? { ...prev, status: status as Post["status"] } : null);
    } catch (err) {
      console.error("Status update failed:", err);
    }
  }

  return (
    <>
      <Topbar title="Content Calendar" subtitle={`${MONTHS[month]} ${year}`} />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
          {[
            { label: "Total this month", value: loading ? "—" : monthPosts.length,   color: "var(--text-1)" },
            { label: "Published",        value: loading ? "—" : publishedCount,       color: "#00C98D"       },
            { label: "Scheduled",        value: loading ? "—" : scheduledCount,       color: "#378ADD"       },
            { label: "Drafts",           value: loading ? "—" : draftCount,           color: "var(--text-3)" },
          ].map((s) => (
            <div key={s.label} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px" }}>
              <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500, marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4" style={{ gap: 20, alignItems: "start" }}>

          {/* ── Calendar (3/4) ───────────────────────────────────────────── */}
          <div style={{ gridColumn: "span 3", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden" }}>

            {/* Toolbar */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <NavBtn onClick={prevMonth}><ChevronLeft /></NavBtn>
                <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-1)", minWidth: 140, textAlign: "center" }}>
                  {MONTHS[month]} {year}
                </span>
                <NavBtn onClick={nextMonth}><ChevronRight /></NavBtn>
              </div>

              <button onClick={goToday} style={{ padding: "6px 14px", borderRadius: 8, background: "var(--surface-3)", border: "1px solid var(--border)", fontSize: 12, fontWeight: 500, color: "var(--text-2)", cursor: "pointer" }}>
                Today
              </button>

              <div style={{ flex: 1 }} />

              {/* Platform filter */}
              <div style={{ display: "flex", gap: 4 }}>
                {(["all", "Instagram", "TikTok", "Facebook"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilter(p)}
                    style={{ padding: "5px 12px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer", background: filterPlatform === p ? (p === "all" ? "var(--surface-4)" : `${PLATFORM_COLORS[p]}22`) : "transparent", color: filterPlatform === p ? (p === "all" ? "var(--text-1)" : PLATFORM_COLORS[p]) : "var(--text-3)", transition: "all 0.15s" }}
                  >
                    {p === "all" ? "All" : p}
                  </button>
                ))}
              </div>

              <Link href="/dashboard/schedule" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, background: "var(--green)", fontSize: 12, fontWeight: 600, color: "#0a0e14", textDecoration: "none" }}>
                <PlusIcon /> New post
              </Link>
            </div>

            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--border)" }}>
              {DAYS.map((d) => (
                <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{d}</div>
              ))}
            </div>

            {/* Loading skeleton */}
            {loading ? (
              <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} style={{ height: 80, background: "var(--surface-3)", borderRadius: 6, animation: "pulse 1.4s ease-in-out infinite" }} />
                ))}
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
              </div>
            ) : (
              /* Day cells */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {cells.map((cell, idx) => {
                  const cellPosts  = postsForDay(cell.dateStr);
                  const isToday    = cell.dateStr === todayStr;
                  const isCur      = cell.month === "cur";
                  const isSelected = cell.dateStr === selectedDay;
                  const isLast     = idx >= cells.length - 7;

                  return (
                    <div
                      key={cell.dateStr}
                      onClick={() => setSelectedDay(cell.dateStr === selectedDay ? null : cell.dateStr)}
                      style={{ minHeight: 100, padding: "8px 6px", borderRight: (idx + 1) % 7 !== 0 ? "1px solid var(--border)" : "none", borderBottom: !isLast ? "1px solid var(--border)" : "none", background: isSelected ? "rgba(0,201,141,0.04)" : "transparent", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "var(--surface-3)"; }}
                      onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                    >
                      {/* Date number */}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                        <span style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: isToday ? 700 : 400, background: isToday ? "var(--green)" : "transparent", color: isToday ? "#0a0e14" : isCur ? "var(--text-1)" : "var(--text-3)" }}>
                          {cell.date}
                        </span>
                      </div>

                      {/* Post pills */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {cellPosts.slice(0, 3).map((post) => (
                          <div
                            key={post.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 6px", borderRadius: 5, background: `${PLATFORM_COLORS[post.platforms[0]] ?? "#888"}18`, borderLeft: `2px solid ${PLATFORM_COLORS[post.platforms[0]] ?? "#888"}`, cursor: "pointer", transition: "opacity 0.15s" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = "0.7")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = "1")}
                          >
                            {post.mediaUrl ? (
                              <img src={post.mediaUrl} alt="" style={{ width: 12, height: 12, borderRadius: 2, objectFit: "cover", flexShrink: 0 }} />
                            ) : (
                              <span style={{ fontSize: 10, flexShrink: 0 }}>{post.mediaEmoji ?? "📷"}</span>
                            )}
                            <span style={{ fontSize: 10, fontWeight: 500, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
                              {getPostTime(post)}
                            </span>
                          </div>
                        ))}
                        {cellPosts.length > 3 && (
                          <span style={{ fontSize: 9, color: "var(--text-3)", paddingLeft: 6 }}>+{cellPosts.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Right panel (1/4) ─────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Day detail */}
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>
                  {dayLabel === todayStr ? "Today" : formatDateLabel(dayLabel)}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                  {dayPosts.length} post{dayPosts.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div style={{ padding: "12px 0" }}>
                {loading ? (
                  <div style={{ padding: "16px" }}>
                    {[1,2].map((i) => (
                      <div key={i} style={{ height: 48, background: "var(--surface-3)", borderRadius: 8, marginBottom: 8, animation: "pulse 1.4s ease-in-out infinite" }} />
                    ))}
                  </div>
                ) : dayPosts.length === 0 ? (
                  <div style={{ padding: "24px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 22, marginBottom: 6 }}>📭</p>
                    <p style={{ fontSize: 12, color: "var(--text-3)" }}>Nothing scheduled</p>
                    <Link href="/dashboard/schedule" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", display: "block", marginTop: 8 }}>+ Add a post</Link>
                  </div>
                ) : (
                  dayPosts.map((post, i) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 16px", borderBottom: i < dayPosts.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--surface-3)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, marginTop: 5, background: PLATFORM_COLORS[post.platforms[0]] ?? "#888" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: PLATFORM_COLORS[post.platforms[0]] ?? "#888" }}>{post.platforms.join(", ")}</span>
                          <span style={{ fontSize: 10, color: "var(--text-3)" }}>{getPostTime(post)}</span>
                        </div>
                        <p style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
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
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Legend</p>
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

      {/* ── Post detail modal ──────────────────────────────────────────────── */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          deleting={deleting}
          onClose={() => setSelectedPost(null)}
          onDelete={() => handleDelete(selectedPost)}
          onStatusChange={(status) => handleStatusChange(selectedPost, status)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POST MODAL
// ─────────────────────────────────────────────────────────────────────────────
function PostModal({ post, deleting, onClose, onDelete, onStatusChange }: {
  post: Post;
  deleting: boolean;
  onClose: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}) {
  const scheduledDate = post.scheduledAt ?? post.publishedAt ?? post.createdAt;
  const dateStr = scheduledDate ? new Date(scheduledDate).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const timeStr = scheduledDate ? new Date(scheduledDate).toTimeString().slice(0, 5) : "—";

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--surface-2)", border: "1px solid var(--border-hover)", borderRadius: 20, width: "100%", maxWidth: 440, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {post.mediaUrl
                ? <img src={post.mediaUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontSize: 20 }}>{post.mediaEmoji ?? "📷"}</span>
              }
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{post.platforms.join(", ")}</p>
              <p style={{ fontSize: 11, color: "var(--text-3)" }}>{dateStr} at {timeStr}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4, display: "flex" }}>
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Caption */}
          <div style={{ background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", fontSize: 14, color: "var(--text-1)", lineHeight: 1.7 }}>
            {post.caption}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2" style={{ gap: 10 }}>
            {[
              { label: "Platform", value: post.platforms.join(", ") },
              { label: "Date",     value: dateStr                   },
              { label: "Time",     value: timeStr                   },
              { label: "Reach",    value: post.reach ? post.reach.toLocaleString() : "—" },
            ].map((m) => (
              <div key={m.label} style={{ background: "var(--surface-3)", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 3 }}>{m.label}</p>
                <p style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500 }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Status selector */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>Status</span>
            <select
              value={post.status}
              onChange={(e) => onStatusChange(e.target.value)}
              style={{ padding: "6px 12px", background: "var(--surface-3)", border: "1px solid var(--border-hover)", borderRadius: 9, fontSize: 12, color: "var(--text-1)", outline: "none", colorScheme: "dark", cursor: "pointer" }}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/dashboard/schedule" style={{ flex: 1, textAlign: "center", padding: "11px", background: "var(--green)", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#0a0e14", textDecoration: "none" }}>
              Edit post
            </Link>
            <button
              onClick={onDelete}
              disabled={deleting}
              style={{ padding: "11px 16px", background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "#e24b4a", cursor: deleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? <Spinner /> : <TrashIcon />} Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function formatDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.draft;
  return (
    <span style={{ display: "inline-block", marginTop: 5, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: s.bg, color: s.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {status}
    </span>
  );
}

function NavBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ width: 30, height: 30, borderRadius: 8, background: "var(--surface-3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-2)", transition: "border-color 0.15s, color 0.15s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-hover)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-1)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)"; }}
    >
      {children}
    </button>
  );
}

function ChevronLeft()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevronRight() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>; }
function PlusIcon()     { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function CloseIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function TrashIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>; }
function Spinner()      { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>; }