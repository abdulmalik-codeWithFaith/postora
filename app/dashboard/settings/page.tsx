"use client";

import { useState } from "react";
import Topbar from "@/components/dashboard/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "profile" | "brand" | "notifications" | "billing" | "security";

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: "profile",
    label: "Profile",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    key: "brand",
    label: "Brand & Tone",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>,
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  },
  {
    key: "billing",
    label: "Billing & Plan",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  },
  {
    key: "security",
    label: "Security",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
const PLANS = [
  { name: "Starter", price: "₦3,000", period: "/mo", platforms: 1, posts: "10/mo",      features: ["1 platform", "10 posts/month", "AI captions"] },
  { name: "Pro",     price: "₦10,000", period: "/mo", platforms: 3, posts: "30/mo",     features: ["3 platforms", "30 posts/month", "Smart scheduling", "Priority support"] },
  { name: "Elite",   price: "₦25,000", period: "/mo", platforms: 4, posts: "Unlimited", features: ["4 platforms", "Unlimited posts", "AI graphics", "Premium templates"] },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <>
      <Topbar title="Settings" subtitle="Manage your account, brand, and preferences" />

      <main style={{ padding: 28, display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* ── Sidebar tabs ─────────────────────────────────────────────────── */}
        <div
          style={{
            width: 200, flexShrink: 0,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "8px",
            position: "sticky", top: 80,
            display: "flex", flexDirection: "column", gap: 2,
          }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10,
                  border: "none", cursor: "pointer", textAlign: "left",
                  background: active ? "var(--surface-3)" : "transparent",
                  color: active ? "var(--text-1)" : "var(--text-2)",
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  transition: "all 0.15s",
                  position: "relative",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-3)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                {active && (
                  <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 16, borderRadius: "0 2px 2px 0", background: "var(--green)" }} />
                )}
                <span style={{ color: active ? "var(--green)" : "inherit" }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ──────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {activeTab === "profile"       && <ProfileTab />}
          {activeTab === "brand"         && <BrandTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "billing"       && <BillingTab />}
          {activeTab === "security"      && <SecurityTab />}
        </div>

      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: PROFILE
// ─────────────────────────────────────────────────────────────────────────────
function ProfileTab() {
  const [form, setForm] = useState({ name: "Jane Doe", email: "jane@example.com", business: "My Brand", website: "https://mybrand.com", bio: "We make quality fashion products for the modern woman." });
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionCard title="Personal Information" subtitle="Update your name, email, and business details">

        {/* Avatar row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}>
          <div
            style={{
              width: 60, height: 60, borderRadius: "50%",
              background: "linear-gradient(135deg, #00C98D, #0f6e56)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 700, color: "#0a0e14", flexShrink: 0,
              fontFamily: "var(--font-sora), sans-serif",
            }}
          >
            JD
          </div>
          <div>
            <button
              style={{
                padding: "7px 16px",
                background: "var(--surface-3)", border: "1px solid var(--border-hover)",
                borderRadius: 9, fontSize: 13, fontWeight: 500,
                color: "var(--text-2)", cursor: "pointer",
              }}
            >
              Change photo
            </button>
            <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 5 }}>JPG or PNG · Max 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14 }}>
          <Field label="Full name">
            <Input value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Your full name" />
          </Field>
          <Field label="Email address">
            <Input value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@example.com" type="email" />
          </Field>
          <Field label="Business name">
            <Input value={form.business} onChange={(v) => setForm({ ...form, business: v })} placeholder="Your business name" />
          </Field>
          <Field label="Website">
            <Input value={form.website} onChange={(v) => setForm({ ...form, website: v })} placeholder="https://" />
          </Field>
        </div>

        <Field label="Business bio">
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            placeholder="Tell us about your business…"
            style={{
              width: "100%", padding: "11px 14px",
              background: "var(--surface-3)", border: "1px solid var(--border-hover)",
              borderRadius: 10, fontSize: 13, color: "var(--text-1)",
              resize: "none", outline: "none", lineHeight: 1.6,
              fontFamily: "inherit", transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
          />
        </Field>

        <SaveButton saved={saved} onSave={save} />
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: BRAND & TONE
// ─────────────────────────────────────────────────────────────────────────────
function BrandTab() {
  const [tone, setTone]         = useState("fun");
  const [industry, setIndustry] = useState("fashion");
  const [keywords, setKeywords] = useState("affordable, stylish, quality, Nigerian fashion");
  const [avoid, setAvoid]       = useState("slang, political topics");
  const [emoji, setEmoji]       = useState(true);
  const [hashtags, setHashtags] = useState(true);
  const [cta, setCta]           = useState(true);
  const [saved, setSaved]       = useState(false);

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2500); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionCard title="Brand Voice" subtitle="Tell Gemini AI how your brand should sound">
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14 }}>

          <Field label="Default tone">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", background: "var(--surface-3)", border: "1px solid var(--border-hover)", borderRadius: 10, fontSize: 13, color: "var(--text-1)", outline: "none", colorScheme: "dark", cursor: "pointer" }}
            >
              {["fun", "professional", "inspirational", "promotional"].map((t) => (
                <option key={t} value={t} style={{ textTransform: "capitalize" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </Field>

          <Field label="Industry / niche">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", background: "var(--surface-3)", border: "1px solid var(--border-hover)", borderRadius: 10, fontSize: 13, color: "var(--text-1)", outline: "none", colorScheme: "dark", cursor: "pointer" }}
            >
              {["fashion", "beauty", "food", "tech", "health", "home decor", "accessories"].map((i) => (
                <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Brand keywords" hint="Words that describe your brand (comma-separated)">
          <Input value={keywords} onChange={setKeywords} placeholder="e.g. bold, minimal, luxury" />
        </Field>

        <Field label="Topics to avoid" hint="Things you never want AI to mention">
          <Input value={avoid} onChange={setAvoid} placeholder="e.g. competitor names, political topics" />
        </Field>

        <SaveButton saved={saved} onSave={save} />
      </SectionCard>

      <SectionCard title="Caption Preferences" subtitle="Default settings for every AI-generated post">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Toggle label="Include emojis" description="Add relevant emojis to captions" value={emoji} onChange={setEmoji} />
          <Toggle label="Include hashtags" description="Auto-generate relevant hashtags" value={hashtags} onChange={setHashtags} />
          <Toggle label="Include call to action" description='Always add a CTA like "Shop link in bio"' value={cta} onChange={setCta} />
        </div>
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
function NotificationsTab() {
  const [email, setEmail]   = useState({ postPublished: true,  scheduleFailed: true,  weeklyReport: true,  newFeatures: false });
  const [push, setPush]     = useState({ postPublished: true,  scheduleFailed: true,  weeklyReport: false, newFeatures: false });

  function toggleEmail(key: keyof typeof email) { setEmail((p) => ({ ...p, [key]: !p[key] })); }
  function togglePush(key: keyof typeof push)   { setPush((p)  => ({ ...p, [key]: !p[key] })); }

  const items: { key: keyof typeof email; label: string; desc: string }[] = [
    { key: "postPublished",  label: "Post published",     desc: "When a post goes live" },
    { key: "scheduleFailed", label: "Schedule failed",    desc: "When a post fails to publish" },
    { key: "weeklyReport",   label: "Weekly report",      desc: "Summary of your weekly performance" },
    { key: "newFeatures",    label: "New features",       desc: "Product updates and announcements" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionCard title="Email Notifications" subtitle="Choose what emails you receive from Postora">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {items.map((item, i) => (
            <div
              key={item.key}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{item.label}</p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{item.desc}</p>
              </div>
              <ToggleSwitch value={email[item.key]} onChange={() => toggleEmail(item.key)} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Push Notifications" subtitle="Browser and mobile push alerts">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {items.map((item, i) => (
            <div
              key={item.key}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{item.label}</p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{item.desc}</p>
              </div>
              <ToggleSwitch value={push[item.key]} onChange={() => togglePush(item.key)} />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: BILLING
// ─────────────────────────────────────────────────────────────────────────────
function BillingTab() {
  const currentPlan = "Pro";
  const [confirmCancel, setConfirmCancel] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Current plan */}
      <SectionCard title="Current Plan" subtitle="Your active subscription">
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 18px",
            background: "var(--green-muted)",
            border: "1px solid rgba(0,201,141,0.2)",
            borderRadius: 14, flexWrap: "wrap", gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(0,201,141,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>Pro Plan</p>
              <p style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>₦10,000 / month · Renews June 23, 2026</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span
              style={{
                fontSize: 11, fontWeight: 700, padding: "4px 10px",
                borderRadius: 999, background: "rgba(0,201,141,0.15)",
                color: "var(--green)", border: "1px solid rgba(0,201,141,0.25)",
              }}
            >
              Active
            </span>
          </div>
        </div>

        {/* Usage */}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
          {[
            { label: "Posts used",       used: 8,  total: 30,   unit: "posts" },
            { label: "Platforms",        used: 2,  total: 3,    unit: "platforms" },
            { label: "AI generations",   used: 23, total: 100,  unit: "captions" },
          ].map((u) => (
            <div
              key={u.label}
              style={{
                background: "var(--surface-3)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "14px 16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>{u.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{u.used} / {u.total}</span>
              </div>
              <div style={{ height: 4, background: "var(--surface-4)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(u.used / u.total) * 100}%`, background: "var(--green)", borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Plan cards */}
      <SectionCard title="Change Plan" subtitle="Upgrade or downgrade at any time">
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
          {PLANS.map((plan) => {
            const isCurrent = plan.name === currentPlan;
            return (
              <div
                key={plan.name}
                style={{
                  background: "var(--surface-3)",
                  border: `1px solid ${isCurrent ? "var(--green)" : "var(--border)"}`,
                  borderRadius: 14, padding: "18px",
                  display: "flex", flexDirection: "column", gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{plan.name}</p>
                  {isCurrent && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "var(--green-muted)", color: "var(--green)", border: "1px solid rgba(0,201,141,0.2)", letterSpacing: "0.06em" }}>
                      CURRENT
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 22, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}>
                  {plan.price}<span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-3)" }}>{plan.period}</span>
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text-2)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent}
                  style={{
                    padding: "9px", borderRadius: 9,
                    background: isCurrent ? "transparent" : "var(--green)",
                    color: isCurrent ? "var(--text-3)" : "#0a0e14",
                    fontSize: 12, fontWeight: 600, cursor: isCurrent ? "default" : "pointer",
                    border: isCurrent ? "1px solid var(--border)" : "none",
                  } as React.CSSProperties}
                >
                  {isCurrent ? "Current plan" : plan.name === "Starter" ? "Downgrade" : "Upgrade"}
                </button>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Billing history */}
      <SectionCard title="Billing History" subtitle="Your recent payments">
        {[
          { date: "May 23, 2026",   amount: "₦10,000", status: "Paid",   plan: "Pro" },
          { date: "Apr 23, 2026",   amount: "₦10,000", status: "Paid",   plan: "Pro" },
          { date: "Mar 23, 2026",   amount: "₦3,000",  status: "Paid",   plan: "Starter" },
        ].map((invoice, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: i < 2 ? "1px solid var(--border)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--surface-3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{invoice.plan} Plan</p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{invoice.date}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{invoice.amount}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: "rgba(0,201,141,0.1)", color: "var(--green)" }}>
                {invoice.status}
              </span>
              <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--green)", textDecoration: "none" }}>
                Download
              </button>
            </div>
          </div>
        ))}
      </SectionCard>

      {/* Cancel */}
      <SectionCard title="Cancel Subscription" subtitle="This will downgrade you to the free tier at the end of your billing period">
        {!confirmCancel ? (
          <button
            onClick={() => setConfirmCancel(true)}
            style={{
              padding: "10px 20px",
              background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.2)",
              borderRadius: 10, fontSize: 13, fontWeight: 500,
              color: "#e24b4a", cursor: "pointer", width: "fit-content",
            }}
          >
            Cancel subscription
          </button>
        ) : (
          <div
            style={{
              padding: "16px 18px",
              background: "rgba(226,75,74,0.06)", border: "1px solid rgba(226,75,74,0.15)",
              borderRadius: 12, display: "flex", flexDirection: "column", gap: 12,
            }}
          >
            <p style={{ fontSize: 13, color: "var(--text-1)" }}>
              Are you sure? You'll lose access to Pro features on <strong>June 23, 2026</strong>.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmCancel(false)}
                style={{ padding: "9px 18px", background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 9, fontSize: 13, color: "var(--text-2)", cursor: "pointer" }}
              >
                Keep subscription
              </button>
              <button
                onClick={() => setConfirmCancel(false)}
                style={{ padding: "9px 18px", background: "#e24b4a", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}
              >
                Yes, cancel
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: SECURITY
// ─────────────────────────────────────────────────────────────────────────────
function SecurityTab() {
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [twofa, setTwofa]           = useState(false);
  const [saved, setSaved]           = useState(false);

  function save() {
    if (!currentPw || !newPw || newPw !== confirmPw) return;
    setSaved(true);
    setTimeout(() => { setSaved(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }, 2500);
  }

  const mismatch = confirmPw.length > 0 && newPw !== confirmPw;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionCard title="Change Password" subtitle="Use a strong password you don't use elsewhere">
        <Field label="Current password">
          <PasswordInput value={currentPw} onChange={setCurrentPw} show={showPw} onToggle={() => setShowPw(!showPw)} placeholder="Enter current password" />
        </Field>
        <Field label="New password">
          <PasswordInput value={newPw} onChange={setNewPw} show={showPw} onToggle={() => setShowPw(!showPw)} placeholder="Min. 8 characters" />
        </Field>
        <Field label="Confirm new password" error={mismatch ? "Passwords don't match" : undefined}>
          <PasswordInput value={confirmPw} onChange={setConfirmPw} show={showPw} onToggle={() => setShowPw(!showPw)} placeholder="Repeat new password" error={mismatch} />
        </Field>
        <SaveButton saved={saved} onSave={save} label="Update password" />
      </SectionCard>

      <SectionCard title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", marginBottom: 3 }}>Authenticator app</p>
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>
              {twofa ? "2FA is enabled. Your account is more secure." : "Protect your account with an authenticator app."}
            </p>
          </div>
          <ToggleSwitch value={twofa} onChange={() => setTwofa(!twofa)} />
        </div>
      </SectionCard>

      <SectionCard title="Active Sessions" subtitle="Devices currently logged into your account">
        {[
          { device: "Chrome on macOS",  location: "Lagos, Nigeria",   current: true,  time: "Now" },
          { device: "iPhone 14",        location: "Lagos, Nigeria",   current: false, time: "2 hours ago" },
          { device: "Firefox on Windows", location: "Abuja, Nigeria", current: false, time: "3 days ago" },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: i < 2 ? "1px solid var(--border)" : "none",
              flexWrap: "wrap", gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--surface-3)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{s.device}</p>
                  {s.current && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "var(--green-muted)", color: "var(--green)" }}>THIS DEVICE</span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>{s.location} · {s.time}</p>
              </div>
            </div>
            {!s.current && (
              <button style={{ padding: "6px 14px", background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.15)", borderRadius: 8, fontSize: 12, fontWeight: 500, color: "#e24b4a", cursor: "pointer" }}>
                Revoke
              </button>
            )}
          </div>
        ))}
      </SectionCard>

      {/* Danger zone */}
      <SectionCard title="Danger Zone" subtitle="Irreversible actions — proceed with caution">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#e24b4a", marginBottom: 3 }}>Delete account</p>
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>Permanently delete your account and all data. This cannot be undone.</p>
          </div>
          <button
            style={{
              padding: "9px 18px",
              background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.2)",
              borderRadius: 10, fontSize: 13, fontWeight: 500,
              color: "#e24b4a", cursor: "pointer", flexShrink: 0,
            }}
          >
            Delete account
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{title}</p>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 3 }}>{subtitle}</p>
      </div>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}>{label}</label>
      {children}
      {hint  && <p style={{ fontSize: 11, color: "var(--text-3)" }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: "#e24b4a" }}>{error}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: "100%", padding: "11px 14px", background: "var(--surface-3)", border: "1px solid var(--border-hover)", borderRadius: 10, fontSize: 13, color: "var(--text-1)", outline: "none", transition: "border-color 0.2s", fontFamily: "inherit" }}
      onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
    />
  );
}

function PasswordInput({ value, onChange, show, onToggle, placeholder, error }: { value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder?: string; error?: boolean }) {
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "11px 42px 11px 14px", background: "var(--surface-3)", border: `1px solid ${error ? "#e24b4a" : "var(--border-hover)"}`, borderRadius: 10, fontSize: 13, color: "var(--text-1)", outline: "none", transition: "border-color 0.2s", fontFamily: "inherit" }}
        onFocus={(e) => { if (!error) e.target.style.borderColor = "var(--green)"; }}
        onBlur={(e) => { if (!error) e.target.style.borderColor = "var(--border-hover)"; }}
      />
      <button onClick={onToggle} type="button" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "flex", padding: 4 }}>
        {show
          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        }
      </button>
    </div>
  );
}

function Toggle({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{label}</p>
        <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{description}</p>
      </div>
      <ToggleSwitch value={value} onChange={() => onChange(!value)} />
    </div>
  );
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 12, flexShrink: 0,
        background: value ? "var(--green)" : "var(--surface-4)",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3, left: value ? 23 : 3,
          width: 18, height: 18, borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

function SaveButton({ saved, onSave, label = "Save changes" }: { saved: boolean; onSave: () => void; label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
      <button
        onClick={onSave}
        style={{
          padding: "10px 24px",
          background: "var(--green)", border: "none", borderRadius: 10,
          fontSize: 13, fontWeight: 600, color: "#0a0e14",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
          transition: "opacity 0.2s",
        }}
      >
        {saved && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
        {saved ? "Saved!" : label}
      </button>
    </div>
  );
}