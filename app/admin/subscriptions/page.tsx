"use client";

import { useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type SubStatus = "active" | "cancelled" | "expired" | "past_due";
type Plan      = "Starter" | "Pro" | "Elite";
type Range     = "7d" | "30d" | "90d";

interface Subscription {
  id: string;
  user: string;
  email: string;
  plan: Plan;
  status: SubStatus;
  amount: number;
  startDate: string;
  nextBilling: string;
  cancelledAt?: string;
  paymentMethod: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const SUBSCRIPTIONS: Subscription[] = [
  { id: "SUB-001", user: "Amara Okafor",   email: "amara@brand.ng",       plan: "Pro",     status: "active",    amount: 10000, startDate: "2026-04-23", nextBilling: "2026-06-23", paymentMethod: "Paystack ****4231" },
  { id: "SUB-002", user: "Tunde Bello",    email: "tunde@shops.ng",       plan: "Elite",   status: "active",    amount: 25000, startDate: "2026-03-15", nextBilling: "2026-06-15", paymentMethod: "Paystack ****8812" },
  { id: "SUB-003", user: "Chioma Eze",     email: "chioma@style.ng",      plan: "Starter", status: "active",    amount: 3000,  startDate: "2026-05-22", nextBilling: "2026-06-22", paymentMethod: "Paystack ****5564" },
  { id: "SUB-004", user: "Femi Adeyemi",   email: "femi@market.ng",       plan: "Pro",     status: "past_due",  amount: 10000, startDate: "2026-04-21", nextBilling: "2026-05-21", paymentMethod: "Paystack ****2290" },
  { id: "SUB-005", user: "Ngozi Okonkwo",  email: "ngozi@ng.co",          plan: "Pro",     status: "active",    amount: 10000, startDate: "2026-02-20", nextBilling: "2026-06-20", paymentMethod: "Paystack ****7741" },
  { id: "SUB-006", user: "Kelechi Nwosu",  email: "kelechi@fashionng.co", plan: "Elite",   status: "active",    amount: 25000, startDate: "2026-01-18", nextBilling: "2026-06-18", paymentMethod: "Paystack ****3310" },
  { id: "SUB-007", user: "Bisi Adeleke",   email: "bisi@boutique.ng",     plan: "Starter", status: "cancelled", amount: 3000,  startDate: "2026-04-17", nextBilling: "—",          cancelledAt: "2026-05-10", paymentMethod: "Paystack ****9923" },
  { id: "SUB-008", user: "Uche Obi",       email: "uche@store.ng",        plan: "Pro",     status: "active",    amount: 10000, startDate: "2026-03-15", nextBilling: "2026-06-15", paymentMethod: "Paystack ****1145" },
  { id: "SUB-009", user: "Adaeze Nnamdi",  email: "adaeze@beauty.ng",     plan: "Pro",     status: "active",    amount: 10000, startDate: "2026-04-14", nextBilling: "2026-06-14", paymentMethod: "Paystack ****8867" },
  { id: "SUB-010", user: "Emeka Chukwu",   email: "emeka@prints.ng",      plan: "Starter", status: "expired",   amount: 3000,  startDate: "2026-03-12", nextBilling: "—",          cancelledAt: "2026-04-12", paymentMethod: "Paystack ****4432" },
  { id: "SUB-011", user: "Sade Ojo",       email: "sade@luxe.ng",         plan: "Elite",   status: "active",    amount: 25000, startDate: "2026-01-10", nextBilling: "2026-06-10", paymentMethod: "Paystack ****2278" },
  { id: "SUB-012", user: "Rotimi Afolabi", email: "rotimi@craft.ng",      plan: "Starter", status: "cancelled", amount: 3000,  startDate: "2026-04-08", nextBilling: "—",          cancelledAt: "2026-05-08", paymentMethod: "Paystack ****6654" },
  { id: "SUB-013", user: "Yetunde Bakare", email: "yetunde@wear.ng",      plan: "Pro",     status: "active",    amount: 10000, startDate: "2026-02-06", nextBilling: "2026-06-06", paymentMethod: "Paystack ****3391" },
  { id: "SUB-014", user: "Chidi Okeke",    email: "chidi@media.ng",       plan: "Elite",   status: "active",    amount: 25000, startDate: "2026-01-04", nextBilling: "2026-06-04", paymentMethod: "Paystack ****7723" },
  { id: "SUB-015", user: "Funmi Badmus",   email: "funmi@glow.ng",        plan: "Starter", status: "past_due",  amount: 3000,  startDate: "2026-05-01", nextBilling: "2026-06-01", paymentMethod: "Paystack ****8819" },
];

const PLAN_COLORS: Record<Plan, string> = {
  Starter: "#4e5768",
  Pro:     "#00C98D",
  Elite:   "#e24b4a",
};

const STATUS_MAP: Record<SubStatus, { bg: string; color: string; label: string; dot: string }> = {
  active:    { bg: "rgba(0,201,141,0.1)",   color: "#00C98D", label: "Active",    dot: "#00C98D" },
  cancelled: { bg: "rgba(255,255,255,0.05)",color: "#4e5768", label: "Cancelled", dot: "#4e5768" },
  expired:   { bg: "rgba(239,159,39,0.1)",  color: "#ef9f27", label: "Expired",   dot: "#ef9f27" },
  past_due:  { bg: "rgba(226,75,74,0.1)",   color: "#e24b4a", label: "Past due",  dot: "#e24b4a" },
};

const CHART_BARS = [
  { month: "Dec", revenue: 4200000 },
  { month: "Jan", revenue: 5100000 },
  { month: "Feb", revenue: 5800000 },
  { month: "Mar", revenue: 6400000 },
  { month: "Apr", revenue: 7200000 },
  { month: "May", revenue: 8400000 },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminSubscriptionsPage() {
  const [search, setSearch]         = useState("");
  const [planFilter, setPlan]       = useState<Plan | "all">("all");
  const [statusFilter, setStatus]   = useState<SubStatus | "all">("all");
  const [range, setRange]           = useState<Range>("30d");
  const [selected, setSelected]     = useState<string[]>([]);
  const [detailSub, setDetailSub]   = useState<Subscription | null>(null);
  const [page, setPage]             = useState(1);
  const PER_PAGE = 10;

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = SUBSCRIPTIONS.filter((s) => {
    const matchSearch = search === "" ||
      s.user.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchPlan   = planFilter === "all"   || s.plan === planFilter;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }
  function toggleAll() {
    const ids = paginated.map((s) => s.id);
    const allSel = ids.every((id) => selected.includes(id));
    setSelected(allSel ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])]);
  }
  const allOnPageSelected = paginated.length > 0 && paginated.every((s) => selected.includes(s.id));

  // ── Summary stats ─────────────────────────────────────────────────────────
  const active    = SUBSCRIPTIONS.filter((s) => s.status === "active");
  const pastDue   = SUBSCRIPTIONS.filter((s) => s.status === "past_due");
  const cancelled = SUBSCRIPTIONS.filter((s) => s.status === "cancelled" || s.status === "expired");
  const mrr       = active.reduce((acc, s) => acc + s.amount, 0);

  const maxBar = Math.max(...CHART_BARS.map((b) => b.revenue));

  return (
    <>
      <AdminTopbar
        title="Subscriptions"
        subtitle={`${active.length} active · ₦${(mrr / 1000000).toFixed(1)}M MRR`}
      />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
          {[
            { label: "Monthly Recurring Revenue", value: `₦${(mrr / 1000000).toFixed(1)}M`, change: "+23%",  color: "#00C98D", up: true  },
            { label: "Active subscriptions",       value: active.length.toString(),           change: "+12",   color: "#f0f4ff", up: true  },
            { label: "Past due",                   value: pastDue.length.toString(),          change: "+2",    color: "#e24b4a", up: false },
            { label: "Churned this month",         value: cancelled.length.toString(),        change: "-3",    color: "#ef9f27", up: true  },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
                <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 999, background: s.up ? "rgba(0,201,141,0.1)" : "rgba(226,75,74,0.1)", color: s.up ? "#00C98D" : "#e24b4a" }}>
                  {s.change}
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Revenue chart + plan split ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 20 }}>

          {/* Revenue chart (2/3) */}
          <div style={{ gridColumn: "span 2", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Revenue over time</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Monthly recurring revenue — last 6 months</p>
              </div>
              {/* Range toggle */}
              <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 9, padding: 3, gap: 2 }}>
                {(["7d","30d","90d"] as Range[]).map((r) => (
                  <button key={r} onClick={() => setRange(r)} style={{ padding: "4px 12px", borderRadius: 7, border: "none", fontSize: 11, fontWeight: 500, cursor: "pointer", background: range === r ? "rgba(255,255,255,0.1)" : "transparent", color: range === r ? "#f0f4ff" : "rgba(255,255,255,0.35)", transition: "all 0.15s" }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding: "24px 20px 16px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140 }}>
                {CHART_BARS.map((bar, i) => {
                  const isLast = i === CHART_BARS.length - 1;
                  const h = (bar.revenue / maxBar) * 120;
                  return (
                    <div key={bar.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                      <p style={{ fontSize: 10, fontWeight: 500, color: isLast ? "#00C98D" : "rgba(255,255,255,0.3)" }}>
                        ₦{(bar.revenue / 1000000).toFixed(1)}M
                      </p>
                      <div style={{ width: "100%", height: h, background: isLast ? "#00C98D" : "rgba(255,255,255,0.08)", borderRadius: "4px 4px 0 0", transition: "height 0.3s", minHeight: 4 }} />
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{bar.month}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Plan revenue split (1/3) */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>Revenue by plan</p>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { plan: "Elite",   revenue: 4000000, pct: 35, users: active.filter((s) => s.plan === "Elite").length },
                { plan: "Pro",     revenue: 5800000, pct: 51, users: active.filter((s) => s.plan === "Pro").length   },
                { plan: "Starter", revenue: 1600000, pct: 14, users: active.filter((s) => s.plan === "Starter").length },
              ].map((p) => (
                <div key={p.plan}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: PLAN_COLORS[p.plan as Plan] }} />
                      <span style={{ fontSize: 13, color: "#f0f4ff", fontWeight: 500 }}>{p.plan}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#f0f4ff" }}>₦{(p.revenue / 1000000).toFixed(1)}M</p>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{p.users} users</p>
                    </div>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p.pct}%`, background: PLAN_COLORS[p.plan as Plan], borderRadius: 3, opacity: 0.85 }} />
                  </div>
                </div>
              ))}

              {/* Total */}
              <div style={{ marginTop: 4, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Total MRR</span>
                <span style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 20, fontWeight: 700, color: "#00C98D", letterSpacing: "-0.02em" }}>
                  ₦{(mrr / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
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
              placeholder="Search by user, email, or ID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "9px 14px 9px 36px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, fontSize: 13, color: "#f0f4ff", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.target.style.borderColor = "#e24b4a")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
            />
          </div>

          {/* Plan filter */}
          <FilterRow options={["all","Starter","Pro","Elite"]} value={planFilter} onChange={(v) => { setPlan(v as Plan | "all"); setPage(1); }} colors={PLAN_COLORS} />

          {/* Status filter */}
          <FilterRow
            options={["all","active","past_due","cancelled","expired"]}
            value={statusFilter}
            onChange={(v) => { setStatus(v as SubStatus | "all"); setPage(1); }}
            colors={{ active: "#00C98D", past_due: "#e24b4a", cancelled: "#4e5768", expired: "#ef9f27" }}
          />

          {/* Bulk */}
          {selected.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{selected.length} selected</span>
              <button style={{ padding: "7px 14px", background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 9, fontSize: 12, color: "#e24b4a", cursor: "pointer" }}>Cancel selected</button>
              <button onClick={() => setSelected([])} style={{ padding: "7px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, fontSize: 12, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>Clear</button>
            </div>
          )}
        </div>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "40px 1.6fr 1.2fr 90px 90px 100px 130px 130px 80px", padding: "11px 20px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Checkbox checked={allOnPageSelected} onChange={toggleAll} />
            </div>
            {["User", "Email", "Plan", "Amount", "Status", "Started", "Next billing", ""].map((h) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {paginated.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "rgba(255,255,255,0.2)" }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>💳</p>
              <p>No subscriptions found</p>
            </div>
          ) : (
            paginated.map((sub, i) => {
              const s = STATUS_MAP[sub.status];
              return (
                <div
                  key={sub.id}
                  style={{
                    display: "grid", gridTemplateColumns: "40px 1.6fr 1.2fr 90px 90px 100px 130px 130px 80px",
                    padding: "13px 20px",
                    borderBottom: i < paginated.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    alignItems: "center", gap: 12,
                    background: selected.includes(sub.id) ? "rgba(226,75,74,0.03)" : "transparent",
                    transition: "background 0.15s", cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { if (!selected.includes(sub.id)) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"; }}
                  onMouseLeave={(e) => { if (!selected.includes(sub.id)) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <div onClick={(e) => { e.stopPropagation(); toggleSelect(sub.id); }} style={{ display: "flex", alignItems: "center" }}>
                    <Checkbox checked={selected.includes(sub.id)} onChange={() => toggleSelect(sub.id)} />
                  </div>

                  {/* User */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: `${PLAN_COLORS[sub.plan]}22`, border: `1px solid ${PLAN_COLORS[sub.plan]}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: PLAN_COLORS[sub.plan] }}>
                      {sub.user.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#f0f4ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub.user}</p>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{sub.id}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub.email}</p>

                  {/* Plan */}
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: `${PLAN_COLORS[sub.plan]}18`, color: PLAN_COLORS[sub.plan], border: `1px solid ${PLAN_COLORS[sub.plan]}33`, width: "fit-content", letterSpacing: "0.04em" }}>
                    {sub.plan}
                  </span>

                  {/* Amount */}
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>₦{sub.amount.toLocaleString()}</p>

                  {/* Status */}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: s.bg, color: s.color, textTransform: "uppercase", letterSpacing: "0.05em", width: "fit-content" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, boxShadow: sub.status === "active" ? `0 0 4px ${s.dot}` : "none" }} />
                    {s.label}
                  </span>

                  {/* Started */}
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{sub.startDate}</p>

                  {/* Next billing */}
                  <p style={{ fontSize: 11, color: sub.status === "active" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }}>
                    {sub.nextBilling}
                  </p>

                  {/* View button */}
                  <button
                    onClick={() => setDetailSub(sub)}
                    style={{ padding: "5px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.15s" }}
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
            Showing {Math.min((page - 1) * PER_PAGE + 1, filtered.length)}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
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

      {/* ── Detail modal ────────────────────────────────────────────────── */}
      {detailSub && (
        <SubDetailModal sub={detailSub} onClose={() => setDetailSub(null)} />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTION DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
function SubDetailModal({ sub, onClose }: { sub: Subscription; onClose: () => void }) {
  const s = STATUS_MAP[sub.status];
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#0f1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 22, width: "100%", maxWidth: 460, overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 15, fontWeight: 700, color: "#f0f4ff" }}>{sub.user}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{sub.id}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", padding: 4 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="grid grid-cols-2" style={{ gap: 10 }}>
            {[
              { label: "Plan",           value: sub.plan,            color: PLAN_COLORS[sub.plan] },
              { label: "Status",         value: s.label,             color: s.color },
              { label: "Amount",         value: `₦${sub.amount.toLocaleString()}/mo`, color: "#f0f4ff" },
              { label: "Payment",        value: sub.paymentMethod,   color: "rgba(255,255,255,0.5)" },
              { label: "Started",        value: sub.startDate,       color: "rgba(255,255,255,0.5)" },
              { label: "Next billing",   value: sub.nextBilling,     color: "rgba(255,255,255,0.5)" },
            ].map((m) => (
              <div key={m.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "11px 14px" }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>{m.label}</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {sub.status === "active" && (
              <button style={{ flex: 1, padding: "10px", background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "#e24b4a", cursor: "pointer" }}>
                Cancel subscription
              </button>
            )}
            {sub.status === "past_due" && (
              <button style={{ flex: 1, padding: "10px", background: "#00C98D", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#0a0e14", cursor: "pointer" }}>
                Retry payment
              </button>
            )}
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
function FilterRow({ options, value, onChange, colors = {} }: { options: string[]; value: string; onChange: (v: string) => void; colors?: Record<string, string> }) {
  return (
    <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map((opt) => {
        const active = value === opt;
        const color  = colors[opt];
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500, background: active ? (color ? `${color}22` : "rgba(255,255,255,0.08)") : "transparent", color: active ? (color ?? "#f0f4ff") : "rgba(255,255,255,0.35)", textTransform: "capitalize", transition: "all 0.15s" }}>
            {opt === "all" ? "All" : opt.replace("_", " ")}
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