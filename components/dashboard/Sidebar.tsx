"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// ─── Nav structure ────────────────────────────────────────────────────────────
const NAV_MAIN = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: "Media Library",
    href: "/dashboard/media",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
  {
    label: "AI Captions",
    href: "/dashboard/captions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l1.6 5H19l-4.1 3 1.5 5L12 12l-4.4 3 1.5-5L5 7h5.4z"/>
      </svg>
    ),
    badge: "AI",
  },
  {
    label: "Content Calendar",
    href: "/dashboard/calendar",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: "Schedule & Publish",
    href: "/dashboard/schedule",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    label: "Connected Accounts",
    href: "/dashboard/accounts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
];

const NAV_BOTTOM = [
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
  {
    label: "Help & Support",
    href: "/dashboard/support",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? 68 : 240,
        minHeight: "100vh",
        background: "var(--surface-2)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        overflow: "hidden",
      }}
    >
      {/* ── Logo + collapse toggle ─────────────────────────────────────── */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: collapsed ? "0 14px" : "0 16px 0 20px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          style={{
            display: "flex", alignItems: "center", gap: 9,
            textDecoration: "none", overflow: "hidden", flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: "var(--green)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0e14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          {!collapsed && (
            <span
              style={{
                fontFamily: "var(--font-sora), sans-serif",
                fontWeight: 700, fontSize: 16,
                color: "var(--text-1)",
                whiteSpace: "nowrap",
              }}
            >
              Postora
            </span>
          )}
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-3)", padding: 6, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "color 0.15s, background 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-1)";
            (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)";
            (e.currentTarget as HTMLButtonElement).style.background = "none";
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {/* ── Plan badge ────────────────────────────────────────────────────── */}
      {!collapsed && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 12px",
              background: "var(--green-muted)",
              border: "1px solid rgba(0,201,141,0.15)",
              borderRadius: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "var(--green)",
                  boxShadow: "0 0 6px var(--green)",
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>Pro Plan</span>
            </div>
            <Link
              href="/dashboard/settings?tab=billing"
              style={{ fontSize: 11, color: "var(--text-3)", textDecoration: "none" }}
            >
              Upgrade
            </Link>
          </div>
        </div>
      )}

      {/* ── Main nav ──────────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>

        {!collapsed && (
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-3)", padding: "4px 10px 8px" }}>
            Main
          </p>
        )}

        {NAV_MAIN.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <NavItem
              key={item.href}
              item={item}
              active={active}
              collapsed={collapsed}
            />
          );
        })}
      </nav>

      {/* ── Bottom nav ────────────────────────────────────────────────────── */}
      <div style={{ padding: "10px 10px 16px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_BOTTOM.map((item) => {
          const active = pathname === item.href;
          return (
            <NavItem
              key={item.href}
              item={item}
              active={active}
              collapsed={collapsed}
            />
          );
        })}

        {/* User profile */}
        <div
          style={{
            marginTop: 8,
            display: "flex", alignItems: "center", gap: 10,
            padding: collapsed ? "8px 6px" : "8px 10px",
            borderRadius: 10,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--surface-3)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
        >
          {/* Avatar */}
          <div
            style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #00C98D 0%, #0f6e56 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#0a0e14",
            }}
          >
            JD
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Jane Doe
              </p>
              <p style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                jane@example.com
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Nav item ─────────────────────────────────────────────────────────────────
function NavItem({
  item, active, collapsed,
}: {
  item: { label: string; href: string; icon: React.ReactNode; badge?: string };
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      style={{
        display: "flex", alignItems: "center",
        gap: collapsed ? 0 : 10,
        padding: collapsed ? "9px 0" : "9px 10px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: 10,
        textDecoration: "none",
        fontSize: 13, fontWeight: active ? 600 : 400,
        color: active ? "var(--text-1)" : "var(--text-2)",
        background: active ? "var(--surface-3)" : "transparent",
        transition: "background 0.15s, color 0.15s",
        position: "relative",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface-3)";
          (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-1)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
          (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-2)";
        }
      }}
    >
      {/* Active indicator */}
      {active && (
        <div
          style={{
            position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
            width: 3, height: 18, borderRadius: "0 2px 2px 0",
            background: "var(--green)",
          }}
        />
      )}

      {/* Icon */}
      <span style={{ color: active ? "var(--green)" : "inherit", flexShrink: 0, display: "flex" }}>
        {item.icon}
      </span>

      {/* Label + badge */}
      {!collapsed && (
        <>
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.badge && (
            <span
              style={{
                fontSize: 9, fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 999,
                background: "var(--green-muted)",
                color: "var(--green)",
                border: "1px solid rgba(0,201,141,0.2)",
                letterSpacing: "0.05em",
              }}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}