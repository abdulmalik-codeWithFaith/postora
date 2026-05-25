"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

// ─── Nav structure (unchanged) ────────────────────────────────────────────────
const NAV_MAIN = [
  {
    label: "Dashboard", href: "/dashboard",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    label: "Media Library", href: "/dashboard/media",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  },
  {
    label: "AI Captions", href: "/dashboard/captions", badge: "AI",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.6 5H19l-4.1 3 1.5 5L12 12l-4.4 3 1.5-5L5 7h5.4z"/></svg>,
  },
  {
    label: "Content Calendar", href: "/dashboard/calendar",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    label: "Schedule & Publish", href: "/dashboard/schedule",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  {
    label: "Analytics", href: "/dashboard/analytics",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    label: "Connected Accounts", href: "/dashboard/accounts",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  },
];

const NAV_BOTTOM = [
  {
    label: "Settings", href: "/dashboard/settings",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
  {
    label: "Help & Support", href: "/dashboard/support",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
];

const MOBILE_NAV_ITEMS = [NAV_MAIN[0], NAV_MAIN[1], NAV_MAIN[2], NAV_MAIN[4], NAV_MAIN[5]];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Listen to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/login"); // redirect if not logged in
      } else {
        setUser(u);
      }
    });
    return () => unsub();
  }, [router]);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut(auth);
    router.replace("/login");
  }

  const initials = getInitials(user?.displayName ?? null, user?.email ?? null);
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const email = user?.email ?? "";
  const photoURL = user?.photoURL ?? null;

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside
        style={{ width: collapsed ? 68 : 240, minHeight: "100vh", background: "var(--surface-2)", borderRight: "1px solid var(--border)", flexDirection: "column", transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)", flexShrink: 0, position: "sticky", top: 0, overflow: "hidden" }}
        className="postora-sidebar"
      >
        {/* Logo + collapse toggle */}
        <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: collapsed ? "0 14px" : "0 16px 0 20px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", overflow: "hidden", flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0e14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            {!collapsed && <span style={{ fontFamily: "var(--font-sora), sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-1)", whiteSpace: "nowrap" }}>Postora</span>}
          </Link>
          <button onClick={() => setCollapsed(!collapsed)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 6, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.15s, background 0.15s", flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-1)"; e.currentTarget.style.background = "var(--surface-3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.background = "none"; }}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>

        {/* Plan badge */}
        {!collapsed && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--green-muted)", border: "1px solid rgba(0,201,141,0.15)", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>Pro Plan</span>
              </div>
              <Link href="/dashboard/settings?tab=billing" style={{ fontSize: 11, color: "var(--text-3)", textDecoration: "none" }}>Upgrade</Link>
            </div>
          </div>
        )}

        {/* Main nav */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
          {!collapsed && <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-3)", padding: "4px 10px 8px" }}>Main</p>}
          {NAV_MAIN.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return <NavItem key={item.href} item={item} active={active} collapsed={collapsed} />;
          })}
        </nav>

        {/* Bottom nav */}
        <div style={{ padding: "10px 10px 16px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_BOTTOM.map((item) => {
            const active = pathname === item.href;
            return <NavItem key={item.href} item={item} active={active} collapsed={collapsed} />;
          })}

          {/* ── User profile + menu ───────────────────────────────────────── */}
          <div ref={menuRef} style={{ position: "relative", marginTop: 8 }}>

            {/* User card (click to open menu) */}
            <div
              onClick={() => setUserMenuOpen((v) => !v)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "8px 6px" : "8px 10px", borderRadius: 10, cursor: "pointer", transition: "background 0.15s", background: userMenuOpen ? "var(--surface-3)" : "transparent" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--surface-3)")}
              onMouseLeave={(e) => { if (!userMenuOpen) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >
              {/* Avatar — photo if Google, initials otherwise */}
              <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, overflow: "hidden", background: "linear-gradient(135deg, #00C98D 0%, #0f6e56 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#0a0e14" }}>
                {photoURL
                  ? <img src={photoURL} alt="avatar" width={30} height={30} style={{ borderRadius: "50%", objectFit: "cover" }} />
                  : initials
                }
              </div>

              {!collapsed && (
                <>
                  <div style={{ overflow: "hidden", flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</p>
                    <p style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</p>
                  </div>
                  {/* Chevron indicator */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </>
              )}
            </div>

            {/* Dropdown menu */}
            {userMenuOpen && (
              <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: 0, right: 0, background: "var(--surface-3)", border: "1px solid var(--border-hover)", borderRadius: 12, padding: "6px", zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>

                {/* Email header */}
                <div style={{ padding: "8px 10px 10px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                  <p style={{ fontSize: 11, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p>
                </div>

                <MenuLink href="/dashboard/settings" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>} label="Settings" />
                <MenuLink href="/dashboard/settings?tab=billing" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>} label="Billing" />

                {/* Divider */}
                <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />

                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "none", border: "none", cursor: signingOut ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 500, color: "#e24b4a", opacity: signingOut ? 0.6 : 1, transition: "background 0.15s" }}
                  onMouseEnter={(e) => { if (!signingOut) e.currentTarget.style.background = "rgba(226,75,74,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                >
                  {signingOut
                    ? <Spinner />
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  }
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Bar ───────────────────────────────────────────────── */}
      <nav className="postora-bottom-bar">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`postora-bottom-bar__item${active ? " postora-bottom-bar__item--active" : ""}`}>
              <span className="postora-bottom-bar__icon">{item.icon}</span>
              <span className="postora-bottom-bar__label">{item.label}</span>
              {item.badge && <span className="postora-bottom-bar__badge">{item.badge}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Responsive styles (unchanged) */}
      <style>{`
        .postora-sidebar { display: flex !important; }
        .postora-bottom-bar { display: none; }
        @media (max-width: 768px) {
          .postora-sidebar { display: none !important; }
          .postora-bottom-bar { display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: var(--surface-2); border-top: 1px solid var(--border); padding-bottom: env(safe-area-inset-bottom, 0px); }
          .postora-bottom-bar__item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 10px 4px 8px; text-decoration: none; color: var(--text-3); font-size: 10px; font-weight: 500; transition: color 0.15s; position: relative; -webkit-tap-highlight-color: transparent; }
          .postora-bottom-bar__item--active { color: var(--green); }
          .postora-bottom-bar__item--active::before { content: ""; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 24px; height: 2px; border-radius: 0 0 2px 2px; background: var(--green); }
          .postora-bottom-bar__icon { display: flex; align-items: center; justify-content: center; color: inherit; }
          .postora-bottom-bar__label { font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60px; text-align: center; }
          .postora-bottom-bar__badge { position: absolute; top: 6px; right: calc(50% - 16px); font-size: 8px; font-weight: 700; padding: 1px 4px; border-radius: 999px; background: var(--green-muted); color: var(--green); border: 1px solid rgba(0,201,141,0.2); letter-spacing: 0.04em; line-height: 1.4; }
        }
      `}</style>
    </>
  );
}

// ─── Menu link helper ─────────────────────────────────────────────────────────
function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href}
      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 500, color: "var(--text-2)", transition: "background 0.15s, color 0.15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-4)"; e.currentTarget.style.color = "var(--text-1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-2)"; }}>
      {icon}
      {label}
    </Link>
  );
}

// ─── Nav item (unchanged) ─────────────────────────────────────────────────────
function NavItem({ item, active, collapsed }: { item: { label: string; href: string; icon: React.ReactNode; badge?: string }; active: boolean; collapsed: boolean }) {
  return (
    <Link href={item.href} title={collapsed ? item.label : undefined}
      style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, padding: collapsed ? "9px 0" : "9px 10px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "var(--text-1)" : "var(--text-2)", background: active ? "var(--surface-3)" : "transparent", transition: "background 0.15s, color 0.15s", position: "relative", whiteSpace: "nowrap" }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "var(--surface-3)"; e.currentTarget.style.color = "var(--text-1)"; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; } }}>
      {active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: "0 2px 2px 0", background: "var(--green)" }} />}
      <span style={{ color: active ? "var(--green)" : "inherit", flexShrink: 0, display: "flex" }}>{item.icon}</span>
      {!collapsed && (
        <>
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.badge && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "var(--green-muted)", color: "var(--green)", border: "1px solid rgba(0,201,141,0.2)", letterSpacing: "0.05em" }}>{item.badge}</span>}
        </>
      )}
    </Link>
  );
}

function ChevronLeft() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevronRight() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>; }
function Spinner() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>; }