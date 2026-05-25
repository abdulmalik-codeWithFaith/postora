"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState(false); // shows resend button
  const [resendSent, setResendSent] = useState(false);

  // ── Email / password login ─────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setUnverified(false);
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      // Block login if email not verified
      if (!user.emailVerified) {
        await signOut(auth); // kick them out immediately
        setUnverified(true);
        setError("Please verify your email before logging in.");
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(parseFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  }

  // ── Google login ───────────────────────────────────────────────────────────
  async function handleGoogle() {
    setError("");
    setUnverified(false);
    setGoogleLoading(true);

    try {
      // Google accounts are always pre-verified
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(parseFirebaseError(err.code));
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  // ── Resend verification email ──────────────────────────────────────────────
  async function handleResend() {
    setError("");
    try {
      // Sign in temporarily just to get the user object, then sign out again
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(user, {
        url: `${window.location.origin}/dashboard`,
      });
      await signOut(auth);
      setResendSent(true);
    } catch {
      setError("Could not resend email. Please try again.");
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
        padding: "24px 16px",
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
        {/* Logo + heading */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo2.png" alt="logo" width={150} height={50} />
          </Link>
          <div>
            <h1 style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 700, fontSize: 22, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 6 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>Log in to your Postora account</p>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ padding: "12px 14px", background: "rgba(226,75,74,0.12)", border: "1px solid rgba(226,75,74,0.3)", borderRadius: 10, fontSize: 13, color: "#e24b4a", display: "flex", flexDirection: "column", gap: 8 }}>
            <span>{error}</span>

            {/* Resend verification option */}
            {unverified && (
              resendSent
                ? <span style={{ color: "#00C98D", fontSize: 12 }}>✓ Verification email sent — check your inbox.</span>
                : (
                  <button
                    onClick={handleResend}
                    style={{ alignSelf: "flex-start", background: "none", border: "none", cursor: "pointer", color: "#ef9f27", fontSize: 12, fontWeight: 600, padding: 0, textDecoration: "underline" }}
                  >
                    Resend verification email
                  </button>
                )
            )}
          </div>
        )}

        {/* Google button */}
        <button
          onClick={handleGoogle}
          type="button"
          disabled={googleLoading}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "11px 20px", background: "var(--surface-3)", border: "1px solid var(--border-hover)",
            borderRadius: 12, fontSize: 14, fontWeight: 500, color: "var(--text-1)",
            cursor: googleLoading ? "not-allowed" : "pointer", opacity: googleLoading ? 0.7 : 1,
            transition: "border-color 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => { if (!googleLoading) { e.currentTarget.style.background = "var(--surface-4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.borderColor = "var(--border-hover)"; }}
        >
          {googleLoading ? <Spinner /> : <GoogleIcon />}
          {googleLoading ? "Connecting…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>or continue with email</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>Email</label>
            <input
              type="email" required placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", background: "var(--surface-3)", border: "1px solid var(--border-hover)", borderRadius: 10, fontSize: 14, color: "var(--text-1)", outline: "none", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"} required placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "11px 42px 11px 14px", background: "var(--surface-3)", border: "1px solid var(--border-hover)", borderRadius: 10, fontSize: 14, color: "var(--text-1)", outline: "none", transition: "border-color 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4, display: "flex" }}
                aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{ marginTop: 4, width: "100%", padding: "12px", background: "var(--green)", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#0a0e14", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1, transition: "background 0.2s, opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading && <Spinner />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "var(--green)", textDecoration: "none", fontWeight: 500 }}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}

// ── Firebase error parser ─────────────────────────────────────────────────────
function parseFirebaseError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/popup-blocked":
      return "Popup was blocked. Please allow popups and try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// ── Icons (unchanged) ─────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}