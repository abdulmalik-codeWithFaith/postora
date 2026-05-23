"use client";

import { useState } from "react";
import Topbar from "@/components/dashboard/Topbar";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type Platform = "Instagram" | "TikTok" | "Facebook";
type Status   = "published" | "scheduled" | "draft";
type Tab      = "compose" | "queue";

interface ScheduledPost {
  id: number;
  emoji: string;
  caption: string;
  platforms: Platform[];
  date: string;
  time: string;
  status: Status;
}

// ─── Mock queue ───────────────────────────────────────────────────────────────
const INITIAL_QUEUE: ScheduledPost[] = [
  { id: 1,  emoji: "👗", platforms: ["TikTok"],               status: "scheduled", date: "2026-05-23", time: "18:00", caption: "Your wardrobe called — it wants an upgrade 🔥 New collection just dropped." },
  { id: 2,  emoji: "👜", platforms: ["Facebook"],             status: "scheduled", date: "2026-05-24", time: "09:00", caption: "New week, new drops. Come see what just landed in store 🛍️" },
  { id: 3,  emoji: "👡", platforms: ["Instagram"],            status: "scheduled", date: "2026-05-25", time: "12:00", caption: "Dress like the version of yourself you're becoming 💫" },
  { id: 4,  emoji: "📦", platforms: ["TikTok","Instagram"],   status: "scheduled", date: "2026-05-26", time: "10:00", caption: "SHOP THIS before it sells out 🚨 Limited edition!" },
  { id: 5,  emoji: "✨", platforms: ["Facebook"],             status: "draft",     date: "2026-05-28", time: "09:00", caption: "Free delivery on orders over ₦10,000 this weekend 🎉" },
  { id: 6,  emoji: "🌸", platforms: ["Instagram"],            status: "draft",     date: "2026-05-29", time: "11:00", caption: "Summer edit is coming. Stay tuned 👀" },
  { id: 7,  emoji: "👟", platforms: ["Instagram","TikTok"],   status: "published", date: "2026-05-23", time: "10:00", caption: "Step into the season. Made for those who move with purpose 🔗" },
  { id: 8,  emoji: "🧴", platforms: ["TikTok"],               status: "published", date: "2026-05-20", time: "17:00", caption: "New drop alert 🚨 Limited stock — don't sleep on this." },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const PLATFORM_CONFIG: { name: Platform; color: string; placeholder: string }[] = [
  { name: "Instagram", color: "#E1306C", placeholder: "Write your Instagram caption…" },
  { name: "TikTok",    color: "#69C9D0", placeholder: "Write your TikTok caption…" },
  { name: "Facebook",  color: "#1877F2", placeholder: "Write your Facebook caption…" },
];

const STATUS_MAP: Record<Status, { bg: string; color: string }> = {
  published: { bg: "rgba(0,201,141,0.12)",   color: "#00C98D" },
  scheduled: { bg: "rgba(55,138,221,0.12)",  color: "#378ADD" },
  draft:     { bg: "rgba(255,255,255,0.06)", color: "#4e5768" },
};

const MEDIA_ITEMS = [
  { id: 1, name: "shoe_collection.jpg",  emoji: "👟" },
  { id: 2, name: "handbag_promo.mp4",    emoji: "👜" },
  { id: 3, name: "dress_summer.jpg",     emoji: "👗" },
  { id: 4, name: "skincare_flat.jpg",    emoji: "🧴" },
  { id: 5, name: "earrings_gold.jpg",    emoji: "💛" },
  { id: 6, name: "perfume_bottle.jpg",   emoji: "🧪" },
];

const TIME_SLOTS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const [tab, setTab]               = useState<Tab>("compose");
  const [queue, setQueue]           = useState<ScheduledPost[]>(INITIAL_QUEUE);
  const [filterStatus, setFilter]   = useState<Status | "all">("all");

  // ── Compose state ────────────────────────────────────────────────────────────
  const [selectedMedia, setSelectedMedia]       = useState<number | null>(null);
  const [selectedPlatforms, setPlatforms]       = useState<Platform[]>(["Instagram"]);
  const [caption, setCaption]                   = useState("");
  const [scheduleDate, setScheduleDate]         = useState("2026-05-27");
  const [scheduleTime, setScheduleTime]         = useState("10:00");
  const [publishMode, setPublishMode]           = useState<"schedule" | "now" | "draft">("schedule");
  const [submitting, setSubmitting]             = useState(false);
  const [successId, setSuccessId]               = useState<number | null>(null);

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p)
        ? prev.length > 1 ? prev.filter((x) => x !== p) : prev
        : [...prev, p]
    );
  }

  function handleSubmit() {
    if (!caption.trim() || !selectedMedia) return;
    setSubmitting(true);
    setTimeout(() => {
      const newPost: ScheduledPost = {
        id: Date.now(),
        emoji: MEDIA_ITEMS.find((m) => m.id === selectedMedia)?.emoji ?? "📷",
        caption,
        platforms: selectedPlatforms,
        date: publishMode === "now" ? "2026-05-23" : scheduleDate,
        time: publishMode === "now" ? new Date().toTimeString().slice(0, 5) : scheduleTime,
        status: publishMode === "now" ? "published" : publishMode === "draft" ? "draft" : "scheduled",
      };
      setQueue((prev) => [newPost, ...prev]);
      setSuccessId(newPost.id);
      setSubmitting(false);
      setCaption("");
      setSelectedMedia(null);
      setTab("queue");
      setTimeout(() => setSuccessId(null), 3000);
    }, 1600);
  }

  function deletePost(id: number) {
    setQueue((prev) => prev.filter((p) => p.id !== id));
  }

  const filteredQueue = queue.filter((p) => filterStatus === "all" || p.status === filterStatus);
  const scheduledCount = queue.filter((p) => p.status === "scheduled").length;
  const draftCount     = queue.filter((p) => p.status === "draft").length;
  const canSubmit      = caption.trim().length > 0 && selectedMedia !== null;

  return (
    <>
      <Topbar
        title="Schedule & Publish"
        subtitle={`${scheduledCount} scheduled · ${draftCount} drafts`}
      />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Success toast ─────────────────────────────────────────────── */}
        {successId && (
          <div
            style={{
              position: "fixed", top: 24, right: 24, zIndex: 200,
              background: "var(--green)",
              borderRadius: 12, padding: "12px 20px",
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 13, fontWeight: 600, color: "#0a0e14",
              boxShadow: "0 8px 32px rgba(0,201,141,0.3)",
              animation: "slideIn 0.3s ease",
            }}
          >
            <style>{`@keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}`}</style>
            <CheckIcon /> Post added to queue!
          </div>
        )}

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 12, padding: 4, gap: 4,
            width: "fit-content",
          }}
        >
          {([
            { key: "compose", label: "✏️  Compose" },
            { key: "queue",   label: `📋  Queue (${queue.length})` },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "8px 20px", borderRadius: 9, border: "none",
                fontSize: 13, fontWeight: 500, cursor: "pointer",
                background: tab === t.key ? "var(--surface-4)" : "transparent",
                color: tab === t.key ? "var(--text-1)" : "var(--text-3)",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "compose" ? (

          /* ── COMPOSE TAB ──────────────────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-5" style={{ gap: 24, alignItems: "start" }}>

            {/* Left: form (3/5) */}
            <div style={{ gridColumn: "span 3", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* 1. Pick media */}
              <Section step="01" title="Select media" subtitle="Choose a file from your library">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                  {MEDIA_ITEMS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMedia(m.id)}
                      style={{
                        aspectRatio: "1",
                        background: selectedMedia === m.id ? "var(--green-muted)" : "var(--surface-3)",
                        border: `1px solid ${selectedMedia === m.id ? "rgba(0,201,141,0.35)" : "var(--border)"}`,
                        borderRadius: 10, cursor: "pointer",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 4,
                        transition: "all 0.15s", padding: 8,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{m.emoji}</span>
                    </button>
                  ))}
                </div>
                <Link
                  href="/dashboard/media"
                  style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", marginTop: 4, display: "block" }}
                >
                  + Upload new media →
                </Link>
              </Section>

              {/* 2. Platforms */}
              <Section step="02" title="Select platforms" subtitle="Where should this post go?">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {PLATFORM_CONFIG.map((p) => {
                    const active = selectedPlatforms.includes(p.name);
                    return (
                      <button
                        key={p.name}
                        onClick={() => togglePlatform(p.name)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "9px 16px",
                          background: active ? `${p.color}18` : "var(--surface-3)",
                          border: `1px solid ${active ? `${p.color}55` : "var(--border)"}`,
                          borderRadius: 10, cursor: "pointer",
                          fontSize: 13, fontWeight: 500,
                          color: active ? p.color : "var(--text-2)",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                        {p.name}
                        {active && <CheckSmallIcon color={p.color} />}
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* 3. Caption */}
              <Section step="03" title="Write caption" subtitle="Or generate one with AI">
                <div style={{ position: "relative" }}>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder={PLATFORM_CONFIG.find((p) => p.name === selectedPlatforms[0])?.placeholder ?? "Write your caption…"}
                    rows={5}
                    maxLength={2200}
                    style={{
                      width: "100%", padding: "14px",
                      background: "var(--surface-3)",
                      border: "1px solid var(--border-hover)",
                      borderRadius: 12,
                      fontSize: 14, color: "var(--text-1)",
                      resize: "none", outline: "none",
                      lineHeight: 1.65, fontFamily: "inherit",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
                  />
                  <div
                    style={{
                      position: "absolute", bottom: 10, right: 12,
                      fontSize: 11, color: caption.length > 2000 ? "#e24b4a" : "var(--text-3)",
                    }}
                  >
                    {caption.length} / 2200
                  </div>
                </div>
                <Link
                  href="/dashboard/captions"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 12, color: "var(--green)", textDecoration: "none",
                  }}
                >
                  <SparkleIcon /> Generate with AI →
                </Link>
              </Section>

              {/* 4. Schedule */}
              <Section step="04" title="When to publish" subtitle="Set date, time, or publish now">
                {/* Mode selector */}
                <div style={{ display: "flex", gap: 8 }}>
                  {([
                    { key: "schedule", label: "📅 Schedule" },
                    { key: "now",      label: "⚡ Publish now" },
                    { key: "draft",    label: "📝 Save draft" },
                  ] as const).map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setPublishMode(m.key)}
                      style={{
                        flex: 1, padding: "9px 8px",
                        background: publishMode === m.key ? "var(--green-muted)" : "var(--surface-3)",
                        border: `1px solid ${publishMode === m.key ? "rgba(0,201,141,0.3)" : "var(--border)"}`,
                        borderRadius: 10, cursor: "pointer",
                        fontSize: 12, fontWeight: 500,
                        color: publishMode === m.key ? "var(--green)" : "var(--text-2)",
                        transition: "all 0.15s",
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Date + time pickers */}
                {publishMode === "schedule" && (
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>Date</label>
                      <input
                        type="date"
                        value={scheduleDate}
                        min="2026-05-23"
                        onChange={(e) => setScheduleDate(e.target.value)}
                        style={{
                          padding: "10px 12px",
                          background: "var(--surface-3)",
                          border: "1px solid var(--border-hover)",
                          borderRadius: 10, fontSize: 13,
                          color: "var(--text-1)", outline: "none",
                          cursor: "pointer",
                          colorScheme: "dark",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
                      />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>Time</label>
                      <select
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        style={{
                          padding: "10px 12px",
                          background: "var(--surface-3)",
                          border: "1px solid var(--border-hover)",
                          borderRadius: 10, fontSize: 13,
                          color: "var(--text-1)", outline: "none",
                          cursor: "pointer",
                          colorScheme: "dark",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
                      >
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {publishMode === "now" && (
                  <div
                    style={{
                      marginTop: 4, padding: "12px 14px",
                      background: "rgba(0,201,141,0.07)",
                      border: "1px solid rgba(0,201,141,0.2)",
                      borderRadius: 10,
                      fontSize: 13, color: "var(--green)",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Post will go live immediately after submission
                  </div>
                )}

                {publishMode === "draft" && (
                  <div
                    style={{
                      marginTop: 4, padding: "12px 14px",
                      background: "var(--surface-3)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 13, color: "var(--text-2)",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    Saved to drafts — you can schedule it later
                  </div>
                )}
              </Section>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                style={{
                  width: "100%", padding: "14px",
                  background: canSubmit ? "var(--green)" : "var(--surface-3)",
                  border: "none", borderRadius: 12,
                  fontSize: 14, fontWeight: 700,
                  color: canSubmit ? "#0a0e14" : "var(--text-3)",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  opacity: submitting ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s",
                }}
              >
                {submitting ? (
                  <><Spinner /> Adding to queue…</>
                ) : publishMode === "now" ? (
                  <><SendIcon /> Publish now</>
                ) : publishMode === "draft" ? (
                  <><DraftIcon /> Save draft</>
                ) : (
                  <><ClockIcon /> Schedule post</>
                )}
              </button>
              {!canSubmit && (
                <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", marginTop: -12 }}>
                  {!selectedMedia ? "Select a media file" : "Write a caption to continue"}
                </p>
              )}
            </div>

            {/* Right: live preview (2/5) */}
            <div style={{ gridColumn: "span 2" }}>
              <PostPreview
                emoji={MEDIA_ITEMS.find((m) => m.id === selectedMedia)?.emoji ?? null}
                caption={caption}
                platforms={selectedPlatforms}
                date={scheduleDate}
                time={scheduleTime}
                mode={publishMode}
              />
            </div>
          </div>

        ) : (

          /* ── QUEUE TAB ────────────────────────────────────────────────── */
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Filter + stats */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div
                style={{
                  display: "flex",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 10, padding: 3, gap: 2,
                }}
              >
                {(["all", "scheduled", "draft", "published"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "none",
                      fontSize: 12, fontWeight: 500, cursor: "pointer",
                      background: filterStatus === s ? "var(--surface-4)" : "transparent",
                      color: filterStatus === s ? "var(--text-1)" : "var(--text-3)",
                      textTransform: "capitalize",
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    {s === "all" ? `All (${queue.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${queue.filter((p) => p.status === s).length})`}
                  </button>
                ))}
              </div>

              <div style={{ flex: 1 }} />

              <button
                onClick={() => setTab("compose")}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px",
                  background: "var(--green)", border: "none", borderRadius: 9,
                  fontSize: 13, fontWeight: 600, color: "#0a0e14", cursor: "pointer",
                }}
              >
                <PlusIcon /> New post
              </button>
            </div>

            {/* Queue list */}
            {filteredQueue.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-3)" }}>
                <p style={{ fontSize: 30, marginBottom: 10 }}>📭</p>
                <p style={{ fontSize: 15 }}>No {filterStatus !== "all" ? filterStatus : ""} posts yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredQueue.map((post) => (
                  <QueueRow
                    key={post.id}
                    post={post}
                    onDelete={() => deletePost(post.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function Section({ step, title, subtitle, children }: { step: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface-2)", border: "1px solid var(--border)",
        borderRadius: 16, padding: 20,
        display: "flex", flexDirection: "column", gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
            background: "var(--green-muted)",
            border: "1px solid rgba(0,201,141,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "var(--green)",
            fontFamily: "var(--font-sora), sans-serif",
          }}
        >
          {step}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{title}</p>
          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POST PREVIEW
// ─────────────────────────────────────────────────────────────────────────────
function PostPreview({
  emoji, caption, platforms, date, time, mode,
}: {
  emoji: string | null;
  caption: string;
  platforms: Platform[];
  date: string;
  time: string;
  mode: "schedule" | "now" | "draft";
}) {
  const platformColors: Record<Platform, string> = {
    Instagram: "#E1306C",
    TikTok: "#69C9D0",
    Facebook: "#1877F2",
  };

  return (
    <div
      style={{
        background: "var(--surface-2)", border: "1px solid var(--border)",
        borderRadius: 16, overflow: "hidden",
        position: "sticky", top: 80,
      }}
    >
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>
          Live preview
        </p>
      </div>

      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Media preview */}
        <div
          style={{
            height: 180, borderRadius: 12,
            background: "var(--surface-3)",
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: emoji ? 64 : 28,
            color: emoji ? undefined : "var(--text-3)",
          }}
        >
          {emoji ?? "🖼️"}
        </div>

        {/* Caption preview */}
        <div
          style={{
            minHeight: 60, padding: "12px 14px",
            background: "var(--surface-3)",
            border: "1px solid var(--border)", borderRadius: 12,
            fontSize: 13, color: caption ? "var(--text-1)" : "var(--text-3)",
            lineHeight: 1.65,
          }}
        >
          {caption || "Your caption will appear here…"}
        </div>

        {/* Platforms */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {platforms.map((p) => (
            <span
              key={p}
              style={{
                fontSize: 11, fontWeight: 600,
                padding: "3px 10px", borderRadius: 999,
                background: `${platformColors[p]}18`,
                color: platformColors[p],
              }}
            >
              {p}
            </span>
          ))}
        </div>

        {/* Schedule info */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 14px",
            background: "var(--surface-3)", borderRadius: 10,
            fontSize: 12, color: "var(--text-2)",
          }}
        >
          <ClockIcon size={14} />
          {mode === "now"   && "Publishing immediately"}
          {mode === "draft" && "Saved as draft"}
          {mode === "schedule" && `${date} at ${time}`}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUEUE ROW
// ─────────────────────────────────────────────────────────────────────────────
function QueueRow({ post, onDelete }: { post: ScheduledPost; onDelete: () => void }) {
  const [hover, setHover] = useState(false);
  const s = STATUS_MAP[post.status];
  const platformColors: Record<Platform, string> = {
    Instagram: "#E1306C",
    TikTok: "#69C9D0",
    Facebook: "#1877F2",
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "16px 20px",
        background: "var(--surface-2)",
        border: `1px solid ${hover ? "var(--border-hover)" : "var(--border)"}`,
        borderRadius: 14,
        transition: "border-color 0.15s",
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 48, height: 48, borderRadius: 10, flexShrink: 0,
          background: "var(--surface-3)",
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24,
        }}
      >
        {post.emoji}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13, fontWeight: 500, color: "var(--text-1)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            marginBottom: 6,
          }}
        >
          {post.caption}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Platforms */}
          {post.platforms.map((p) => (
            <span
              key={p}
              style={{
                fontSize: 10, fontWeight: 600,
                padding: "2px 8px", borderRadius: 999,
                background: `${platformColors[p]}18`,
                color: platformColors[p],
              }}
            >
              {p}
            </span>
          ))}
          {/* Date + time */}
          <span style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
            <ClockIcon size={11} />
            {post.date} · {post.time}
          </span>
        </div>
      </div>

      {/* Status */}
      <span
        style={{
          fontSize: 10, fontWeight: 700,
          padding: "4px 10px", borderRadius: 999,
          background: s.bg, color: s.color,
          textTransform: "uppercase", letterSpacing: "0.05em",
          flexShrink: 0,
        }}
      >
        {post.status}
      </span>

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <Link
          href="#"
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--surface-3)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-2)", textDecoration: "none",
            transition: "border-color 0.15s",
          }}
          title="Edit"
        >
          <EditIcon />
        </Link>
        <button
          onClick={onDelete}
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#e24b4a", cursor: "pointer",
          }}
          title="Delete"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
function CheckIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function CheckSmallIcon({ color }: { color: string }) {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function SparkleIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l1.6 5H19l-4.1 3 1.5 5L12 12l-4.4 3 1.5-5L5 7h5.4z"/></svg>;
}
function Spinner() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
}
function SendIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
}
function DraftIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
}
function ClockIcon({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function PlusIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function EditIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}