"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  updateProfile as updateAuthProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  deleteUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Topbar from "@/components/dashboard/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "profile" | "brand" | "notifications" | "billing" | "security";

type BusinessProfile = {
  businessName?: string;
  website?: string;
  description?: string;
  brandVoice?: {
    tone?: string;
    industry?: string;
    keywords?: string;
    avoid?: string;
  };
  captionPreferences?: {
    emoji?: boolean;
    hashtags?: boolean;
    cta?: boolean;
  };
};

type UserDoc = {
  name?: string;
  email?: string;
  plan?: string;
  notificationPrefs?: {
    email?: Record<string, boolean>;
    push?: Record<string, boolean>;
  };
};

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

// ─── Static plan catalog (unchanged — pricing display only, not billing logic) ─
const PLANS = [
  { name: "Starter", price: "Free",   period: "",    features: ["1 connected account", "10 scheduled posts", "AI captions", "Basic analytics"] },
  { name: "Pro",     price: "$9.99",  period: "/mo", features: ["5 connected accounts", "60 scheduled posts", "Image & video support", "Advanced analytics", "AI recommendations"] },
  { name: "Premium", price: "$19.99", period: "/mo", features: ["Unlimited accounts & posts", "AI graphics, posters & carousels", "Priority AI processing"] },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE — auth gate + data fetch, then hands data down to tabs
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<BusinessProfile>({});
  const [userDoc, setUserDoc] = useState<UserDoc>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setUid(user.uid);

      try {
        const [bpSnap, uSnap] = await Promise.all([
          getDoc(doc(db, "businessProfiles", user.uid)),
          getDoc(doc(db, "users", user.uid)),
        ]);
        setProfile(bpSnap.exists() ? (bpSnap.data() as BusinessProfile) : {});
        setUserDoc(
          uSnap.exists()
            ? (uSnap.data() as UserDoc)
            : { name: user.displayName ?? "", email: user.email ?? "" }
        );
      } catch (err) {
        console.error(err);
        setLoadError("Couldn't load your settings. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  // Called by tabs after a successful save, so the UI reflects the new values
  // without needing a full refetch.
  const patchProfile = useCallback((patch: Partial<BusinessProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);
  const patchUserDoc = useCallback((patch: Partial<UserDoc>) => {
    setUserDoc((prev) => ({ ...prev, ...patch }));
  }, []);

  if (loading) {
    return (
      <>
        <Topbar title="Settings" subtitle="Manage your account, brand, and preferences" />
        <main style={{ padding: 28, color: "var(--text-2)", fontSize: 14 }}>Loading your settings…</main>
      </>
    );
  }

  return (
    <>
      <Topbar title="Settings" subtitle="Manage your account, brand, and preferences" />

      <main style={{ padding: 28, display: "flex", gap: 24, alignItems: "flex-start" }}>

        {loadError && (
          <div style={{ position: "fixed", top: 90, right: 28, padding: "10px 16px", background: "rgba(226,75,74,0.12)", border: "1px solid rgba(226,75,74,0.3)", borderRadius: 10, fontSize: 13, color: "#e24b4a", zIndex: 20 }}>
            {loadError}
          </div>
        )}

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
          {activeTab === "profile" && uid && (
            <ProfileTab uid={uid} profile={profile} userDoc={userDoc} onProfileSaved={patchProfile} onUserSaved={patchUserDoc} />
          )}
          {activeTab === "brand" && uid && (
            <BrandTab uid={uid} profile={profile} onSaved={patchProfile} />
          )}
          {activeTab === "notifications" && uid && (
            <NotificationsTab uid={uid} userDoc={userDoc} onSaved={patchUserDoc} />
          )}
          {activeTab === "billing" && <BillingTab currentPlan={userDoc.plan || "Starter"} />}
          {activeTab === "security" && <SecurityTab />}
        </div>

      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: PROFILE — writes to users/{uid} and businessProfiles/{uid}
// ─────────────────────────────────────────────────────────────────────────────
function ProfileTab({
  uid,
  profile,
  userDoc,
  onProfileSaved,
  onUserSaved,
}: {
  uid: string;
  profile: BusinessProfile;
  userDoc: UserDoc;
  onProfileSaved: (p: Partial<BusinessProfile>) => void;
  onUserSaved: (u: Partial<UserDoc>) => void;
}) {
  const [form, setForm] = useState({
    name: userDoc.name || "",
    email: userDoc.email || "",
    business: profile.businessName || "",
    website: profile.website || "",
    bio: profile.description || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      // Keep Firebase Auth's displayName in sync
      if (auth.currentUser && auth.currentUser.displayName !== form.name) {
        await updateAuthProfile(auth.currentUser, { displayName: form.name });
      }

      await setDoc(
        doc(db, "users", uid),
        { name: form.name.trim(), email: form.email, updatedAt: serverTimestamp() },
        { merge: true }
      );

      await setDoc(
        doc(db, "businessProfiles", uid),
        {
          businessName: form.business.trim(),
          website: form.website.trim(),
          description: form.bio.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      onUserSaved({ name: form.name, email: form.email });
      onProfileSaved({ businessName: form.business, website: form.website, description: form.bio });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setError("Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
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
            {initials(form.name)}
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
          <Field label="Email address" hint="Contact support to change your login email">
            <Input value={form.email} onChange={() => {}} placeholder="you@example.com" type="email" disabled />
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

        {error && <p style={{ fontSize: 12, color: "#e24b4a" }}>{error}</p>}
        <SaveButton saved={saved} saving={saving} onSave={save} />
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: BRAND & TONE — writes to businessProfiles/{uid}.brandVoice / captionPreferences
// ─────────────────────────────────────────────────────────────────────────────
function BrandTab({
  uid,
  profile,
  onSaved,
}: {
  uid: string;
  profile: BusinessProfile;
  onSaved: (p: Partial<BusinessProfile>) => void;
}) {
  const [tone, setTone]         = useState(profile.brandVoice?.tone || "fun");
  const [industry, setIndustry] = useState(profile.brandVoice?.industry || "fashion");
  const [keywords, setKeywords] = useState(profile.brandVoice?.keywords || "");
  const [avoid, setAvoid]       = useState(profile.brandVoice?.avoid || "");
  const [emoji, setEmoji]       = useState(profile.captionPreferences?.emoji ?? true);
  const [hashtags, setHashtags] = useState(profile.captionPreferences?.hashtags ?? true);
  const [cta, setCta]           = useState(profile.captionPreferences?.cta ?? true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");

  async function save() {
    setSaving(true);
    setError("");
    const brandVoice = { tone, industry, keywords: keywords.trim(), avoid: avoid.trim() };
    const captionPreferences = { emoji, hashtags, cta };
    try {
      await setDoc(
        doc(db, "businessProfiles", uid),
        { brandVoice, captionPreferences, updatedAt: serverTimestamp() },
        { merge: true }
      );
      onSaved({ brandVoice, captionPreferences });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setError("Couldn't save your brand settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

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

        {error && <p style={{ fontSize: 12, color: "#e24b4a" }}>{error}</p>}
        <SaveButton saved={saved} saving={saving} onSave={save} />
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
// TAB: NOTIFICATIONS — writes to users/{uid}.notificationPrefs
// ─────────────────────────────────────────────────────────────────────────────
const NOTIF_ITEMS: { key: string; label: string; desc: string }[] = [
  { key: "postPublished",  label: "Post published",  desc: "When a post goes live" },
  { key: "scheduleFailed", label: "Schedule failed",  desc: "When a post fails to publish" },
  { key: "weeklyReport",   label: "Weekly report",    desc: "Summary of your weekly performance" },
  { key: "newFeatures",    label: "New features",     desc: "Product updates and announcements" },
];

function NotificationsTab({
  uid,
  userDoc,
  onSaved,
}: {
  uid: string;
  userDoc: UserDoc;
  onSaved: (u: Partial<UserDoc>) => void;
}) {
  const [email, setEmail] = useState<Record<string, boolean>>(
    userDoc.notificationPrefs?.email || { postPublished: true, scheduleFailed: true, weeklyReport: true, newFeatures: false }
  );
  const [push, setPush] = useState<Record<string, boolean>>(
    userDoc.notificationPrefs?.push || { postPublished: true, scheduleFailed: true, weeklyReport: false, newFeatures: false }
  );
  const [error, setError] = useState("");

  async function persist(nextEmail: Record<string, boolean>, nextPush: Record<string, boolean>) {
    try {
      await setDoc(
        doc(db, "users", uid),
        { notificationPrefs: { email: nextEmail, push: nextPush }, updatedAt: serverTimestamp() },
        { merge: true }
      );
      onSaved({ notificationPrefs: { email: nextEmail, push: nextPush } });
    } catch (err) {
      console.error(err);
      setError("Couldn't save your notification preferences.");
    }
  }

  function toggleEmail(key: string) {
    const next = { ...email, [key]: !email[key] };
    setEmail(next);
    persist(next, push);
  }
  function togglePush(key: string) {
    const next = { ...push, [key]: !push[key] };
    setPush(next);
    persist(email, next);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {error && <p style={{ fontSize: 12, color: "#e24b4a" }}>{error}</p>}

      <SectionCard title="Email Notifications" subtitle="Choose what emails you receive from Postora">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {NOTIF_ITEMS.map((item, i) => (
            <div
              key={item.key}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: i < NOTIF_ITEMS.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{item.label}</p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{item.desc}</p>
              </div>
              <ToggleSwitch value={!!email[item.key]} onChange={() => toggleEmail(item.key)} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Push Notifications" subtitle="Browser and mobile push alerts">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {NOTIF_ITEMS.map((item, i) => (
            <div
              key={item.key}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: i < NOTIF_ITEMS.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>{item.label}</p>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{item.desc}</p>
              </div>
              <ToggleSwitch value={!!push[item.key]} onChange={() => togglePush(item.key)} />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: BILLING
// NOTE: actual charging/upgrade requires a payment provider (Stripe, Paystack,
// etc.) with server-side webhooks — that's outside what a client SDK can do
// safely. This reads the user's current plan from Firestore (users/{uid}.plan,
// which your payment webhook should be the one to update) and displays it.
// The "Upgrade"/"Downgrade" buttons are wired to call your own checkout
// endpoint — replace the TODO with your actual route once you have one.
// ─────────────────────────────────────────────────────────────────────────────
function BillingTab({ currentPlan }: { currentPlan: string }) {
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function handlePlanChange(planName: string) {
    // TODO: replace with a call to your checkout/billing API, e.g.:
    // await fetch("/api/billing/checkout", { method: "POST", body: JSON.stringify({ plan: planName }) });
    console.log("Requested plan change to:", planName);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

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
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>{currentPlan} Plan</p>
            </div>
          </div>
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
      </SectionCard>

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
                  onClick={() => handlePlanChange(plan.name)}
                  style={{
                    padding: "9px", borderRadius: 9,
                    background: isCurrent ? "transparent" : "var(--green)",
                    color: isCurrent ? "var(--text-3)" : "#0a0e14",
                    fontSize: 12, fontWeight: 600, cursor: isCurrent ? "default" : "pointer",
                    border: isCurrent ? "1px solid var(--border)" : "none",
                  } as React.CSSProperties}
                >
                  {isCurrent ? "Current plan" : "Choose plan"}
                </button>
              </div>
            );
          })}
        </div>
      </SectionCard>

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
              Are you sure you want to cancel? You&apos;ll keep access until the end of your current billing period.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmCancel(false)}
                style={{ padding: "9px 18px", background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 9, fontSize: 13, color: "var(--text-2)", cursor: "pointer" }}
              >
                Keep subscription
              </button>
              <button
                onClick={() => { handlePlanChange("Starter"); setConfirmCancel(false); }}
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
// TAB: SECURITY — real Firebase Auth password change + account deletion
// ─────────────────────────────────────────────────────────────────────────────
function SecurityTab() {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletePw, setDeletePw]           = useState("");
  const [deleteError, setDeleteError]     = useState("");
  const [deleting, setDeleting]           = useState(false);

  const mismatch = confirmPw.length > 0 && newPw !== confirmPw;

  async function save() {
    setError("");
    if (!currentPw || !newPw || newPw !== confirmPw) return;
    if (newPw.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setError("You're not signed in. Please log in again.");
      return;
    }

    setSaving(true);
    try {
      // Firebase requires a recent login before allowing a password change
      const credential = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPw);

      setSaved(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Current password is incorrect.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        console.error(err);
        setError("Couldn't update your password. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError("");
    const user = auth.currentUser;
    if (!user || !user.email) return;

    setDeleting(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, deletePw);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      // Note: this only deletes the Auth record. Deleting the user's Firestore
      // documents (users/{uid}, businessProfiles/{uid}, posts, media, etc.)
      // should be done server-side (e.g. a Cloud Function triggered on user
      // deletion), since the client loses write access the moment auth is gone.
      window.location.href = "/";
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setDeleteError("Incorrect password.");
      } else {
        console.error(err);
        setDeleteError("Couldn't delete your account. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  }

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
        {error && <p style={{ fontSize: 12, color: "#e24b4a" }}>{error}</p>}
        <SaveButton saved={saved} saving={saving} onSave={save} label="Update password" />
      </SectionCard>

      {/* Note: Firebase client SDK doesn't expose 2FA enrollment/session listing
          out of the box — those need Firebase's multi-factor auth APIs and/or
          your own session tracking. Left as UI-only until that's wired up. */}
      <SectionCard title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account">
        <p style={{ fontSize: 12, color: "var(--text-3)" }}>
          2FA setup is coming soon — this requires Firebase&apos;s multi-factor auth enrollment flow.
        </p>
      </SectionCard>

      <SectionCard title="Danger Zone" subtitle="Irreversible actions — proceed with caution">
        {!deleteConfirm ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#e24b4a", marginBottom: 3 }}>Delete account</p>
              <p style={{ fontSize: 12, color: "var(--text-3)" }}>Permanently delete your account and all data. This cannot be undone.</p>
            </div>
            <button
              onClick={() => setDeleteConfirm(true)}
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
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 13, color: "var(--text-1)" }}>Confirm your password to permanently delete your account.</p>
            <PasswordInput value={deletePw} onChange={setDeletePw} show={showPw} onToggle={() => setShowPw(!showPw)} placeholder="Your password" />
            {deleteError && <p style={{ fontSize: 12, color: "#e24b4a" }}>{deleteError}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setDeleteConfirm(false); setDeletePw(""); setDeleteError(""); }}
                style={{ padding: "9px 18px", background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 9, fontSize: 13, color: "var(--text-2)", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePw}
                style={{ padding: "9px 18px", background: "#e24b4a", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "#fff", cursor: deleting || !deletePw ? "not-allowed" : "pointer", opacity: deleting || !deletePw ? 0.6 : 1 }}
              >
                {deleting ? "Deleting…" : "Permanently delete"}
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function initials(name: string): string {
  if (!name.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

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

function Input({ value, onChange, placeholder, type = "text", disabled = false }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "11px 14px",
        background: disabled ? "var(--surface-4)" : "var(--surface-3)",
        border: "1px solid var(--border-hover)", borderRadius: 10, fontSize: 13,
        color: disabled ? "var(--text-3)" : "var(--text-1)", outline: "none",
        transition: "border-color 0.2s", fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "text",
      }}
      onFocus={(e) => { if (!disabled) e.target.style.borderColor = "var(--green)"; }}
      onBlur={(e) => { if (!disabled) e.target.style.borderColor = "var(--border-hover)"; }}
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

function SaveButton({ saved, saving, onSave, label = "Save changes" }: { saved: boolean; saving: boolean; onSave: () => void; label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          padding: "10px 24px",
          background: "var(--green)", border: "none", borderRadius: 10,
          fontSize: 13, fontWeight: 600, color: "#0a0e14",
          cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 7,
          transition: "opacity 0.2s", opacity: saving ? 0.7 : 1,
        }}
      >
        {saved && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
        {saving ? "Saving…" : saved ? "Saved!" : label}
      </button>
    </div>
  );
}