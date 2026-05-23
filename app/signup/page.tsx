"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const passwordStrength = getPasswordStrength(form.password);

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    setLoading(true);
    // TODO: Firebase — createUserWithEmailAndPassword(auth, form.email, form.password)
    // TODO: Firebase — updateProfile(user, { displayName: form.name })
    setTimeout(() => setLoading(false), 1500);
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    // TODO: Firebase — signInWithPopup(auth, new GoogleAuthProvider())
    setTimeout(() => setGoogleLoading(false), 1500);
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
      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--surface-2)",
          border: "1px solid var(--border-hover)",
          borderRadius: 24,
          padding: "40px 36px",
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        {/* ── Logo + heading ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo2.png" alt="logo" width={150} height={50}/>
          </Link>

          <div>
            <h1
              style={{
                fontFamily: "var(--font-sora), sans-serif",
                fontWeight: 700, fontSize: 22,
                color: "var(--text-1)",
                letterSpacing: "-0.02em",
                marginBottom: 6,
              }}
            >
              Create your account
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-2)" }}>
              Start automating your social media today
            </p>
          </div>
        </div>

        {/* ── Google button ───────────────────────────────────────────────── */}
        <button
          onClick={handleGoogle}
          type="button"
          disabled={googleLoading}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "11px 20px",
            background: "var(--surface-3)",
            border: "1px solid var(--border-hover)",
            borderRadius: 12,
            fontSize: 14, fontWeight: 500,
            color: "var(--text-1)",
            cursor: googleLoading ? "not-allowed" : "pointer",
            transition: "border-color 0.2s, background 0.2s",
            opacity: googleLoading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!googleLoading) {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-4)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.22)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-3)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-hover)";
          }}
        >
          {googleLoading ? <Spinner color="var(--text-2)" /> : <GoogleIcon />}
          {googleLoading ? "Connecting…" : "Continue with Google"}
        </button>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }}/>
          <span style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>or sign up with email</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }}/>
        </div>

        {/* ── Form ────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Full name */}
          <Field label="Full name">
            <Input
              type="text"
              placeholder="Jane Smith"
              value={form.name}
              onChange={set("name")}
              required
            />
          </Field>

          {/* Email */}
          <Field label="Email">
            <Input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              required
            />
          </Field>

          {/* Password */}
          <Field label="Password">
            <div style={{ position: "relative" }}>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={set("password")}
                required
                minLength={8}
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-3)", padding: 4, display: "flex",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Password strength bar */}
            {form.password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: n <= passwordStrength.score
                          ? passwordStrength.color
                          : "var(--surface-4)",
                        transition: "background 0.3s",
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: 11, marginTop: 5, color: passwordStrength.color }}>
                  {passwordStrength.label}
                </p>
              </div>
            )}
          </Field>

          {/* Terms checkbox */}
          <label
            style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              cursor: "pointer", marginTop: 2,
            }}
          >
            <div
              onClick={() => setAgreed(!agreed)}
              style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                background: agreed ? "var(--green)" : "var(--surface-3)",
                border: `1px solid ${agreed ? "var(--green)" : "var(--border-hover)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s, border-color 0.2s",
                cursor: "pointer",
              }}
            >
              {agreed && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0e14" strokeWidth="3.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
              I agree to the{" "}
              <Link href="/terms" style={{ color: "var(--green)", textDecoration: "none" }}>Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" style={{ color: "var(--green)", textDecoration: "none" }}>Privacy Policy</Link>
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !agreed}
            style={{
              marginTop: 4,
              width: "100%",
              padding: "12px",
              background: "var(--green)",
              border: "none",
              borderRadius: 12,
              fontSize: 14, fontWeight: 600,
              color: "#0a0e14",
              cursor: loading || !agreed ? "not-allowed" : "pointer",
              opacity: loading || !agreed ? 0.55 : 1,
              transition: "opacity 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading && <Spinner color="#0a0e14" />}
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        {/* ── Login link ───────────────────────────────────────────────────── */}
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--green)", textDecoration: "none", fontWeight: 500 }}>
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED FIELD + INPUT
// ─────────────────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "11px 14px",
        background: "var(--surface-3)",
        border: "1px solid var(--border-hover)",
        borderRadius: 10,
        fontSize: 14,
        color: "var(--text-1)",
        outline: "none",
        transition: "border-color 0.2s",
        ...style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--green)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--border-hover)";
        props.onBlur?.(e);
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD STRENGTH HELPER
// ─────────────────────────────────────────────────────────────────────────────

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (password.length === 0) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9!@#$%^&*]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak",   color: "#e24b4a" };
  if (score === 2) return { score: 2, label: "Fair",   color: "#ef9f27" };
  if (score === 3) return { score: 3, label: "Good",   color: "#00C98D" };
  return              { score: 4, label: "Strong", color: "#00C98D" };
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────

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

function Spinner({ color = "currentColor" }: { color?: string }) {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}