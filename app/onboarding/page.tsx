"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase"; // adjust path if your firebase.ts lives elsewhere

// ─── Types ─────────────────────────────────────────────────────────────────
type FormData = {
  businessName: string;
  website: string;
  logoFile: File | null;
  logoPreview: string;
  primaryColor: string;
  secondaryColor: string;
  tone: string;
  description: string;
};

const TONE_OPTIONS = ["Professional", "Playful", "Bold", "Friendly", "Luxury", "Minimal"];

const STEPS = [
  { n: 1, label: "Business" },
  { n: 2, label: "Brand" },
  { n: 3, label: "Voice" },
  { n: 4, label: "Review" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uid, setUid] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormData>({
    businessName: "",
    website: "",
    logoFile: null,
    logoPreview: "",
    primaryColor: "#00C98D",
    secondaryColor: "#0f1117",
    tone: "",
    description: "",
  });

  // ── Auth gate: must be logged in; skip if onboarding already done ────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setUid(user.uid);

      try {
        const snap = await getDoc(doc(db, "businessProfiles", user.uid));
        if (snap.exists() && snap.data()?.onboardingComplete) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // no existing profile yet — that's fine, continue onboarding
      }
      setCheckingAuth(false);
    });
    return () => unsub();
  }, [router]);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    update("logoFile", file);
    update("logoPreview", URL.createObjectURL(file));
  }

  function canAdvance() {
    if (step === 1) return form.businessName.trim().length > 0;
    if (step === 3) return form.tone.length > 0;
    return true;
  }

  async function handleFinish() {
    if (!uid) return;
    setSubmitting(true);
    setError("");

    try {
      let logoUrl = "";
      if (form.logoFile) {
        const logoRef = ref(storage, `logos/${uid}/${form.logoFile.name}`);
        await uploadBytes(logoRef, form.logoFile);
        logoUrl = await getDownloadURL(logoRef);
      }

      await setDoc(
        doc(db, "businessProfiles", uid),
        {
          businessName: form.businessName.trim(),
          website: form.website.trim(),
          logoUrl,
          brandColors: {
            primary: form.primaryColor,
            secondary: form.secondaryColor,
          },
          brandTone: form.tone,
          description: form.description.trim(),
          onboardingComplete: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong saving your details. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAuth) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "var(--surface)", color: "var(--text-2)", fontSize: 14 }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center min-h-screen"
      style={{ background: "var(--surface)", padding: "72px 24px" }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: 40 }}>
          <p className="section-eyebrow">Let&apos;s set up your brand</p>
          <h1
            className="font-display font-bold"
            style={{ fontSize: 32, color: "var(--text-1)", letterSpacing: "-0.02em" }}
          >
            A few quick details
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)", marginTop: 8 }}>
            Postora uses this to keep every AI-generated post on-brand.
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 36 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                  background: step >= s.n ? "var(--green)" : "var(--surface-2)",
                  color: step >= s.n ? "#00251a" : "var(--text-3)",
                  border: step >= s.n ? "none" : "1px solid var(--border)",
                }}
              >
                {s.n}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    margin: "0 8px",
                    background: step > s.n ? "var(--green)" : "var(--border)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: 32,
          }}
        >
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Field label="Business name *">
                <input
                  className="input-field"
                  style={inputStyle}
                  placeholder="e.g. Bloom & Co"
                  value={form.businessName}
                  onChange={(e) => update("businessName", e.target.value)}
                />
              </Field>
              <Field label="Website (optional)">
                <input
                  className="input-field"
                  style={inputStyle}
                  placeholder="https://yourbusiness.com"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Field label="Logo">
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 14,
                      border: "1px dashed var(--border-hover)",
                      background: "var(--surface-3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {form.logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.logoPreview} alt="Logo preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>Upload</span>
                    )}
                  </div>
                  <button type="button" className="btn-ghost" onClick={() => fileInputRef.current?.click()}>
                    {form.logoFile ? "Change logo" : "Choose file"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    style={{ display: "none" }}
                  />
                </div>
              </Field>

              <div className="grid grid-cols-2" style={{ gap: 16 }}>
                <Field label="Primary color">
                  <ColorInput value={form.primaryColor} onChange={(v) => update("primaryColor", v)} />
                </Field>
                <Field label="Secondary color">
                  <ColorInput value={form.secondaryColor} onChange={(v) => update("secondaryColor", v)} />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Field label="Brand tone *">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {TONE_OPTIONS.map((t) => {
                    const active = form.tone === t;
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => update("tone", t)}
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          padding: "8px 16px",
                          borderRadius: 999,
                          border: `1px solid ${active ? "var(--green)" : "var(--border)"}`,
                          background: active ? "rgba(0,201,141,0.12)" : "var(--surface-3)",
                          color: active ? "var(--green)" : "var(--text-2)",
                          cursor: "pointer",
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Business description">
                <textarea
                  className="input-field"
                  style={{ ...inputStyle, minHeight: 100, resize: "vertical", paddingTop: 12 }}
                  placeholder="What do you sell, and who's it for?"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <ReviewRow label="Business name" value={form.businessName || "—"} />
              <ReviewRow label="Website" value={form.website || "—"} />
              <ReviewRow label="Brand tone" value={form.tone || "—"} />
              <ReviewRow label="Description" value={form.description || "—"} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, color: "var(--text-3)", width: 120, flexShrink: 0 }}>Colors</span>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: form.primaryColor, border: "1px solid var(--border)" }} />
                <span style={{ width: 20, height: 20, borderRadius: 6, background: form.secondaryColor, border: "1px solid var(--border)" }} />
              </div>
              {error && <p style={{ fontSize: 13, color: "#ff6b6b" }}>{error}</p>}
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
            <button
              type="button"
              className="btn-ghost"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              style={{ visibility: step === 1 ? "hidden" : "visible" }}
            >
              Back
            </button>

            {step < 4 ? (
              <button
                type="button"
                className="btn-primary"
                disabled={!canAdvance()}
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                style={{ opacity: canAdvance() ? 1 : 0.5 }}
              >
                Continue
              </button>
            ) : (
              <button type="button" className="btn-primary" disabled={submitting} onClick={handleFinish}>
                {submitting ? "Saving…" : "Finish setup"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Small helpers ───────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>{label}</label>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <span style={{ fontSize: 13, color: "var(--text-3)", width: 120, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--text-1)" }}>{value}</span>
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "var(--surface-3)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "8px 12px",
      }}
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 28, height: 28, border: "none", background: "none", padding: 0, cursor: "pointer" }}
      />
      <span style={{ fontSize: 13, color: "var(--text-2)" }}>{value}</span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  padding: "0 14px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--surface-3)",
  color: "var(--text-1)",
  fontSize: 14,
  outline: "none",
};