"use client";

import { useState, useEffect, useMemo } from "react";
import Topbar from "@/components/dashboard/Topbar";
import { useAuth } from "@/context/AuthContext";
import { getUserPosts, getDashboardStats } from "@/lib/firestore";
import { Post, DashboardStats } from "@/types";

// ─── Config ───────────────────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "#E1306C",
  TikTok:    "#69C9D0",
  Facebook:  "#1877F2",
};

const STATUS_COLORS: Record<string, string> = {
  published: "#00C98D",
  scheduled: "#378ADD",
  draft:     "#4e5768",
  failed:    "#e24b4a",
};

type RangeOption = "30" | "month" | "all";

const RANGE_LABELS: Record<RangeOption, string> = {
  "30":    "Last 30 days",
  "month": "This month",
  "all":   "All time",
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { user, profile } = useAuth();

  const [posts,   setPosts]   = useState<Post[]>([]);
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range,   setRange]   = useState<RangeOption>("30");

  useEffect(() => {
    if (!user || !profile) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [p, s] = await Promise.all([
          getUserPosts(user!.uid),
          getDashboardStats(user!.uid, profile!.plan),
        ]);
        if (!cancelled) {
          setPosts(p);
          setStats(s);
        }
      } catch (err) {
        console.error("Failed to load report data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user, profile]);

  // ── Filter posts to the selected range ────────────────────────────────────
  const filteredPosts = useMemo(() => {
    if (range === "all") return posts;

    const now = new Date();
    const cutoff = new Date();
    if (range === "30") {
      cutoff.setDate(now.getDate() - 30);
    } else {
      cutoff.setDate(1);
      cutoff.setHours(0, 0, 0, 0);
    }

    return posts.filter((p) => {
      const iso = p.publishedAt ?? p.scheduledAt ?? p.createdAt;
      if (!iso) return false;
      return new Date(iso) >= cutoff;
    });
  }, [posts, range]);

  // ── Core aggregates ────────────────────────────────────────────────────────
  const published = filteredPosts.filter((p) => p.status === "published");
  const totalReach = published.reduce((sum, p) => sum + (p.reach ?? 0), 0);
  const avgReach = published.length > 0 ? Math.round(totalReach / published.length) : 0;
  const scheduledCount = filteredPosts.filter((p) => p.status === "scheduled").length;

  // ── Platform breakdown ─────────────────────────────────────────────────────
  const platformCounts: Record<string, { count: number; reach: number }> = {};
  filteredPosts.forEach((p) => {
    p.platforms.forEach((plat) => {
      if (!platformCounts[plat]) platformCounts[plat] = { count: 0, reach: 0 };
      platformCounts[plat].count += 1;
      if (p.status === "published") platformCounts[plat].reach += p.reach ?? 0;
    });
  });
  const maxPlatformCount = Math.max(1, ...Object.values(platformCounts).map((v) => v.count));

  // ── Status breakdown ───────────────────────────────────────────────────────
  const statusCounts: Record<string, number> = {};
  filteredPosts.forEach((p) => {
    statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1;
  });
  const maxStatusCount = Math.max(1, ...Object.values(statusCounts));

  // ── 14-day activity chart (posts published/scheduled per day) ─────────────
  const dayBuckets = useMemo(() => {
    const days: { label: string; date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({ label: d.toLocaleDateString("en-US", { weekday: "short" })[0], date: dateStr, count: 0 });
    }
    posts.forEach((p) => {
      const iso = p.publishedAt ?? p.scheduledAt ?? p.createdAt;
      if (!iso) return;
      const dateStr = iso.slice(0, 10);
      const bucket = days.find((d) => d.date === dateStr);
      if (bucket) bucket.count += 1;
    });
    return days;
  }, [posts]);
  const maxDayCount = Math.max(1, ...dayBuckets.map((d) => d.count));

  // ── Top performing posts ───────────────────────────────────────────────────
  const topPosts = [...published]
    .sort((a, b) => (b.reach ?? 0) - (a.reach ?? 0))
    .slice(0, 5);

  const postsLimitDisplay = stats?.postsLimit === "Unlimited" ? "∞" : stats?.postsLimit ?? "—";
  const aiLimitDisplay    = stats?.aiCaptionsLimit === "Unlimited" ? "∞" : stats?.aiCaptionsLimit ?? "—";

  return (
    <>
      <Topbar title="Reports" subtitle="How your content is performing" />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Range filter ─────────────────────────────────────────────────── */}
        <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 3, gap: 2, width: "fit-content" }}>
          {(Object.keys(RANGE_LABELS) as RangeOption[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{ padding: "7px 16px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", background: range === r ? "var(--surface-4)" : "transparent", color: range === r ? "var(--text-1)" : "var(--text-3)", transition: "background 0.15s, color 0.15s" }}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 16 }}>
          {[
            { label: "Posts published", value: loading ? "—" : published.length,                          color: "var(--text-1)" },
            { label: "Total reach",     value: loading ? "—" : totalReach.toLocaleString(),                color: "var(--green)"  },
            { label: "Avg reach/post",  value: loading ? "—" : avgReach.toLocaleString(),                  color: "var(--text-1)" },
            { label: "Scheduled",       value: loading ? "—" : scheduledCount,                             color: "#378ADD"       },
          ].map((s) => (
            <div key={s.label} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: "18px 20px" }}>
              <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500, marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 20, alignItems: "start" }}>

          {/* ── Activity chart (2/3) ──────────────────────────────────────── */}
          <div style={{ gridColumn: "span 2", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px" }}>
            <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>Activity, last 14 days</p>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 20 }}>Posts scheduled or published each day</p>

            {loading ? (
              <div style={{ height: 140, background: "var(--surface-3)", borderRadius: 10, animation: "pulse 1.4s ease-in-out infinite" }} />
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140 }}>
                {dayBuckets.map((d) => (
                  <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                    <div
                      title={`${d.count} post${d.count !== 1 ? "s" : ""} on ${d.date}`}
                      style={{
                        width: "100%", maxWidth: 22,
                        height: `${Math.max(4, (d.count / maxDayCount) * 100)}%`,
                        background: d.count > 0 ? "var(--green)" : "var(--surface-4)",
                        borderRadius: 4,
                        transition: "height 0.2s",
                      }}
                    />
                    <span style={{ fontSize: 9, color: "var(--text-3)" }}>{d.label}</span>
                  </div>
                ))}
              </div>
            )}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
          </div>

          {/* ── Plan usage (1/3) ─────────────────────────────────────────── */}
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 2 }}>Plan usage</p>
              <p style={{ fontSize: 12, color: "var(--text-3)" }}>You're on the <strong style={{ color: "var(--green)" }}>{profile?.plan ?? "—"}</strong> plan</p>
            </div>

            <UsageBar label="Posts" used={stats?.postsPublished ?? 0} limit={stats?.postsLimit} limitDisplay={postsLimitDisplay} />
            <UsageBar label="AI captions" used={stats?.aiCaptionsUsed ?? 0} limit={stats?.aiCaptionsLimit} limitDisplay={aiLimitDisplay} />

            <a href="/dashboard/settings?tab=billing" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", fontWeight: 600 }}>
              Manage plan →
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20, alignItems: "start" }}>

          {/* ── Platform breakdown ───────────────────────────────────────── */}
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px" }}>
            <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 16 }}>By platform</p>

            {loading ? (
              <SkeletonRows />
            ) : Object.keys(platformCounts).length === 0 ? (
              <EmptyNote text="No posts in this range yet." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {Object.entries(platformCounts).map(([platform, data]) => (
                  <div key={platform}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: PLATFORM_COLORS[platform] ?? "var(--text-1)" }}>{platform}</span>
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>{data.count} posts · {data.reach.toLocaleString()} reach</span>
                    </div>
                    <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(data.count / maxPlatformCount) * 100}%`, background: PLATFORM_COLORS[platform] ?? "var(--green)", borderRadius: 4, transition: "width 0.2s" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Status breakdown ─────────────────────────────────────────── */}
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px" }}>
            <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 16 }}>By status</p>

            {loading ? (
              <SkeletonRows />
            ) : Object.keys(statusCounts).length === 0 ? (
              <EmptyNote text="No posts in this range yet." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLORS[status] ?? "var(--text-1)", textTransform: "capitalize" }}>{status}</span>
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>{count}</span>
                    </div>
                    <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(count / maxStatusCount) * 100}%`, background: STATUS_COLORS[status] ?? "var(--green)", borderRadius: 4, transition: "width 0.2s" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Top performing posts ───────────────────────────────────────── */}
        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Top performing posts</p>
            <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Ranked by reach, this range</p>
          </div>

          {loading ? (
            <div style={{ padding: 20 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 56, background: "var(--surface-3)", borderRadius: 10, marginBottom: 10, animation: "pulse 1.4s ease-in-out infinite" }} />
              ))}
            </div>
          ) : topPosts.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 26, marginBottom: 8 }}>📊</p>
              <p style={{ fontSize: 13, color: "var(--text-3)" }}>No published posts with reach data yet</p>
            </div>
          ) : (
            topPosts.map((post, i) => (
              <div
                key={post.id}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderBottom: i < topPosts.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", width: 18, flexShrink: 0 }}>{i + 1}</span>

                <div style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0, background: "var(--surface-3)", border: "1px solid var(--border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {post.mediaUrl ? (
                    <img src={post.mediaUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 18 }}>{post.mediaEmoji ?? "📷"}</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 }}>
                    {post.caption}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {post.platforms.map((p) => (
                      <span key={p} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: `${PLATFORM_COLORS[p] ?? "#888"}18`, color: PLATFORM_COLORS[p] ?? "#888" }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 15, fontWeight: 700, color: "var(--green)" }}>
                    {(post.reach ?? 0).toLocaleString()}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--text-3)" }}>reach</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function UsageBar({
  label, used, limit, limitDisplay,
}: {
  label: string;
  used: number;
  limit: number | "Unlimited" | undefined;
  limitDisplay: string | number;
}) {
  const pct = typeof limit === "number" && limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const isUnlimited = limit === "Unlimited";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--text-2)" }}>{label}</span>
        <span style={{ fontSize: 12, color: "var(--text-3)" }}>{used} / {limitDisplay}</span>
      </div>
      {!isUnlimited && (
        <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: pct >= 90 ? "#e24b4a" : "var(--green)", borderRadius: 4, transition: "width 0.2s" }} />
        </div>
      )}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ height: 24, background: "var(--surface-3)", borderRadius: 6, animation: "pulse 1.4s ease-in-out infinite" }} />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div style={{ padding: "20px 0", textAlign: "center" }}>
      <p style={{ fontSize: 12, color: "var(--text-3)" }}>{text}</p>
    </div>
  );
}