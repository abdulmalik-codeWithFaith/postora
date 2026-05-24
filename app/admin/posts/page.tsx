"use client";

import { useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type Platform   = "Instagram" | "TikTok" | "Facebook";
type PostStatus = "published" | "scheduled" | "failed" | "draft";

interface Post {
  id: string;
  user: string;
  email: string;
  plan: "Starter" | "Pro" | "Elite";
  platform: Platform;
  status: PostStatus;
  caption: string;
  emoji: string;
  scheduledAt: string;
  publishedAt?: string;
  failReason?: string;
  reach?: number;
  likes?: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const POSTS: Post[] = [
  { id: "PST-001", user: "Amara Okafor",   email: "amara@brand.ng",       plan: "Pro",     platform: "Instagram", status: "published", emoji: "👟", caption: "Step into the season. Made for those who move with purpose 🔗", scheduledAt: "2026-05-23 10:00", publishedAt: "2026-05-23 10:00", reach: 4210, likes: 312 },
  { id: "PST-002", user: "Tunde Bello",    email: "tunde@shops.ng",       plan: "Elite",   platform: "TikTok",    status: "published", emoji: "👗", caption: "Your wardrobe called — it wants an upgrade 🔥",               scheduledAt: "2026-05-23 18:00", publishedAt: "2026-05-23 18:01", reach: 3840, likes: 287 },
  { id: "PST-003", user: "Kelechi Nwosu",  email: "kelechi@fashionng.co", plan: "Elite",   platform: "Facebook",  status: "published", emoji: "👜", caption: "New arrivals in store. Come see what just landed 🛍️",         scheduledAt: "2026-05-23 09:00", publishedAt: "2026-05-23 09:00", reach: 1840, likes: 87  },
  { id: "PST-004", user: "Ngozi Okonkwo",  email: "ngozi@ng.co",          plan: "Pro",     platform: "Instagram", status: "scheduled", emoji: "💛", caption: "Style is a way to say who you are without speaking 🌿",        scheduledAt: "2026-05-24 12:00" },
  { id: "PST-005", user: "Uche Obi",       email: "uche@store.ng",        plan: "Pro",     platform: "TikTok",    status: "scheduled", emoji: "📦", caption: "SHOP THIS before it sells out 🚨 Limited edition!",            scheduledAt: "2026-05-25 10:00" },
  { id: "PST-006", user: "Sade Ojo",       email: "sade@luxe.ng",         plan: "Elite",   platform: "Instagram", status: "scheduled", emoji: "⌚", caption: "Luxury doesn't have to be loud. Our new collection speaks volumes.", scheduledAt: "2026-05-26 11:00" },
  { id: "PST-007", user: "Femi Adeyemi",   email: "femi@market.ng",       plan: "Pro",     platform: "Facebook",  status: "failed",    emoji: "🧴", caption: "Introducing our new skincare line. Your skin deserves better.", scheduledAt: "2026-05-22 09:00", failReason: "Account disconnected" },
  { id: "PST-008", user: "Chioma Eze",     email: "chioma@style.ng",      plan: "Starter", platform: "Instagram", status: "failed",    emoji: "👡", caption: "Summer sandals are here. Walk into the season with confidence.", scheduledAt: "2026-05-21 10:00", failReason: "Rate limit exceeded" },
  { id: "PST-009", user: "Bisi Adeleke",   email: "bisi@boutique.ng",     plan: "Starter", platform: "Instagram", status: "draft",     emoji: "🌸", caption: "Summer edit is coming. Stay tuned 👀",                         scheduledAt: "—" },
  { id: "PST-010", user: "Adaeze Nnamdi",  email: "adaeze@beauty.ng",     plan: "Pro",     platform: "Instagram", status: "published", emoji: "🧴", caption: "Your skin glows differently with the right routine ✨",         scheduledAt: "2026-05-20 17:00", publishedAt: "2026-05-20 17:00", reach: 3120, likes: 241 },
  { id: "PST-011", user: "Yetunde Bakare", email: "yetunde@wear.ng",      plan: "Pro",     platform: "TikTok",    status: "published", emoji: "👗", caption: "Carry less, do more. New mini bag collection 👜",               scheduledAt: "2026-05-19 14:00", publishedAt: "2026-05-19 14:01", reach: 2980, likes: 198 },
  { id: "PST-012", user: "Chidi Okeke",    email: "chidi@media.ng",       plan: "Elite",   platform: "Instagram", status: "published", emoji: "📸", caption: "Lookbook drop: Spring/Summer 2026. Tap to shop the edit.",      scheduledAt: "2026-05-18 10:00", publishedAt: "2026-05-18 10:00", reach: 5640, likes: 421 },
  { id: "PST-013", user: "Emeka Chukwu",   email: "emeka@prints.ng",      plan: "Starter", platform: "Facebook",  status: "failed",    emoji: "🖼️", caption: "Fresh prints. Fresh styles. Shop our new collection today.",    scheduledAt: "2026-05-17 08:00", failReason: "Access token expired" },
  { id: "PST-014", user: "Rotimi Afolabi", email: "rotimi@craft.ng",      plan: "Starter", platform: "Instagram", status: "draft",     emoji: "🎨", caption: "Handcrafted with love. Every piece is unique.",                scheduledAt: "—" },
  { id: "PST-015", user: "Funmi Badmus",   email: "funmi@glow.ng",        plan: "Starter", platform: "Instagram", status: "scheduled", emoji: "✨", caption: "Free delivery on all orders this weekend 🎉 Don't miss out!",  scheduledAt: "2026-05-28 09:00" },
];

const PLATFORM_COLORS: Record<Platform, string> = {
  Instagram: "#E1306C",
  TikTok:    "#69C9D0",
  Facebook:  "#1877F2",
};

const PLAN_COLORS: Record<string, string> = {
  Starter: "#4e5768",
  Pro:     "#00C98D",
  Elite:   "#e24b4a",
};

const STATUS_MAP: Record<PostStatus, { bg: string; color: string; label: string }> = {
  published: { bg: "rgba(0,201,141,0.12)",   color: "#00C98D", label: "Published" },
  scheduled: { bg: "rgba(55,138,221,0.12)",  color: "#378ADD", label: "Scheduled" },
  failed:    { bg: "rgba(226,75,74,0.12)",   color: "#e24b4a", label: "Failed"    },
  draft:     { bg: "rgba(255,255,255,0.06)", color: "#4e5768", label: "Draft"     },
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPostsPage() {
  const [search, setSearch]             = useState("");
  const [platformFilter, setPlatform]   = useState<Platform | "all">("all");
  const [statusFilter, setStatus]       = useState<PostStatus | "all">("all");
  const [selected, setSelected]         = useState<string[]>([]);
  const [detailPost, setDetailPost]     = useState<Post | null>(null);
  const [page, setPage]                 = useState(1);
  const PER_PAGE = 10;

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = POSTS.filter((p) => {
    const matchSearch   = search === "" || p.user.toLowerCase().includes(search.toLowerCase()) || p.caption.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platformFilter === "all" || p.platform === platformFilter;
    const matchStatus   = statusFilter   === "all" || p.status   === statusFilter;
    return matchSearch && matchPlatform && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }
  function toggleAll() {
    const ids = paginated.map((p) => p.id);
    const allSel = ids.every((id) => selected.includes(id));
    setSelected(allSel ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])]);
  }
  const allOnPageSelected = paginated.length > 0 && paginated.every((p) => selected.includes(p.id));

  // ── Summary stats ─────────────────────────────────────────────────────────
  const stats = {
    total:     POSTS.length,
    published: POSTS.filter((p) => p.status === "published").length,
    scheduled: POSTS.filter((p) => p.status === "scheduled").length,
    failed:    POSTS.filter((p) => p.status === "failed").length,
    draft:     POSTS.filter((p) => p.status === "draft").length,
    totalReach: POSTS.reduce((acc, p) => acc + (p.reach ?? 0), 0),
  };

  // ── Platform breakdown ─────────────────────────────────────────────────────
  const platformBreakdown = (["Instagram","TikTok","Facebook"] as Platform[]).map((pl) => ({
    name:  pl,
    count: POSTS.filter((p) => p.platform === pl).length,
    pct:   Math.round((POSTS.filter((p) => p.platform === pl).length / POSTS.length) * 100),
  }));

  return (
    <>
      <AdminTopbar
        title="Posts Overview"
        subtitle={`${stats.total} total posts across all users`}
      />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{ gap: 12 }}>
          {[
            { label: "Total posts",  value: stats.total,                               color: "#f0f4ff" },
            { label: "Published",    value: stats.published,                           color: "#00C98D" },
            { label: "Scheduled",    value: stats.scheduled,                           color: "#378ADD" },
            { label: "Failed",       value: stats.failed,                              color: "#e24b4a" },
            { label: "Drafts",       value: stats.draft,                               color: "#4e5768" },
            { label: "Total reach",  value: `${(stats.totalReach / 1000).toFixed(1)}K`,color: "#f0f4ff" },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 13, padding: "14px 16px" }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>{s.label}</p>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Platform breakdown ───────────────────────────────────────────── */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "18px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 13, fontWeight: 700, color: "#f0f4ff" }}>Platform distribution</p>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
            {platformBreakdown.map((p) => (
              <div key={p.name}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: PLATFORM_COLORS[p.name] }} />
                    <span style={{ fontSize: 13, color: "#f0f4ff", fontWeight: 500 }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{p.count} posts · {p.pct}%</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p.pct}%`, background: PLATFORM_COLORS[p.name], borderRadius: 3, opacity: 0.85 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search by user, caption or ID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "9px 14px 9px 36px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, fontSize: 13, color: "#f0f4ff", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.target.style.borderColor = "#e24b4a")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
            />
          </div>

          {/* Platform filter */}
          <FilterPills
            options={["all","Instagram","TikTok","Facebook"]}
            value={platformFilter}
            onChange={(v) => { setPlatform(v as Platform | "all"); setPage(1); }}
            colors={PLATFORM_COLORS}
          />

          {/* Status filter */}
          <FilterPills
            options={["all","published","scheduled","failed","draft"]}
            value={statusFilter}
            onChange={(v) => { setStatus(v as PostStatus | "all"); setPage(1); }}
            colors={{ published: "#00C98D", scheduled: "#378ADD", failed: "#e24b4a", draft: "#4e5768" }}
          />

          {/* Bulk actions */}
          {selected.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{selected.length} selected</span>
              <button style={{ padding: "7px 14px", background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 9, fontSize: 12, color: "#e24b4a", cursor: "pointer" }}>
                Delete selected
              </button>
              <button onClick={() => setSelected([])} style={{ padding: "7px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, fontSize: 12, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>

          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "40px 60px 2fr 1.4fr 100px 90px 90px 140px 70px", padding: "11px 20px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Checkbox checked={allOnPageSelected} onChange={toggleAll} />
            </div>
            {[ "Caption", "User", "Platform", "Status", "Reach", "Scheduled"].map((z) => (
              <span key={z} style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{z}</span>
            ))}
          </div>

          {/* Rows */}
          {paginated.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "rgba(255,255,255,0.2)" }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>📤</p>
              <p>No posts found</p>
            </div>
          ) : (
            paginated.map((post, i) => {
              const s = STATUS_MAP[post.status];
              return (
                <div
                  key={post.id}
                  style={{
                    display: "grid", gridTemplateColumns: "40px 60px 2fr 1.4fr 100px 90px 90px 140px 70px",
                    padding: "13px 20px",
                    borderBottom: i < paginated.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    alignItems: "center", gap: 12,
                    background: selected.includes(post.id) ? "rgba(226,75,74,0.03)" : "transparent",
                    transition: "background 0.15s", cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { if (!selected.includes(post.id)) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"; }}
                  onMouseLeave={(e) => { if (!selected.includes(post.id)) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  {/* Checkbox */}
                  <div onClick={(e) => { e.stopPropagation(); toggleSelect(post.id); }} style={{ display: "flex", alignItems: "center" }}>
                    <Checkbox checked={selected.includes(post.id)} onChange={() => toggleSelect(post.id)} />
                  </div>

                  {/* Thumbnail */}
                  <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                    {post.emoji}
                  </div>

                  {/* Caption */}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#f0f4ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 }}>
                      {post.caption}
                    </p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>{post.id}</p>
                  </div>

                  {/* User */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: `${PLAN_COLORS[post.plan]}22`, border: `1px solid ${PLAN_COLORS[post.plan]}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: PLAN_COLORS[post.plan] }}>
                      {post.user.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, color: "#f0f4ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.user}</p>
                      <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 999, background: `${PLAN_COLORS[post.plan]}18`, color: PLAN_COLORS[post.plan] }}>{post.plan}</span>
                    </div>
                  </div>

                  {/* Platform */}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: `${PLATFORM_COLORS[post.platform]}18`, color: PLATFORM_COLORS[post.platform], width: "fit-content" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: PLATFORM_COLORS[post.platform] }} />
                    {post.platform}
                  </span>

                  {/* Status */}
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: s.bg, color: s.color, textTransform: "uppercase", letterSpacing: "0.05em", width: "fit-content" }}>
                    {s.label}
                  </span>

                  {/* Reach */}
                  <p style={{ fontSize: 13, fontWeight: 600, color: post.reach ? "#f0f4ff" : "rgba(255,255,255,0.2)" }}>
                    {post.reach ? post.reach.toLocaleString() : "—"}
                  </p>

                  {/* Scheduled */}
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
                    {post.scheduledAt}
                  </p>

                  {/* View */}
                  <button
                    onClick={() => setDetailPost(post)}
                    style={{ padding: "5px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)"; (e.currentTarget as HTMLButtonElement).style.color = "#f0f4ff"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; }}
                  >
                    View
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} posts
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <PageBtn disabled={page === 1} onClick={() => setPage(page - 1)}>←</PageBtn>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PageBtn key={i} active={page === i + 1} onClick={() => setPage(i + 1)}>{i + 1}</PageBtn>
            ))}
            <PageBtn disabled={page === totalPages} onClick={() => setPage(page + 1)}>→</PageBtn>
          </div>
        </div>

      </main>

      {/* ── Post detail modal ─────────────────────────────────────────────── */}
      {detailPost && (
        <PostDetailModal post={detailPost} onClose={() => setDetailPost(null)} />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POST DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
function PostDetailModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const s = STATUS_MAP[post.status];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(6px)" }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#0f1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 22, width: "100%", maxWidth: 480, overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{post.emoji}</div>
            <div>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>{post.user}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{post.id}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Caption */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "13px 16px", fontSize: 14, color: "#f0f4ff", lineHeight: 1.7 }}>
            {post.caption}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2" style={{ gap: 10 }}>
            {[
              { label: "Platform",   value: post.platform,      color: PLATFORM_COLORS[post.platform] },
              { label: "Status",     value: s.label,            color: s.color },
              { label: "Plan",       value: post.plan,          color: PLAN_COLORS[post.plan] },
              { label: "Scheduled",  value: post.scheduledAt,   color: "rgba(255,255,255,0.5)" },
              { label: "Reach",      value: post.reach ? post.reach.toLocaleString() : "—", color: "#f0f4ff" },
              { label: "Likes",      value: post.likes ? post.likes.toLocaleString() : "—", color: "#f0f4ff" },
            ].map((m) => (
              <div key={m.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>{m.label}</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Fail reason */}
          {post.status === "failed" && post.failReason && (
            <div style={{ padding: "12px 14px", background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e24b4a" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#e24b4a", marginBottom: 2 }}>Failure reason</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{post.failReason}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {post.status === "failed" && (
              <button style={{ flex: 1, padding: "10px", background: "#00C98D", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#0a0e14", cursor: "pointer" }}>
                Retry post
              </button>
            )}
            <button style={{ flex: 1, padding: "10px", background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "#e24b4a", cursor: "pointer" }}>
              Delete post
            </button>
            <button onClick={onClose} style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, fontSize: 13, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function FilterPills({ options, value, onChange, colors = {} }: { options: string[]; value: string; onChange: (v: string) => void; colors?: Record<string, string> }) {
  return (
    <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map((opt) => {
        const active = value === opt;
        const color  = colors[opt];
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500, background: active ? (color ? `${color}22` : "rgba(255,255,255,0.08)") : "transparent", color: active ? (color ?? "#f0f4ff") : "rgba(255,255,255,0.35)", textTransform: "capitalize", transition: "all 0.15s" }}>
            {opt === "all" ? "All" : opt}
          </button>
        );
      })}
    </div>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, background: checked ? "#e24b4a" : "rgba(255,255,255,0.05)", border: `1px solid ${checked ? "#e24b4a" : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}>
      {checked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "none", background: active ? "#e24b4a" : "rgba(255,255,255,0.04)", color: active ? "#fff" : disabled ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: active ? 600 : 400, cursor: disabled ? "not-allowed" : "pointer", transition: "background 0.15s" }}>
      {children}
    </button>
  );
}