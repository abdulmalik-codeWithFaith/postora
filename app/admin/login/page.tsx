"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [step, setStep]           = useState<"credentials" | "2fa">("credentials");
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);

  // ── Submit credentials ────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    // TODO: Firebase — signInWithEmailAndPassword(auth, email, password)
    // TODO: verify user has admin role in Firestore before proceeding
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setStep("2fa"); // proceed to 2FA
  }

  // ── Submit OTP ────────────────────────────────────────────────────────────
  async function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the 6-digit code."); return; }
    setError("");
    setLoading(true);
    // TODO: verify OTP code — e.g. Firebase TOTP or custom admin token check
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push("/admin/dashboard");
  }

  // ── OTP input handler ─────────────────────────────────────────────────────
  function handleOtpInput(val: string, idx: number) {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    // auto-focus next box
    if (val && idx < 5) {
      const el = document.getElementById(`otp-${idx + 1}`);
      el?.focus();
    }
  }

  function handleOtpKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const el = document.getElementById(`otp-${idx - 1}`);
      el?.focus();
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0d14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "20%", left: "50%",
          transform: "translateX(-50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse at center, rgba(226,75,74,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>

        {/* ── Logo ───────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: 14,
              background: "#e24b4a",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(226,75,74,0.3)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 700, fontSize: 18, color: "#f0f4ff" }}>
              Postora Admin
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>
              Restricted access — authorised personnel only
            </p>
          </div>
        </div>

        {/* ── Card ───────────────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 24,
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
            backdropFilter: "blur(12px)",
          }}
        >
          {step === "credentials" ? (
            <>
              {/* Header */}
              <div>
                <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 20, fontWeight: 700, color: "#f0f4ff", marginBottom: 6 }}>
                  Sign in
                </h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                  Enter your admin credentials to continue
                </p>
              </div>

              {/* Error */}
              {error && <ErrorBanner message={error} />}

              {/* Form */}
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Email */}
                <AdminField label="Email address">
                  <AdminInput
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="admin@postora.co"
                  />
                </AdminField>

                {/* Password */}
                <AdminField label="Password">
                  <div style={{ position: "relative" }}>
                    <AdminInput
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={setPassword}
                      placeholder="••••••••••"
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", padding: 4 }}
                    >
                      {showPw
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </AdminField>

                {/* Forgot */}
                <div style={{ textAlign: "right", marginTop: -8 }}>
                  <Link href="/" style={{ fontSize: 12, color: "#e24b4a", textDecoration: "none" }}>
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", padding: "13px",
                    background: "#e24b4a", border: "none", borderRadius: 12,
                    fontSize: 14, fontWeight: 700, color: "#fff",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "opacity 0.2s",
                    boxShadow: "0 4px 16px rgba(226,75,74,0.25)",
                  }}
                >
                  {loading && <Spinner />}
                  {loading ? "Verifying…" : "Sign in to admin"}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* 2FA step */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: "rgba(226,75,74,0.1)",
                    border: "1px solid rgba(226,75,74,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e24b4a" strokeWidth="2" strokeLinecap="round">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                </div>
                <h2 style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 18, fontWeight: 700, color: "#f0f4ff", marginBottom: 8 }}>
                  Two-factor authentication
                </h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              {error && <ErrorBanner message={error} />}

              <form onSubmit={handleOtp} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* OTP boxes */}
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpInput(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      style={{
                        width: 46, height: 54,
                        textAlign: "center",
                        fontSize: 20, fontWeight: 700,
                        fontFamily: "var(--font-sora), sans-serif",
                        color: "#f0f4ff",
                        background: "rgba(255,255,255,0.05)",
                        border: `1px solid ${digit ? "rgba(226,75,74,0.5)" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: 12,
                        outline: "none",
                        transition: "border-color 0.15s",
                        caretColor: "#e24b4a",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#e24b4a")}
                      onBlur={(e) => (e.target.style.borderColor = digit ? "rgba(226,75,74,0.5)" : "rgba(255,255,255,0.1)")}
                    />
                  ))}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  style={{
                    width: "100%", padding: "13px",
                    background: "#e24b4a", border: "none", borderRadius: 12,
                    fontSize: 14, fontWeight: 700, color: "#fff",
                    cursor: loading || otp.join("").length < 6 ? "not-allowed" : "pointer",
                    opacity: loading || otp.join("").length < 6 ? 0.5 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "opacity 0.2s",
                    boxShadow: "0 4px 16px rgba(226,75,74,0.25)",
                  }}
                >
                  {loading && <Spinner />}
                  {loading ? "Verifying…" : "Verify & enter"}
                </button>

                {/* Back */}
                <button
                  type="button"
                  onClick={() => { setStep("credentials"); setOtp(["","","","","",""]); setError(""); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: "rgba(255,255,255,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Back to sign in
                </button>
              </form>
            </>
          )}
        </div>

        {/* ── Security notice ─────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: 20, padding: "12px 16px",
            background: "rgba(226,75,74,0.06)",
            border: "1px solid rgba(226,75,74,0.12)",
            borderRadius: 12,
            display: "flex", alignItems: "flex-start", gap: 10,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e24b4a" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
            This area is restricted. Unauthorised access attempts are logged and monitored. If you're a regular user,{" "}
            <Link href="/login" style={{ color: "#e24b4a", textDecoration: "none" }}>sign in here</Link> instead.
          </p>
        </div>

        {/* ── Back to home ─────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link
            href="/"
            style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Postora
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED
// ─────────────────────────────────────────────────────────────────────────────
function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>{label}</label>
      {children}
    </div>
  );
}

function AdminInput({
  type = "text", value, onChange, placeholder, style,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "11px 14px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10, fontSize: 14,
        color: "#f0f4ff", outline: "none",
        transition: "border-color 0.2s",
        fontFamily: "inherit",
        ...style,
      }}
      onFocus={(e) => (e.target.style.borderColor = "#e24b4a")}
      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
    />
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px",
        background: "rgba(226,75,74,0.1)",
        border: "1px solid rgba(226,75,74,0.2)",
        borderRadius: 10,
        fontSize: 13, color: "#e24b4a",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {message}
    </div>
  );
}

function Spinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}