"use client";

interface AdminTopbarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function AdminTopbar({ title, subtitle, action }: AdminTopbarProps) {
  return (
    <header
      style={{
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px",
        background: "#0a0d14",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0, gap: 16,
      }}
    >
      {/* Title */}
      <div>
        <h1
          style={{
            fontFamily: "var(--font-sora), sans-serif",
            fontSize: 16, fontWeight: 700,
            color: "#f0f4ff",
            letterSpacing: "-0.01em", lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{subtitle}</p>}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Notification bell */}
        <button
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgba(255,255,255,0.4)",
            position: "relative", flexShrink: 0,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span style={{ position: "absolute", top: 7, right: 7, width: 6, height: 6, borderRadius: "50%", background: "#e24b4a", border: "1.5px solid #0a0d14" }} />
        </button>

        {/* Maintenance mode badge */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px",
            background: "rgba(0,201,141,0.08)",
            border: "1px solid rgba(0,201,141,0.15)",
            borderRadius: 9,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00C98D", boxShadow: "0 0 6px #00C98D", display: "inline-block" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#00C98D" }}>Platform live</span>
        </div>

        {action}
      </div>
    </header>
  );
}