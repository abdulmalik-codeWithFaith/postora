"use client";

import { useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type PlanName = "Starter" | "Pro" | "Elite";

interface Plan {
  id: number;
  name: PlanName;
  price: number;
  period: string;
  description: string;
  platforms: number;
  postsPerMonth: number | "Unlimited";
  aiCaptions: number | "Unlimited";
  features: string[];
  active: boolean;
  users: number;
  revenue: string;
  color: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_PLANS: Plan[] = [
  {
    id: 1,
    name: "Starter",
    price: 3000,
    period: "/mo",
    description: "For small businesses getting started online.",
    platforms: 1,
    postsPerMonth: 10,
    aiCaptions: 20,
    features: [
      "1 social platform",
      "10 AI-generated posts monthly",
      "AI captions & hashtags",
      "Content planning",
      "Upload product photos & videos",
    ],
    active: true,
    users: 542,
    revenue: "₦1.6M",
    color: "#4e5768",
  },
  {
    id: 2,
    name: "Pro",
    price: 10000,
    period: "/mo",
    description: "For growing businesses that want consistent online presence.",
    platforms: 3,
    postsPerMonth: 30,
    aiCaptions: 100,
    features: [
      "3 social platforms",
      "30 AI-generated posts monthly",
      "Smart scheduling",
      "AI content planning",
      "Priority support",
    ],
    active: true,
    users: 581,
    revenue: "₦5.8M",
    color: "#00C98D",
  },
  {
    id: 3,
    name: "Elite",
    price: 25000,
    period: "/mo",
    description: "For businesses that want full content automation.",
    platforms: 4,
    postsPerMonth: "Unlimited",
    aiCaptions: "Unlimited",
    features: [
      "4 social platforms",
      "Unlimited posting",
      "AI-generated graphics",
      "Advanced content strategy",
      "Premium templates",
      "Faster AI processing",
    ],
    active: true,
    users: 161,
    revenue: "₦4.0M",
    color: "#e24b4a",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPlansPage() {
  const [plans, setPlans]       = useState<Plan[]>(INITIAL_PLANS);
  const [editing, setEditing]   = useState<Plan | null>(null);
  const [saved, setSaved]       = useState(false);

  const totalMRR = "₦11.4M";
  const totalSubs = plans.reduce((acc, p) => acc + p.users, 0);

  function openEdit(plan: Plan) {
    setEditing({ ...plan, features: [...plan.features] });
  }

  function saveEdit() {
    if (!editing) return;
    setPlans((prev) => prev.map((p) => p.id === editing.id ? editing : p));
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function toggleActive(id: number) {
    setPlans((prev) => prev.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  }

  function addFeature() {
    if (!editing) return;
    setEditing({ ...editing, features: [...editing.features, ""] });
  }

  function updateFeature(idx: number, val: string) {
    if (!editing) return;
    const next = [...editing.features];
    next[idx] = val;
    setEditing({ ...editing, features: next });
  }

  function removeFeature(idx: number) {
    if (!editing) return;
    setEditing({ ...editing, features: editing.features.filter((_, i) => i !== idx) });
  }

  return (
    <>
      <AdminTopbar
        title="Plans & Pricing"
        subtitle="Manage subscription plans and pricing"
      />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── MRR summary ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
          {[
            { label: "Total MRR",     value: totalMRR,               color: "#00C98D" },
            { label: "Paying users",  value: totalSubs.toString(),   color: "#f0f4ff" },
            { label: "Avg. revenue",  value: "₦9,031",               color: "#f0f4ff" },
            { label: "Churn rate",    value: "2.4%",                 color: "#ef9f27" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "16px 20px",
              }}
            >
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>{s.label}</p>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Saved toast ──────────────────────────────────────────────────── */}
        {saved && (
          <div
            style={{
              position: "fixed", top: 24, right: 24, zIndex: 200,
              background: "#00C98D", borderRadius: 12,
              padding: "11px 20px",
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 13, fontWeight: 600, color: "#0a0e14",
              boxShadow: "0 8px 24px rgba(0,201,141,0.3)",
              animation: "slideIn 0.3s ease",
            }}
          >
            <style>{`@keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}`}</style>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Plan updated successfully
          </div>
        )}

        {/* ── Plan cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 20 }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${plan.active ? `${plan.color}25` : "rgba(255,255,255,0.07)"}`,
                borderRadius: 18,
                overflow: "hidden",
                opacity: plan.active ? 1 : 0.6,
                transition: "opacity 0.2s",
              }}
            >
              {/* Card header */}
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: plan.color, boxShadow: `0 0 6px ${plan.color}` }} />
                    <span style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 16, fontWeight: 700, color: "#f0f4ff" }}>
                      {plan.name}
                    </span>
                    {!plan.active && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
                        DISABLED
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <span style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 28, fontWeight: 800, color: "#f0f4ff", letterSpacing: "-0.03em" }}>
                      ₦{plan.price.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{plan.period}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{plan.description}</p>
                </div>

                {/* Toggle active */}
                <button
                  onClick={() => toggleActive(plan.id)}
                  style={{
                    width: 40, height: 22, borderRadius: 11, flexShrink: 0,
                    background: plan.active ? plan.color : "rgba(255,255,255,0.08)",
                    border: "none", cursor: "pointer", position: "relative",
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 3,
                    left: plan.active ? 21 : 3,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                  }} />
                </button>
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {[
                  { label: "Users",    value: plan.users },
                  { label: "Revenue",  value: plan.revenue },
                  { label: "Platforms",value: plan.platforms },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    style={{
                      padding: "12px 16px",
                      borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 18, fontWeight: 700, color: plan.color, letterSpacing: "-0.02em" }}>
                      {s.value}
                    </p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Limits */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Posts / month", value: plan.postsPerMonth },
                  { label: "AI captions",   value: plan.aiCaptions },
                ].map((l) => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{l.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#f0f4ff" }}>{l.value}</span>
                  </div>
                ))}
              </div>

              {/* Features list */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <ul style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={plan.color} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Edit button */}
              <div style={{ padding: "14px 20px" }}>
                <button
                  onClick={() => openEdit(plan)}
                  style={{
                    width: "100%", padding: "9px",
                    background: `${plan.color}18`,
                    border: `1px solid ${plan.color}30`,
                    borderRadius: 10,
                    fontSize: 13, fontWeight: 600, color: plan.color,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    transition: "opacity 0.2s",
                  }}
                >
                  <EditIcon /> Edit plan
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Plan comparison table ─────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>
              Plan comparison
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Feature</th>
                  {plans.map((p) => (
                    <th key={p.id} style={{ padding: "12px 20px", textAlign: "center", fontSize: 12, fontWeight: 700, color: p.color }}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Price / month",   values: plans.map((p) => `₦${p.price.toLocaleString()}`) },
                  { feature: "Platforms",        values: plans.map((p) => p.platforms.toString()) },
                  { feature: "Posts / month",    values: plans.map((p) => p.postsPerMonth.toString()) },
                  { feature: "AI captions",      values: plans.map((p) => p.aiCaptions.toString()) },
                  { feature: "Smart scheduling", values: ["✗", "✓", "✓"] },
                  { feature: "AI graphics",      values: ["✗", "✗", "✓"] },
                  { feature: "Premium templates",values: ["✗", "✗", "✓"] },
                  { feature: "Priority support", values: ["✗", "✓", "✓"] },
                  { feature: "Users on plan",    values: plans.map((p) => p.users.toString()) },
                ].map((row, i) => (
                  <tr key={row.feature} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                    <td style={{ padding: "11px 20px", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{row.feature}</td>
                    {row.values.map((val, j) => (
                      <td key={j} style={{ padding: "11px 20px", textAlign: "center", fontWeight: 500, color: val === "✓" ? "#00C98D" : val === "✗" ? "rgba(255,255,255,0.2)" : "#f0f4ff" }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* ── Edit modal ────────────────────────────────────────────────────── */}
      {editing && (
        <div
          onClick={() => setEditing(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24, backdropFilter: "blur(6px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0f1117",
              border: `1px solid ${editing.color}30`,
              borderRadius: 22,
              width: "100%", maxWidth: 520,
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Modal header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 16, fontWeight: 700, color: "#f0f4ff" }}>
                  Edit {editing.name} plan
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>Changes apply to all new subscribers</p>
              </div>
              <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Price + platforms grid */}
              <div className="grid grid-cols-2" style={{ gap: 14 }}>
                <EField label="Price (₦ / month)">
                  <EInput
                    type="number"
                    value={editing.price.toString()}
                    onChange={(v) => setEditing({ ...editing, price: Number(v) })}
                    placeholder="e.g. 10000"
                  />
                </EField>
                <EField label="Max platforms">
                  <EInput
                    type="number"
                    value={editing.platforms.toString()}
                    onChange={(v) => setEditing({ ...editing, platforms: Number(v) })}
                    placeholder="1–4"
                  />
                </EField>
                <EField label="Posts / month">
                  <EInput
                    value={editing.postsPerMonth.toString()}
                    onChange={(v) => setEditing({ ...editing, postsPerMonth: v === "Unlimited" ? "Unlimited" : Number(v) })}
                    placeholder="e.g. 30 or Unlimited"
                  />
                </EField>
                <EField label="AI captions / month">
                  <EInput
                    value={editing.aiCaptions.toString()}
                    onChange={(v) => setEditing({ ...editing, aiCaptions: v === "Unlimited" ? "Unlimited" : Number(v) })}
                    placeholder="e.g. 100 or Unlimited"
                  />
                </EField>
              </div>

              {/* Description */}
              <EField label="Plan description">
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={2}
                  style={{ width: "100%", padding: "10px 13px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 13, color: "#f0f4ff", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.6, transition: "border-color 0.2s" }}
                  onFocus={(e) => (e.target.style.borderColor = editing.color)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </EField>

              {/* Features */}
              <EField label="Features">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {editing.features.map((f, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <EInput
                        value={f}
                        onChange={(v) => updateFeature(idx, v)}
                        placeholder={`Feature ${idx + 1}`}
                      />
                      <button
                        onClick={() => removeFeature(idx)}
                        style={{ width: 32, height: 38, flexShrink: 0, background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 9, color: "#e24b4a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addFeature}
                    style={{ padding: "8px", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 9, fontSize: 12, color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add feature
                  </button>
                </div>
              </EField>
            </div>

            {/* Modal footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 10, flexShrink: 0 }}>
              <button
                onClick={saveEdit}
                style={{ flex: 1, padding: "11px", background: editing.color, border: "none", borderRadius: 11, fontSize: 13, fontWeight: 700, color: editing.name === "Starter" ? "#f0f4ff" : "#0a0e14", cursor: "pointer" }}
              >
                Save changes
              </button>
              <button
                onClick={() => setEditing(null)}
                style={{ padding: "11px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 11, fontSize: 13, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function EField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>{label}</label>
      {children}
    </div>
  );
}

function EInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: "100%", padding: "10px 13px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 13, color: "#f0f4ff", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
      onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.3)")}
      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
    />
  );
}

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/>
    </svg>
  );
}