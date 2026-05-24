"use client";

import { useState } from "react";
import Link from "next/link";
import AdminTopbar from "@/components/admin/AdminTopbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type Plan    = "Starter" | "Pro" | "Elite";
type Status  = "active" | "suspended" | "pending";
type SortKey = "joined" | "name" | "plan" | "posts";

interface User {
  id: number;
  name: string;
  email: string;
  plan: Plan;
  status: Status;
  joined: string;
  posts: number;
  platforms: number;
  lastActive: string;
  country: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const USERS: User[] = [
  { id: 1,  name: "Amara Okafor",    email: "amara@brand.ng",      plan: "Pro",     status: "active",    joined: "2026-05-23", posts: 24,  platforms: 2, lastActive: "2 min ago",   country: "NG" },
  { id: 2,  name: "Tunde Bello",     email: "tunde@shops.ng",      plan: "Elite",   status: "active",    joined: "2026-05-22", posts: 61,  platforms: 4, lastActive: "1 hour ago",  country: "NG" },
  { id: 3,  name: "Chioma Eze",      email: "chioma@style.ng",     plan: "Starter", status: "active",    joined: "2026-05-22", posts: 8,   platforms: 1, lastActive: "3 hours ago", country: "NG" },
  { id: 4,  name: "Femi Adeyemi",    email: "femi@market.ng",      plan: "Pro",     status: "suspended", joined: "2026-05-21", posts: 17,  platforms: 2, lastActive: "2 days ago",  country: "NG" },
  { id: 5,  name: "Ngozi Okonkwo",   email: "ngozi@ng.co",         plan: "Pro",     status: "active",    joined: "2026-05-20", posts: 32,  platforms: 3, lastActive: "5 hours ago", country: "NG" },
  { id: 6,  name: "Kelechi Nwosu",   email: "kelechi@fashionng.co",plan: "Elite",   status: "active",    joined: "2026-05-18", posts: 88,  platforms: 4, lastActive: "30 min ago",  country: "NG" },
  { id: 7,  name: "Bisi Adeleke",    email: "bisi@boutique.ng",    plan: "Starter", status: "pending",   joined: "2026-05-17", posts: 2,   platforms: 1, lastActive: "1 day ago",   country: "NG" },
  { id: 8,  name: "Uche Obi",        email: "uche@store.ng",       plan: "Pro",     status: "active",    joined: "2026-05-15", posts: 44,  platforms: 3, lastActive: "10 min ago",  country: "NG" },
  { id: 9,  name: "Adaeze Nnamdi",   email: "adaeze@beauty.ng",    plan: "Pro",     status: "active",    joined: "2026-05-14", posts: 29,  platforms: 2, lastActive: "1 hour ago",  country: "NG" },
  { id: 10, name: "Emeka Chukwu",    email: "emeka@prints.ng",     plan: "Starter", status: "active",    joined: "2026-05-12", posts: 6,   platforms: 1, lastActive: "4 hours ago", country: "NG" },
  { id: 11, name: "Sade Ojo",        email: "sade@luxe.ng",        plan: "Elite",   status: "active",    joined: "2026-05-10", posts: 112, platforms: 4, lastActive: "20 min ago",  country: "NG" },
  { id: 12, name: "Rotimi Afolabi",  email: "rotimi@craft.ng",     plan: "Starter", status: "suspended", joined: "2026-05-08", posts: 3,   platforms: 1, lastActive: "5 days ago",  country: "NG" },
  { id: 13, name: "Yetunde Bakare",  email: "yetunde@wear.ng",     plan: "Pro",     status: "active",    joined: "2026-05-06", posts: 38,  platforms: 3, lastActive: "2 hours ago", country: "NG" },
  { id: 14, name: "Chidi Okeke",     email: "chidi@media.ng",      plan: "Elite",   status: "active",    joined: "2026-05-04", posts: 76,  platforms: 4, lastActive: "45 min ago",  country: "NG" },
  { id: 15, name: "Funmi Badmus",    email: "funmi@glow.ng",       plan: "Starter", status: "pending",   joined: "2026-05-01", posts: 0,   platforms: 0, lastActive: "3 days ago",  country: "NG" },
];

const PLAN_COLORS: Record<Plan, string> = {
  Starter: "#4e5768",
  Pro:     "#00C98D",
  Elite:   "#e24b4a",
};

const STATUS_MAP: Record<Status, { bg: string; color: string; label: string }> = {
  active:    { bg: "rgba(0,201,141,0.12)",  color: "#00C98D", label: "Active"    },
  suspended: { bg: "rgba(226,75,74,0.12)",  color: "#e24b4a", label: "Suspended" },
  pending:   { bg: "rgba(239,159,39,0.12)", color: "#ef9f27", label: "Pending"   },
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [search, setSearch]           = useState("");
  const [planFilter, setPlanFilter]   = useState<Plan | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [sortKey, setSortKey]         = useState<SortKey>("joined");
  const [sortAsc, setSortAsc]         = useState(false);
  const [selected, setSelected]       = useState<number[]>([]);
  const [bulkAction, setBulkAction]   = useState("");
  const [page, setPage]               = useState(1);
  const PER_PAGE = 10;

  // ── Filter + sort ────────────────────────────────────────────────────────────
  const filtered = USERS
    .filter((u) => {
      const matchSearch = search === "" ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchPlan   = planFilter === "all" || u.plan === planFilter;
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchPlan && matchStatus;
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortKey === "name")   diff = a.name.localeCompare(b.name);
      if (sortKey === "joined") diff = a.joined.localeCompare(b.joined);
      if (sortKey === "plan")   diff = a.plan.localeCompare(b.plan);
      if (sortKey === "posts")  diff = a.posts - b.posts;
      return sortAsc ? diff : -diff;
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
    setPage(1);
  }

  function toggleSelect(id: number) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function toggleAll() {
    const pageIds = paginated.map((u) => u.id);
    const allSelected = pageIds.every((id) => selected.includes(id));
    setSelected(allSelected ? selected.filter((id) => !pageIds.includes(id)) : [...new Set([...selected, ...pageIds])]);
  }

  const allOnPageSelected = paginated.length > 0 && paginated.every((u) => selected.includes(u.id));

  // ── Summary stats ────────────────────────────────────────────────────────────
  const stats = {
    total:     USERS.length,
    active:    USERS.filter((u) => u.status === "active").length,
    suspended: USERS.filter((u) => u.status === "suspended").length,
    pending:   USERS.filter((u) => u.status === "pending").length,
    starter:   USERS.filter((u) => u.plan === "Starter").length,
    pro:       USERS.filter((u) => u.plan === "Pro").length,
    elite:     USERS.filter((u) => u.plan === "Elite").length,
  };

  return (
    <>
      <AdminTopbar
        title="Users"
        subtitle={`${stats.total} registered users`}
        action={
          <button
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px",
              background: "#e24b4a", border: "none", borderRadius: 9,
              fontSize: 12, fontWeight: 600, color: "#fff", cursor: "pointer",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add user
          </button>
        }
      />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7" style={{ gap: 10 }}>
          {[
            { label: "Total",     value: stats.total,     color: "#f0f4ff" },
            { label: "Active",    value: stats.active,    color: "#00C98D" },
            { label: "Suspended", value: stats.suspended, color: "#e24b4a" },
            { label: "Pending",   value: stats.pending,   color: "#ef9f27" },
            { label: "Starter",   value: stats.starter,   color: "#4e5768" },
            { label: "Pro",       value: stats.pro,       color: "#00C98D" },
            { label: "Elite",     value: stats.elite,     color: "#e24b4a" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: "12px 16px",
              }}
            >
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>
                {s.value}
              </p>
            </div>
          ))}
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
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: "100%", padding: "9px 14px 9px 36px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 10, fontSize: 13, color: "#f0f4ff",
                outline: "none", fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#e24b4a")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
            />
          </div>

          {/* Plan filter */}
          <FilterPills
            options={["all", "Starter", "Pro", "Elite"]}
            value={planFilter}
            onChange={(v) => { setPlanFilter(v as Plan | "all"); setPage(1); }}
            colors={{ Starter: "#4e5768", Pro: "#00C98D", Elite: "#e24b4a" }}
          />

          {/* Status filter */}
          <FilterPills
            options={["all", "active", "suspended", "pending"]}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v as Status | "all"); setPage(1); }}
            colors={{ active: "#00C98D", suspended: "#e24b4a", pending: "#ef9f27" }}
          />

          {/* Bulk action */}
          {selected.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{selected.length} selected</span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                style={{ padding: "7px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, fontSize: 12, color: "#f0f4ff", outline: "none", colorScheme: "dark", cursor: "pointer" }}
              >
                <option value="">Bulk action…</option>
                <option value="suspend">Suspend</option>
                <option value="activate">Activate</option>
                <option value="delete">Delete</option>
                <option value="export">Export</option>
              </select>
              <button
                style={{ padding: "7px 14px", background: "#e24b4a", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 600, color: "#fff", cursor: "pointer" }}
              >
                Apply
              </button>
              <button
                onClick={() => setSelected([])}
                style={{ padding: "7px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, fontSize: 12, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "44px 2fr 1.2fr 1fr 1fr 80px 80px 120px",
              padding: "11px 20px",
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              gap: 12,
            }}
          >
            {/* Select all */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <Checkbox checked={allOnPageSelected} onChange={toggleAll} />
            </div>

            {[
              { label: "User",     key: "name"   as SortKey },
              { label: "Email",    key: null },
              { label: "Plan",     key: "plan"   as SortKey },
              { label: "Posts",    key: "posts"  as SortKey },
              { label: "Status",   key: null },
              { label: "Platforms",key: null },
              { label: "Joined",   key: "joined" as SortKey },
            ].map((col) => (
              <div
                key={col.label}
                onClick={() => col.key && toggleSort(col.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  fontSize: 10, fontWeight: 600,
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase", letterSpacing: "0.07em",
                  cursor: col.key ? "pointer" : "default",
                  userSelect: "none",
                }}
              >
                {col.label}
                {col.key && sortKey === col.key && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points={sortAsc ? "6 9 12 15 18 9" : "18 15 12 9 6 15"}/>
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Rows */}
          {paginated.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "rgba(255,255,255,0.2)" }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>👥</p>
              <p>No users found</p>
            </div>
          ) : (
            paginated.map((user, i) => (
              <div
                key={user.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 2fr 1.2fr 1fr 1fr 80px 80px 120px",
                  padding: "13px 20px",
                  borderBottom: i < paginated.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  alignItems: "center", gap: 12,
                  background: selected.includes(user.id) ? "rgba(226,75,74,0.04)" : "transparent",
                  transition: "background 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!selected.includes(user.id))
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)";
                }}
                onMouseLeave={(e) => {
                  if (!selected.includes(user.id))
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                {/* Checkbox */}
                <div onClick={(e) => { e.stopPropagation(); toggleSelect(user.id); }} style={{ display: "flex", alignItems: "center" }}>
                  <Checkbox checked={selected.includes(user.id)} onChange={() => toggleSelect(user.id)} />
                </div>

                {/* User */}
                <Link href={`/admin/users/${user.id}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                  <div
                    style={{
                      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                      background: `linear-gradient(135deg, ${PLAN_COLORS[user.plan]}44, ${PLAN_COLORS[user.plan]}22)`,
                      border: `1px solid ${PLAN_COLORS[user.plan]}33`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: PLAN_COLORS[user.plan],
                    }}
                  >
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#f0f4ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.name}
                    </p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>
                      {user.lastActive}
                    </p>
                  </div>
                </Link>

                {/* Email */}
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.email}
                </p>

                {/* Plan */}
                <span
                  style={{
                    fontSize: 10, fontWeight: 700,
                    padding: "3px 10px", borderRadius: 999,
                    background: `${PLAN_COLORS[user.plan]}18`,
                    color: PLAN_COLORS[user.plan],
                    border: `1px solid ${PLAN_COLORS[user.plan]}33`,
                    width: "fit-content",
                    letterSpacing: "0.04em",
                  }}
                >
                  {user.plan}
                </span>

                {/* Posts */}
                <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>{user.posts}</p>

                {/* Status */}
                <span
                  style={{
                    fontSize: 9, fontWeight: 700,
                    padding: "3px 8px", borderRadius: 999,
                    background: STATUS_MAP[user.status].bg,
                    color: STATUS_MAP[user.status].color,
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    width: "fit-content",
                  }}
                >
                  {STATUS_MAP[user.status].label}
                </span>

                {/* Platforms */}
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{user.platforms}</p>

                {/* Joined + actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>
                    {user.joined.slice(5).replace("-", "/")}
                  </p>
                  <Link
                    href={`/admin/users/${user.id}`}
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "rgba(255,255,255,0.4)", textDecoration: "none",
                      transition: "border-color 0.15s, color 0.15s",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.2)";
                      (e.currentTarget as HTMLAnchorElement).style.color = "#f0f4ff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)";
                      (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.4)";
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} users
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <PageBtn disabled={page === 1} onClick={() => setPage(page - 1)}>←</PageBtn>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PageBtn key={i} active={page === i + 1} onClick={() => setPage(i + 1)}>
                {i + 1}
              </PageBtn>
            ))}
            <PageBtn disabled={page === totalPages} onClick={() => setPage(page + 1)}>→</PageBtn>
          </div>
        </div>

      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function FilterPills({
  options, value, onChange, colors = {},
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  colors?: Record<string, string>;
}) {
  return (
    <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map((opt) => {
        const active  = value === opt;
        const color   = colors[opt];
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 500,
              background: active ? (color ? `${color}22` : "rgba(255,255,255,0.08)") : "transparent",
              color: active ? (color ?? "#f0f4ff") : "rgba(255,255,255,0.35)",
              textTransform: "capitalize",
              transition: "all 0.15s",
            }}
          >
            {opt === "all" ? "All" : opt}
          </button>
        );
      })}
    </div>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 16, height: 16, borderRadius: 5, flexShrink: 0,
        background: checked ? "#e24b4a" : "rgba(255,255,255,0.05)",
        border: `1px solid ${checked ? "#e24b4a" : "rgba(255,255,255,0.12)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      {checked && (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32, height: 32,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 8, border: "none",
        background: active ? "#e24b4a" : "rgba(255,255,255,0.04)",
        color: active ? "#fff" : disabled ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)",
        fontSize: 13, fontWeight: active ? 600 : 400,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s",
      }}
    >
      {children}
    </button>
  );
}