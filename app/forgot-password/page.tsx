"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Step = "form" | "sent";

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep]     = useState<Step>("form");
  const [error, setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // TODO: Firebase — sendPasswordResetEmail(auth, email)
      await new Promise((r) => setTimeout(r, 1400)); // remove when wiring Firebase
      setStep("sent");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--surface-2)",
          border: "1px solid var(--border-hover)",
          borderRadius: 24,
          padding: "40px 36px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo2.png" alt="logo" width={150} height={50} />
          </Link>
        </div>

        {step === "form" ? (
          <FormStep
            email={email}
            setEmail={setEmail}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
          />
        ) : (
          <SentStep email={email} onResend={() => setStep("form")} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Email form
// ─────────────────────────────────────────────────────────────────────────────
function FormStep({
  email, setEmail, loading, error, onSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <>
      {/* Heading */}
      <div style={{ textAlign: "center" }}>
        {/* Icon */}
        <div
          style={{
            width: 52, height: 52, borderRadius: 14,
            background: "var(--green-muted)",
            border: "1px solid rgba(0,201,141,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-sora), sans-serif",
            fontWeight: 700, fontSize: 22,
            color: "var(--text-1)",
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          Forgot your password?
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>
          Enter your email and we&apos;ll send you a link to reset it.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Email input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>
            Email address
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 14px",
              background: "var(--surface-3)",
              border: `1px solid ${error ? "#e24b4a" : "var(--border-hover)"}`,
              borderRadius: 10,
              fontSize: 14,
              color: "var(--text-1)",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              if (!error) e.target.style.borderColor = "var(--green)";
            }}
            onBlur={(e) => {
              if (!error) e.target.style.borderColor = "var(--border-hover)";
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px",
              background: "rgba(226,75,74,0.08)",
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
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: "var(--green)",
            border: "none",
            borderRadius: 12,
            fontSize: 14, fontWeight: 600,
            color: "#0a0e14",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "opacity 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {loading && <Spinner />}
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      {/* Back to login */}
      <div style={{ textAlign: "center" }}>
        <Link
          href="/login"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "var(--text-2)",
            textDecoration: "none", transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to log in
        </Link>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Success state
// ─────────────────────────────────────────────────────────────────────────────
function SentStep({ email, onResend }: { email: string; onResend: () => void }) {
  return (
    <>
      {/* Success icon + message */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>

        {/* Animated check circle */}
        <div
          style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "var(--green-muted)",
            border: "1px solid rgba(0,201,141,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <div>
          <h2
            style={{
              fontFamily: "var(--font-sora), sans-serif",
              fontWeight: 700, fontSize: 21,
              color: "var(--text-1)",
              letterSpacing: "-0.02em",
              marginBottom: 10,
            }}
          >
            Check your email
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>
            We sent a password reset link to
          </p>
          <p
            style={{
              fontSize: 14, fontWeight: 600,
              color: "var(--text-1)",
              marginTop: 4,
              wordBreak: "break-all",
            }}
          >
            {email}
          </p>
        </div>

        {/* Info box */}
        <div
          style={{
            width: "100%",
            background: "var(--surface-3)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "14px 16px",
            display: "flex", flexDirection: "column", gap: 10,
          }}
        >
          {[
            "Check your spam or junk folder",
            "The link expires in 1 hour",
            "You can only use the link once",
          ].map((tip) => (
            <div key={tip} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span style={{ fontSize: 13, color: "var(--text-2)" }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resend + back */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          type="button"
          onClick={onResend}
          style={{
            width: "100%",
            padding: "12px",
            background: "var(--green)",
            border: "none",
            borderRadius: 12,
            fontSize: 14, fontWeight: 600,
            color: "#0a0e14",
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
        >
          Resend email
        </button>

        <Link
          href="/login"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            width: "100%",
            padding: "12px",
            background: "transparent",
            border: "1px solid var(--border-hover)",
            borderRadius: 12,
            fontSize: 14, fontWeight: 500,
            color: "var(--text-2)",
            textDecoration: "none",
            transition: "color 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-1)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-2)";
            e.currentTarget.style.borderColor = "var(--border-hover)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to log in
        </Link>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="#0a0e14" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}