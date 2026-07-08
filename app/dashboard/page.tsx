"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/dashboard/Topbar";
import { useAuth } from "@/context/AuthContext";
import { getDashboardStats, getRecentUserPosts, getScheduledPosts } from "@/lib/firestore";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { DashboardStats, Post } from "@/types";

// ─── Platform colors ──────────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "#E1306C",
  TikTok:    "#69C9D0",
  Facebook:  "#1877F2",
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [stats,     setStats]     = useState<DashboardStats | null>(null);
  const [posts,     setPosts]     = useState<Post[]>([]);
  const [scheduled, setScheduled] = useState<Post[]>([]);
  const [fetching,  setFetching]  = useState(true);

  // ── Redirect if not authenticated ────────────────────────────────────────
  // Note: /dashboard/layout.tsx already wraps this route in <AuthGuard>, which
  // redirects unauthenticated users to /login. This effect is a second,
  // redundant redirect path — kept for now since removing it safely requires
  // confirming AuthGuard's exact loading/redirect timing first.
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  // ── Load real data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !profile) return;

    async function load() {
      try {
        const [s, p, sc] = await Promise.all([
          getDashboardStats(user!.uid, profile!.plan),
          getRecentUserPosts(user!.uid, 4),
          getScheduledPosts(user!.uid),
        ]);
        setStats(s);
        setPosts(p);
        setScheduled(sc.slice(0, 5));
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setFetching(false);
      }
    }

    load();
  }, [user, profile]);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading || fetching) {
    return (
      <>
        <Topbar title="Dashboard" subtitle="Loading…" />
        <main style={{ padding: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {[1,2,3,4].map((i) => (
              <div key={i} style={{ height: 100, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, animation: "pulse 1.4s ease-in-out infinite" }} />
            ))}
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </main>
      </>
    );
  }

  const firstName = profile?.name?.split(" ")[0] ?? "there";

  // ── Plan limits display ──────────────────────────────────────────────────
  const postsLimit = stats?.postsLimit === "Unlimited" ? "∞" : stats?.postsLimit;
  const aiLimit    = stats?.aiCaptionsLimit === "Unlimited" ? "∞" : stats?.aiCaptionsLimit;

  const STAT_CARDS = [
    {
      label:  "Posts published",
      value:  stats?.postsPublished ?? 0,
      change: `${postsLimit} limit on ${profile?.plan}`,
      up:     true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      ),
    },
    {
      label:  "Posts scheduled",
      value:  stats?.postsScheduled ?? 0,
      change: scheduled.length > 0 ? `Next: ${formatDate(scheduled[0]?.scheduledAt)}` : "None upcoming",
      up:     true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      ),
    },
    {
      label:  "Media files",
      value:  stats?.mediaCount ?? 0,
      change: "In your library",
      up:     true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      ),
    },
    {
      label:  "AI captions used",
      value:  stats?.aiCaptionsUsed ?? 0,
      change: `${aiLimit} limit on ${profile?.plan}`,
      up:     false,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l1.6 5H19l-4.1 3 1.5 5L12 12l-4.4 3 1.5-5L5 7h5.4z"/></svg>
      ),
    },
  ];

  // ── Quick actions — matches the real 6-page nav ─────────────────────────
  // "Schedule a post" and "Generate captions" used to point at standalone
  // /dashboard/schedule and /dashboard/captions pages that were removed from
  // the nav; both concerns now live inside the Calendar campaign flow.
  const QUICK_ACTIONS = [
    { href: "/dashboard/media",    emoji: "📤", label: "Upload media",       desc: "Add photos or videos" },
    { href: "/dashboard/calendar", emoji: "✨", label: "Create campaign",    desc: "Generate this month's posts" },
    { href: "/dashboard/accounts", emoji: "🔗", label: "Connected accounts", desc: "Manage social platforms" },
    { href: "/dashboard/reports",  emoji: "📊", label: "View reports",      desc: "See performance to date" },
  ];

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle={`Good ${getGreeting()}, ${firstName} 👋`}
      />

      <main style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 16 }}>
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: 16, padding: "20px",
                display: "flex", flexDirection: "column", gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>{s.label}</p>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--green-muted)", border: "1px solid rgba(0,201,141,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}>
                  {s.icon}
                </div>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 30, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: 11, color: s.up ? "var(--green)" : "var(--text-3)", marginTop: 5 }}>
                  {s.change}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Middle row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 20 }}>

          {/* Recent posts */}
          <div style={{ gridColumn: "span 2", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Recent posts</h2>
              <Link href="/dashboard/calendar" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none" }}>View all →</Link>
            </div>

            {posts.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>📭</p>
                <p style={{ fontSize: 14, color: "var(--text-2)" }}>No posts yet</p>
                <Link href="/dashboard/calendar" style={{ fontSize: 13, color: "var(--green)", textDecoration: "none", display: "block", marginTop: 8 }}>
                  Create your first post →
                </Link>
              </div>
            ) : (
              posts.map((post, i) => (
                <div
                  key={post.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 20px",
                    borderBottom: i < posts.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background 0.15s", cursor: "pointer",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--surface-3)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
                >
                  {/* Thumbnail */}
                  <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: "var(--surface-3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {post.mediaUrl ? (
                      <img src={post.mediaUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 20 }}>{post.mediaEmoji ?? "📷"}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>
                      {post.caption}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {post.platforms.map((p) => (
                        <PlatformPill key={p} name={p} />
                      ))}
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                        {formatDate(post.scheduledAt ?? post.publishedAt)}
                      </span>
                    </div>
                  </div>

                  <StatusBadge status={post.status} />
                </div>
              ))
            )}
          </div>

          {/* Upcoming + this week */}
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Upcoming</h2>
              <Link href="/dashboard/calendar" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none" }}>Calendar →</Link>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {scheduled.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <p style={{ fontSize: 22, marginBottom: 8 }}>📅</p>
                  <p style={{ fontSize: 13, color: "var(--text-3)" }}>No scheduled posts</p>
                  <Link href="/dashboard/calendar" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", display: "block", marginTop: 6 }}>
                    + Schedule a post
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {scheduled.map((p) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, color: "var(--text-1)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.caption?.slice(0, 38)}…
                        </p>
                        <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 1 }}>{formatDate(p.scheduledAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Quick actions ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "16px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 14, textDecoration: "none",
                transition: "border-color 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-hover)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLAnchorElement).style.transform = "none";
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

        {/* ── Plan + sign out ───────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>
              You're on the <strong style={{ color: "var(--green)" }}>{profile?.plan}</strong> plan
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/dashboard/settings?tab=billing" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", padding: "6px 14px", border: "1px solid rgba(0,201,141,0.3)", borderRadius: 8 }}>
              Upgrade plan
            </Link>
            <button
              onClick={handleSignOut}
              style={{ fontSize: 12, color: "var(--text-3)", background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}
            >
              Sign out
            </button>
          </div>
        </div>

      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    published: { bg: "rgba(0,201,141,0.1)",   color: "var(--green)",  label: "Published" },
    scheduled: { bg: "rgba(55,138,221,0.1)",  color: "#378ADD",       label: "Scheduled" },
    draft:     { bg: "rgba(255,255,255,0.06)", color: "var(--text-3)", label: "Draft"     },
    failed:    { bg: "rgba(226,75,74,0.1)",   color: "#e24b4a",       label: "Failed"    },
  };
  const s = map[status] ?? map.draft;
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: s.bg, color: s.color, whiteSpace: "nowrap", flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {s.label}
    </span>
  );
}

function PlatformPill({ name }: { name: string }) {
  const color = PLATFORM_COLORS[name] ?? "#888";
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: `${color}18`, color }}>
      {name}
    </span>
  );
}