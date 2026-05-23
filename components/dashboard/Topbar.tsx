"use client";

import Link from "next/link";

interface TopbarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function Topbar({ title, subtitle, action }: TopbarProps) {
  return (
    <header
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        flexShrink: 0,
        gap: 16,
      }}
    >
      {/* Title */}
      <div>
        <h1
          style={{
            fontFamily: "var(--font-sora), sans-serif",
            fontSize: 17, fontWeight: 700,
            color: "var(--text-1)",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{subtitle}</p>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

        {/* Notifications */}
        <button
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--text-2)",
            position: "relative",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-hover)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)")}
          aria-label="Notifications"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {/* Unread dot */}
          <span
            style={{
              position: "absolute", top: 7, right: 7,
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--green)",
              border: "1.5px solid var(--surface-2)",
            }}
          />
        </button>

        {/* Quick publish button */}
        <Link
          href="/dashboard/schedule"
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 16px",
            background: "var(--green)",
            borderRadius: 10,
            fontSize: 13, fontWeight: 600,
            color: "#0a0e14",
            textDecoration: "none",
            flexShrink: 0,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.88")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New post
        </Link>

        {/* Custom action slot */}
        {action}
      </div>
    </header>
  );
}