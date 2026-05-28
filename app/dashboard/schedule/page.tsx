"use client";

import { useState, useEffect, useCallback } from "react";
import Topbar from "@/components/dashboard/Topbar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserPosts, getUserMedia, createPost, deletePost, updatePost } from "@/lib/firestore";
import { Post, MediaItem } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
type Platform    = "Instagram" | "TikTok" | "Facebook";
type PublishMode = "schedule" | "now" | "draft";
type Tab         = "compose" | "queue";
type FilterStatus = "all" | "published" | "scheduled" | "draft" | "failed";

// ─── Config ───────────────────────────────────────────────────────────────────
const PLATFORM_CONFIG: { name: Platform; color: string; placeholder: string }[] = [
  { name: "Instagram", color: "#E1306C", placeholder: "Write your Instagram caption…" },
  { name: "TikTok",    color: "#69C9D0", placeholder: "Write your TikTok caption…"    },
  { name: "Facebook",  color: "#1877F2", placeholder: "Write your Facebook caption…"  },
];

const STATUS_MAP: Record<string, { bg: string; color: string }> = {
  published: { bg: "rgba(0,201,141,0.12)",   color: "#00C98D" },
  scheduled: { bg: "rgba(55,138,221,0.12)",  color: "#378ADD" },
  draft:     { bg: "rgba(255,255,255,0.06)", color: "#4e5768" },
  failed:    { bg: "rgba(226,75,74,0.12)",   color: "#e24b4a" },
};

const TIME_SLOTS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const { user } = useAuth();

  // ── State ─────────────────────────────────────────────────────────────────
  const [tab,          setTab]          = useState<Tab>("compose");
  const [queue,        setQueue]        = useState<Post[]>([]);
  const [mediaItems,   setMediaItems]   = useState<MediaItem[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilter]       = useState<FilterStatus>("all");

  // ── Compose state ─────────────────────────────────────────────────────────
  const [selectedMedia,     setSelectedMedia]     = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["Instagram"]);
  const [caption,           setCaption]           = useState("");
  const [scheduleDate,      setScheduleDate]       = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [scheduleTime,  setScheduleTime]  = useState("10:00");
  const [publishMode,   setPublishMode]   = useState<PublishMode>("schedule");
  const [submitting,    setSubmitting]    = useState(false);
  const [successId,     setSuccessId]     = useState<string | null>(null);
  const [deletingId,    setDeletingId]    = useState<string | null>(null);

  // ── Load posts + media ────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [posts, media] = await Promise.all([
        getUserPosts(user.uid),
        getUserMedia(user.uid),
      ]);
      setQueue(posts);
      setMediaItems(media);
    } catch (err) {
      console.error("Failed to load schedule data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Toggle platform ───────────────────────────────────────────────────────
  function togglePlatform(p: Platform) {
    setSelectedPlatforms((prev) =>
      prev.includes(p)
        ? prev.length > 1 ? prev.filter((x) => x !== p) : prev
        : [...prev, p]
    );
  }

  // ── Submit post to Firestore ──────────────────────────────────────────────
  async function handleSubmit() {
    if (!caption.trim() || !user) return;
    setSubmitting(true);

    try {
      const selectedItem = mediaItems.find((m) => m.id === selectedMedia);

      // Build scheduledAt ISO string
      let scheduledAt: string | null = null;
      if (publishMode === "schedule") {
        scheduledAt = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
      } else if (publishMode === "now") {
        scheduledAt = new Date().toISOString();
      }

      const status = publishMode === "now" ? "published" : publishMode === "draft" ? "draft" : "scheduled";

      const postData = {
        caption,
        platforms:   selectedPlatforms as Platform[],
        status:      status as Post["status"],
        scheduledAt,
        publishedAt: publishMode === "now" ? new Date().toISOString() : null,
        mediaId:     selectedMedia,
        mediaUrl:    selectedItem?.cloudinaryUrl ?? null,
        mediaEmoji:  selectedItem?.type === "video" ? "🎬" : "📷",
        failReason:  null,
        reach:       0,
        likes:       0,
      };

      const docId = await createPost(user.uid, postData);

      // Add to local queue
      const newPost: Post = {
        id:        docId,
        userId:    user.uid,
        createdAt: new Date().toISOString(),
        ...postData,
      };

      setQueue((prev) => [newPost, ...prev]);
      setSuccessId(docId);
      setSubmitting(false);

      // Reset form
      setCaption("");
      setSelectedMedia(null);
      setSelectedPlatforms(["Instagram"]);
      setPublishMode("schedule");
      setTab("queue");

      setTimeout(() => setSuccessId(null), 3000);
    } catch (err) {
      console.error("Submit post error:", err);
      setSubmitting(false);
    }
  }

  // ── Delete post ───────────────────────────────────────────────────────────
  async function handleDelete(postId: string) {
    try {
      setDeletingId(postId);
      await deletePost(postId);
      setQueue((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Delete post error:", err);
    } finally {
      setDeletingId(null);
    }
  }

  // ── Update post status ────────────────────────────────────────────────────
  async function handleStatusChange(postId: string, status: Post["status"]) {
    try {
      await updatePost(postId, { status });
      setQueue((prev) => prev.map((p) => p.id === postId ? { ...p, status } : p));
    } catch (err) {
      console.error("Status update error:", err);
    }
  }

  // ── Filtered queue ────────────────────────────────────────────────────────
  const filteredQueue = queue.filter((p) => filterStatus === "all" || p.status === filterStatus);
  const scheduledCount = queue.filter((p) => p.status === "scheduled").length;
  const draftCount     = queue.filter((p) => p.status === "draft").length;
  const canSubmit      = caption.trim().length > 0;

  const selectedItem = mediaItems.find((m) => m.id === selectedMedia);

  return (
    <>
      <Topbar
        title="Schedule & Publish"
        subtitle={loading ? "Loading…" : `${scheduledCount} scheduled · ${draftCount} drafts`}
      />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Success toast ─────────────────────────────────────────────── */}
        {successId && (
          <div style={{ position: "fixed", top: 24, right: 24, zIndex: 200, background: "var(--green)", borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600, color: "#0a0e14", boxShadow: "0 8px 32px rgba(0,201,141,0.3)", animation: "slideIn 0.3s ease" }}>
            <style>{`@keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}`}</style>
            <CheckIcon /> Post added to queue!
          </div>
        )}

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: 4, gap: 4, width: "fit-content" }}>
          {([
            { key: "compose", label: "✏️  Compose" },
            { key: "queue",   label: `📋  Queue (${queue.length})` },
          ] as const).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "8px 20px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", background: tab === t.key ? "var(--surface-4)" : "transparent", color: tab === t.key ? "var(--text-1)" : "var(--text-3)", transition: "background 0.15s, color 0.15s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "compose" ? (

          /* ── COMPOSE TAB ──────────────────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-5" style={{ gap: 24, alignItems: "start" }}>

            {/* Left: form (3/5) */}
            <div style={{ gridColumn: "span 3", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* 01 Media */}
              <Section step="01" title="Select media" subtitle="Choose a file from your library">
                {loading ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
                    {[1,2,3,4,5,6].map((i) => <div key={i} style={{ aspectRatio: "1", background: "var(--surface-3)", borderRadius: 10, animation: "pulse 1.4s ease-in-out infinite" }} />)}
                    <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
                  </div>
                ) : mediaItems.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "12px 0" }}>
                    <p style={{ fontSize: 12, color: "var(--text-3)" }}>No media yet</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                    {mediaItems.slice(0, 6).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMedia(m.id === selectedMedia ? null : m.id)}
                        style={{ aspectRatio: "1", background: selectedMedia === m.id ? "var(--green-muted)" : "var(--surface-3)", border: `1px solid ${selectedMedia === m.id ? "rgba(0,201,141,0.35)" : "var(--border)"}`, borderRadius: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, transition: "all 0.15s", padding: 4, overflow: "hidden" }}
                      >
                        {m.type === "image"
                          ? <img src={m.cloudinaryUrl} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
                          : <span style={{ fontSize: 22 }}>🎬</span>
                        }
                      </button>
                    ))}
                  </div>
                )}
                <Link href="/dashboard/media" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", marginTop: 4, display: "block" }}>
                  + Upload new media →
                </Link>
              </Section>

              {/* 02 Platforms */}
              <Section step="02" title="Select platforms" subtitle="Where should this post go?">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {PLATFORM_CONFIG.map((p) => {
                    const active = selectedPlatforms.includes(p.name);
                    return (
                      <button
                        key={p.name}
                        onClick={() => togglePlatform(p.name)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: active ? `${p.color}18` : "var(--surface-3)", border: `1px solid ${active ? `${p.color}55` : "var(--border)"}`, borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 500, color: active ? p.color : "var(--text-2)", transition: "all 0.15s" }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                        {p.name}
                        {active && <CheckSmallIcon color={p.color} />}
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* 03 Caption */}
              <Section step="03" title="Write caption" subtitle="Or generate one with AI">
                <div style={{ position: "relative" }}>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder={PLATFORM_CONFIG.find((p) => p.name === selectedPlatforms[0])?.placeholder ?? "Write your caption…"}
                    rows={5}
                    maxLength={2200}
                    style={{ width: "100%", padding: "14px", background: "var(--surface-3)", border: "1px solid var(--border-hover)", borderRadius: 12, fontSize: 14, color: "var(--text-1)", resize: "none", outline: "none", lineHeight: 1.65, fontFamily: "inherit", transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
                  />
                  <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 11, color: caption.length > 2000 ? "#e24b4a" : "var(--text-3)" }}>
                    {caption.length} / 2200
                  </div>
                </div>
                <Link href="/dashboard/captions" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--green)", textDecoration: "none" }}>
                  <SparkleIcon /> Generate with AI →
                </Link>
              </Section>

              {/* 04 Schedule */}
              <Section step="04" title="When to publish" subtitle="Set date, time, or publish now">
                <div style={{ display: "flex", gap: 8 }}>
                  {([
                    { key: "schedule", label: "📅 Schedule"     },
                    { key: "now",      label: "⚡ Publish now"  },
                    { key: "draft",    label: "📝 Save draft"   },
                  ] as const).map((m) => (
                    <button key={m.key} onClick={() => setPublishMode(m.key)} style={{ flex: 1, padding: "9px 8px", background: publishMode === m.key ? "var(--green-muted)" : "var(--surface-3)", border: `1px solid ${publishMode === m.key ? "rgba(0,201,141,0.3)" : "var(--border)"}`, borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 500, color: publishMode === m.key ? "var(--green)" : "var(--text-2)", transition: "all 0.15s" }}>
                      {m.label}
                    </button>
                  ))}
                </div>

                {publishMode === "schedule" && (
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>Date</label>
                      <input
                        type="date"
                        value={scheduleDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        style={{ padding: "10px 12px", background: "var(--surface-3)", border: "1px solid var(--border-hover)", borderRadius: 10, fontSize: 13, color: "var(--text-1)", outline: "none", cursor: "pointer", colorScheme: "dark" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
                      />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>Time</label>
                      <select
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        style={{ padding: "10px 12px", background: "var(--surface-3)", border: "1px solid var(--border-hover)", borderRadius: 10, fontSize: 13, color: "var(--text-1)", outline: "none", cursor: "pointer", colorScheme: "dark" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
                      >
                        {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {publishMode === "now" && (
                  <div style={{ marginTop: 4, padding: "12px 14px", background: "rgba(0,201,141,0.07)", border: "1px solid rgba(0,201,141,0.2)", borderRadius: 10, fontSize: 13, color: "var(--green)", display: "flex", alignItems: "center", gap: 8 }}>
                    <ClockIcon size={14} /> Post will go live immediately after submission
                  </div>
                )}

                {publishMode === "draft" && (
                  <div style={{ marginTop: 4, padding: "12px 14px", background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 8 }}>
                    <DraftIcon /> Saved to drafts — you can schedule it later
                  </div>
                )}
              </Section>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                style={{ width: "100%", padding: "14px", background: canSubmit ? "var(--green)" : "var(--surface-3)", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, color: canSubmit ? "#0a0e14" : "var(--text-3)", cursor: canSubmit ? "pointer" : "not-allowed", opacity: submitting ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}
              >
                {submitting      ? <><Spinner /> Saving…</>
                 : publishMode === "now"   ? <><SendIcon />  Publish now</>
                 : publishMode === "draft" ? <><DraftIcon /> Save draft</>
                 : <><ClockIcon size={14} /> Schedule post</>}
              </button>
              {!canSubmit && (
                <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", marginTop: -12 }}>
                  Write a caption to continue
                </p>
              )}
            </div>

            {/* Right: live preview (2/5) */}
            <div style={{ gridColumn: "span 2" }}>
              <PostPreview
                mediaUrl={selectedItem?.cloudinaryUrl ?? null}
                mediaType={selectedItem?.type ?? null}
                caption={caption}
                platforms={selectedPlatforms}
                date={scheduleDate}
                time={scheduleTime}
                mode={publishMode}
              />
            </div>
          </div>

        ) : (

          /* ── QUEUE TAB ──────────────────────────────────────────────── */
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Filter + new post */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 3, gap: 2 }}>
                {(["all", "scheduled", "draft", "published", "failed"] as FilterStatus[]).map((s) => (
                  <button key={s} onClick={() => setFilter(s)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer", background: filterStatus === s ? "var(--surface-4)" : "transparent", color: filterStatus === s ? "var(--text-1)" : "var(--text-3)", textTransform: "capitalize", transition: "background 0.15s, color 0.15s" }}>
                    {s === "all" ? `All (${queue.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${queue.filter((p) => p.status === s).length})`}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <button onClick={() => setTab("compose")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--green)", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "#0a0e14", cursor: "pointer" }}>
                <PlusIcon /> New post
              </button>
            </div>

            {/* Queue list */}
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1,2,3].map((i) => (
                  <div key={i} style={{ height: 76, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, animation: "pulse 1.4s ease-in-out infinite" }} />
                ))}
              </div>
            ) : filteredQueue.length === 0 ? (
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
                    deleting={deletingId === post.id}
                    onDelete={() => handleDelete(post.id)}
                    onStatusChange={(status) => handleStatusChange(post.id, status as Post["status"])}
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
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: "var(--green-muted)", border: "1px solid rgba(0,201,141,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-sora), sans-serif" }}>
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
function PostPreview({ mediaUrl, mediaType, caption, platforms, date, time, mode }: {
  mediaUrl: string | null;
  mediaType: "image" | "video" | null;
  caption: string;
  platforms: Platform[];
  date: string;
  time: string;
  mode: PublishMode;
}) {
  const platformColors: Record<Platform, string> = { Instagram: "#E1306C", TikTok: "#69C9D0", Facebook: "#1877F2" };
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", position: "sticky", top: 80 }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>Live preview</p>
      </div>
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Media */}
        <div style={{ height: 180, borderRadius: 12, background: "var(--surface-3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {mediaUrl && mediaType === "image" ? (
            <img src={mediaUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : mediaUrl && mediaType === "video" ? (
            <video src={mediaUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
          ) : (
            <span style={{ fontSize: 28, color: "var(--text-3)" }}>🖼️</span>
          )}
        </div>
        {/* Caption */}
        <div style={{ minHeight: 60, padding: "12px 14px", background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 13, color: caption ? "var(--text-1)" : "var(--text-3)", lineHeight: 1.65 }}>
          {caption || "Your caption will appear here…"}
        </div>
        {/* Platforms */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {platforms.map((p) => (
            <span key={p} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: `${platformColors[p]}18`, color: platformColors[p] }}>{p}</span>
          ))}
        </div>
        {/* Schedule */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--surface-3)", borderRadius: 10, fontSize: 12, color: "var(--text-2)" }}>
          <ClockIcon size={14} />
          {mode === "now"      && "Publishing immediately"}
          {mode === "draft"    && "Saved as draft"}
          {mode === "schedule" && `${date} at ${time}`}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUEUE ROW
// ─────────────────────────────────────────────────────────────────────────────
function QueueRow({ post, deleting, onDelete, onStatusChange }: {
  post: Post;
  deleting: boolean;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const s = STATUS_MAP[post.status] ?? STATUS_MAP.draft;
  const platformColors: Record<string, string> = { Instagram: "#E1306C", TikTok: "#69C9D0", Facebook: "#1877F2" };
  const dateStr = post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString("en-NG", { month: "short", day: "numeric" }) : "—";
  const timeStr = post.scheduledAt ? new Date(post.scheduledAt).toTimeString().slice(0, 5) : "—";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", background: "var(--surface-2)", border: `1px solid ${hover ? "var(--border-hover)" : "var(--border)"}`, borderRadius: 14, transition: "border-color 0.15s" }}
    >
      {/* Thumbnail */}
      <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, background: "var(--surface-3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {post.mediaUrl
          ? <img src={post.mediaUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: 24 }}>{post.mediaEmoji ?? "📷"}</span>
        }
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 6 }}>
          {post.caption}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {post.platforms.map((p) => (
            <span key={p} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: `${platformColors[p] ?? "#888"}18`, color: platformColors[p] ?? "#888" }}>{p}</span>
          ))}
          <span style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
            <ClockIcon size={11} /> {dateStr} · {timeStr}
          </span>
        </div>
      </div>

      {/* Status select */}
      <select
        value={post.status}
        onChange={(e) => onStatusChange(e.target.value)}
        style={{ padding: "4px 10px", background: s.bg, border: `1px solid ${s.color}44`, borderRadius: 8, fontSize: 11, fontWeight: 700, color: s.color, cursor: "pointer", outline: "none", colorScheme: "dark", textTransform: "uppercase", letterSpacing: "0.04em" }}
      >
        <option value="draft">Draft</option>
        <option value="scheduled">Scheduled</option>
        <option value="published">Published</option>
      </select>

      {/* Delete */}
      <button
        onClick={onDelete}
        disabled={deleting}
        style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#e24b4a", cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.5 : 1 }}
      >
        {deleting ? <Spinner size={12} /> : <TrashIcon />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
function CheckIcon()                  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function CheckSmallIcon({ color }: { color: string }) { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function SparkleIcon()                { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l1.6 5H19l-4.1 3 1.5 5L12 12l-4.4 3 1.5-5L5 7h5.4z"/></svg>; }
function Spinner({ size = 14 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>; }
function SendIcon()                   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>; }
function DraftIcon()                  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>; }
function ClockIcon({ size = 14 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function PlusIcon()                   { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function TrashIcon()                  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }