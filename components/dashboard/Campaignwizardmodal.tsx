"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getConnectedAccounts } from "@/lib/firestore";
import { MediaItem as FirestoreMediaItem } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// ASSUMPTIONS — please confirm these match your actual backend:
//
// 1. `getConnectedAccounts(uid)` already exists in @/lib/firestore (used by the
//    Connected Accounts page) and resolves to: { id, platform, handle }[].
//    If the real shape/name differs, tell me and I'll rewire this.
//
// 2. Actual AI generation is NOT done client-side here — a 30-day batch of
//    image selection + captions + hashtags is too slow/heavy for a single
//    blocking request. Instead this writes a doc to `campaigns/{id}` with
//    status: "generating", and assumes a backend job (Cloud Function
//    triggered on create, or a queued API route) picks it up, does the work,
//    writes the resulting posts (e.g. to `calendarPosts`), and flips the
//    campaign doc's status to "complete" (or "failed" with an `error` field).
//    This component just listens to that doc via onSnapshot and redirects
//    once status is "complete". If you already have this pipeline under a
//    different collection/field name, let me know and I'll match it exactly.
// ─────────────────────────────────────────────────────────────────────────────

type Step = 0 | 1 | 2 | 3 | 4;

// Matches the fields actually written by saveConnectedAccount() in
// @/lib/firestore. `state` is "connected" | "disconnected" — we only want
// to offer accounts that are currently connected.
type ConnectedAccount = {
  id: string;
  platform: string;
  handle: string;
  avatar?: string;
  followers?: number;
  postsPublished?: number;
  lastPost?: string;
  state?: string;
};

// TODO — CONFIRM: getDashboardStats() in @/lib/firestore uses plan tiers
// "Starter" | "Pro" | "Elite", not "Premium" as named in the product spec.
// Using "Elite" here to match the existing code. If "Premium" is actually
// the intended name, this needs to change everywhere at once (this file,
// getDashboardStats' PLAN_LIMITS, the Plan type, and Settings/Billing) —
// not just here.
const TOP_TIER_PLAN = "Elite";

const GOALS = [
  { id: "awareness", label: "Brand Awareness",   desc: "Get more eyes on your brand" },
  { id: "sales",     label: "Drive Sales",       desc: "Promote products & offers" },
  { id: "engagement",label: "Grow Engagement",   desc: "More likes, comments, shares" },
  { id: "launch",    label: "Product Launch",    desc: "Build hype for something new" },
];

const FREQUENCIES = [
  { id: "light",    label: "Light",    desc: "2–3 posts / week" },
  { id: "standard", label: "Standard", desc: "4–5 posts / week" },
  { id: "daily",    label: "Daily",    desc: "1 post every day" },
];

const SEASONAL_THEMES = [
  "None",
  "Holiday Season",
  "Black Friday / Cyber Monday",
  "New Year",
  "Valentine's Day",
  "Back to School",
  "Custom theme",
];

const GENERATING_MESSAGES = [
  "Reviewing your product media…",
  "Matching images to the right days…",
  "Writing captions in your brand voice…",
  "Building hashtags for each post…",
  "Assembling your monthly calendar…",
];

export default function CampaignWizardModal({
  isOpen, onClose, media,
}: {
  isOpen: boolean;
  onClose: () => void;
  media: FirestoreMediaItem[];
}) {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [seasonalEnabled, setSeasonalEnabled] = useState(false);
  const [seasonalTheme, setSeasonalTheme] = useState("None");
  const [customTheme, setCustomTheme] = useState("");

  const [generating, setGenerating] = useState(false);
  const [genMessageIdx, setGenMessageIdx] = useState(0);
  const [genError, setGenError] = useState<string | null>(null);
  const [usingTestAccount, setUsingTestAccount] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  const isPremium = profile?.plan === TOP_TIER_PLAN;

  // Reset wizard state each time it's opened fresh
  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setGoal(null);
    setFrequency(null);
    setSelectedAccountIds([]);
    setUsingTestAccount(false);
    setSeasonalEnabled(false);
    setSeasonalTheme("None");
    setCustomTheme("");
    setGenerating(false);
    setGenError(null);
  }, [isOpen]);

  // Load connected accounts once, when the wizard opens
  useEffect(() => {
    if (!isOpen || !user) return;
    setAccountsLoading(true);
    getConnectedAccounts(user.uid)
      .then((accs) => {
        const connected = (accs as ConnectedAccount[]).filter((a) => a.state === "connected");
        setAccounts(connected);
      })
      .catch((err: unknown) => {
        console.error("Failed to load connected accounts:", err);
        setAccounts([]);
      })
      .finally(() => setAccountsLoading(false));
  }, [isOpen, user]);

  // Cycle the "what the AI is doing" messages while generating
  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => {
      setGenMessageIdx((i) => (i + 1) % GENERATING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [generating]);

  // Clean up any Firestore listener on unmount
  useEffect(() => {
    return () => { unsubRef.current?.(); };
  }, []);

  if (!isOpen) return null;

  function toggleAccount(id: string) {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function canProceed(): boolean {
    if (step === 0) return !!goal;
    if (step === 1) return !!frequency;
    if (step === 2) return selectedAccountIds.length > 0 || usingTestAccount;
    if (step === 3) return true; // seasonal step is always optional
    return true;
  }

  async function handleGenerate() {
    if (!user) return;
    setGenError(null);
    setGenerating(true);
    setGenMessageIdx(0);

    try {
      const campaignRef = await addDoc(collection(db, "campaigns"), {
        uid: user.uid,
        goal,
        frequency,
        accountIds: usingTestAccount ? [] : selectedAccountIds,
        testMode: usingTestAccount, // no real account connected — generate content for review only, don't attempt to publish
        seasonal: isPremium && seasonalEnabled
          ? { theme: seasonalTheme === "Custom theme" ? customTheme : seasonalTheme }
          : null,
        mediaIds: media.map((m) => m.id),
        status: "generating",
        createdAt: serverTimestamp(),
      });

      // Listen for the backend job to finish and flip status
      const unsub = onSnapshot(
        doc(db, "campaigns", campaignRef.id),
        (snap) => {
          const data = snap.data();
          if (!data) return;

          if (data.status === "complete") {
            unsub();
            router.push(`/dashboard/calendar?campaign=${campaignRef.id}`);
          } else if (data.status === "failed") {
            unsub();
            setGenerating(false);
            setGenError(data.error ?? "Something went wrong while generating your calendar. Please try again.");
          }
        },
        (err) => {
          console.error("Campaign listener error:", err);
          setGenerating(false);
          setGenError("Lost connection while generating. Please try again.");
        }
      );

      unsubRef.current = unsub;
    } catch (err) {
      console.error("Failed to start campaign generation:", err);
      setGenerating(false);
      setGenError("Couldn't start generation. Please try again.");
    }
  }

  const noAccountsConnected = !accountsLoading && accounts.length === 0;

  return (
    <div
      onClick={generating ? undefined : onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--surface-2)", border: "1px solid var(--border-hover)", borderRadius: 20, width: "100%", maxWidth: 520, overflow: "hidden" }}
      >
        {/* ── Generating overlay state ─────────────────────────────────────── */}
        {generating ? (
          <div style={{ padding: "48px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--green-muted)", border: "1px solid rgba(0,201,141,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Spinner size={24} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-sora), sans-serif", marginBottom: 6 }}>
                Building your monthly campaign
              </p>
              <p style={{ fontSize: 13, color: "var(--text-3)", minHeight: 18 }}>
                {GENERATING_MESSAGES[genMessageIdx]}
              </p>
            </div>
            {genError && (
              <div style={{ width: "100%", padding: "10px 14px", background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 10, fontSize: 13, color: "#e24b4a" }}>
                {genError}
                <button
                  onClick={() => { setGenerating(false); setGenError(null); }}
                  style={{ display: "block", marginTop: 8, background: "none", border: "none", color: "#e24b4a", fontWeight: 600, cursor: "pointer", fontSize: 13, textDecoration: "underline" }}
                >
                  Back to campaign setup
                </button>
              </div>
            )}
            <p style={{ fontSize: 11, color: "var(--text-3)" }}>
              This can take a minute for a full month of content — feel free to leave this open.
            </p>
          </div>
        ) : (
          <>
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-sora), sans-serif" }}>Create Monthly Campaign</p>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Step {step + 1} of 4</p>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4, display: "flex", borderRadius: 6 }}>
                <CloseIcon />
              </button>
            </div>

            {/* Progress dots */}
            <div style={{ display: "flex", gap: 6, padding: "14px 22px 0" }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= step ? "var(--green)" : "var(--surface-4)" }} />
              ))}
            </div>

            {/* ── Step body ────────────────────────────────────────────────── */}
            <div style={{ padding: "20px 22px", minHeight: 260 }}>

              {step === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 6 }}>What's the main goal for this month's content?</p>
                  {GOALS.map((g) => (
                    <OptionCard key={g.id} selected={goal === g.id} onClick={() => setGoal(g.id)} label={g.label} desc={g.desc} />
                  ))}
                </div>
              )}

              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 6 }}>How often should we post?</p>
                  {FREQUENCIES.map((f) => (
                    <OptionCard key={f.id} selected={frequency === f.id} onClick={() => setFrequency(f.id)} label={f.label} desc={f.desc} />
                  ))}
                </div>
              )}

              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 6 }}>Which accounts should this publish to?</p>
                  {accountsLoading ? (
                    <p style={{ fontSize: 13, color: "var(--text-3)" }}>Loading connected accounts…</p>
                  ) : noAccountsConnected ? (
                    <div style={{ padding: "20px 16px", background: "var(--surface-3)", borderRadius: 12, textAlign: "center" }}>
                      <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 8 }}>No accounts connected yet.</p>
                      <a href="/dashboard/accounts" style={{ fontSize: 13, color: "var(--green)", textDecoration: "none", fontWeight: 600 }}>
                        Connect an account →
                      </a>

                      {/* DEV-ONLY testing bypass — Connected Accounts/OAuth isn't
                          built yet, so this lets the rest of the campaign flow
                          be tested without a real account. Gated on NODE_ENV so
                          it can't accidentally ship visible in production. */}
                      {process.env.NODE_ENV !== "production" && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--border)" }}>
                          <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={usingTestAccount}
                              onChange={(e) => setUsingTestAccount(e.target.checked)}
                            />
                            <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                              🧪 Skip for testing (no real account, won't actually publish)
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    accounts.map((a) => (
                      <OptionCard
                        key={a.id}
                        selected={selectedAccountIds.includes(a.id)}
                        onClick={() => toggleAccount(a.id)}
                        label={a.platform}
                        desc={a.handle}
                        multiSelect
                      />
                    ))
                  )}
                </div>
              )}

              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 13, color: "var(--text-2)" }}>Want to theme this month around a seasonal campaign?</p>

                  {!isPremium ? (
                    <div style={{ padding: "16px", background: "var(--surface-3)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>Seasonal campaigns are a Premium feature</p>
                        <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>We'll build a standard monthly plan instead.</p>
                      </div>
                      <a href="/dashboard/settings?tab=billing" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap" }}>Upgrade →</a>
                    </div>
                  ) : (
                    <>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                        <input type="checkbox" checked={seasonalEnabled} onChange={(e) => setSeasonalEnabled(e.target.checked)} />
                        <span style={{ fontSize: 13, color: "var(--text-2)" }}>Yes, build this month around a theme</span>
                      </label>

                      {seasonalEnabled && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <select
                            value={seasonalTheme}
                            onChange={(e) => setSeasonalTheme(e.target.value)}
                            style={{ padding: "9px 12px", background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, color: "var(--text-1)", outline: "none", colorScheme: "dark" }}
                          >
                            {SEASONAL_THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                          {seasonalTheme === "Custom theme" && (
                            <input
                              type="text"
                              value={customTheme}
                              onChange={(e) => setCustomTheme(e.target.value)}
                              placeholder="e.g. Store anniversary, local festival…"
                              style={{ padding: "9px 12px", background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, color: "var(--text-1)", outline: "none" }}
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── Footer nav ───────────────────────────────────────────────── */}
            <div style={{ padding: "16px 22px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => step > 0 ? setStep((s) => (s - 1) as Step) : onClose()}
                style={{ padding: "9px 16px", background: "none", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, color: "var(--text-2)", cursor: "pointer" }}
              >
                {step > 0 ? "Back" : "Cancel"}
              </button>

              {step < 3 ? (
                <button
                  onClick={() => canProceed() && setStep((s) => (s + 1) as Step)}
                  disabled={!canProceed()}
                  style={{ padding: "9px 18px", background: canProceed() ? "var(--green)" : "var(--surface-4)", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: canProceed() ? "#0a0e14" : "var(--text-3)", cursor: canProceed() ? "pointer" : "not-allowed" }}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  style={{ padding: "9px 18px", background: "var(--green)", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#0a0e14", cursor: "pointer" }}
                >
                  Generate My Calendar ✨
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function OptionCard({
  selected, onClick, label, desc, multiSelect,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  desc: string;
  multiSelect?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 14px",
        border: `1px solid ${selected ? "var(--green)" : "var(--border)"}`,
        background: selected ? "var(--green-muted)" : "var(--surface-3)",
        borderRadius: 12, cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
      }}
    >
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{label}</p>
        <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>{desc}</p>
      </div>
      <div style={{
        width: 18, height: 18, flexShrink: 0,
        borderRadius: multiSelect ? 5 : "50%",
        border: `1.5px solid ${selected ? "var(--green)" : "var(--border-hover)"}`,
        background: selected ? "var(--green)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0e14" strokeWidth="4" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
    </div>
  );
}

function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function Spinner({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
}