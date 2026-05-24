"use client";

import { useState } from "react";
import Topbar from "@/components/dashboard/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type PlatformName = "Instagram" | "TikTok" | "Facebook" | "Twitter / X";
type ConnectState = "connected" | "disconnected" | "connecting" | "error";

interface Account {
  id: number;
  platform: PlatformName;
  handle: string;
  avatar: string;
  followers: string;
  postsPublished: number;
  lastPost: string;
  state: ConnectState;
  planRequired: "Starter" | "Pro" | "Elite";
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 1,
    platform: "Instagram",
    handle: "@mybrand",
    avatar: "MB",
    followers: "4.2K",
    postsPublished: 24,
    lastPost: "May 23, 2026",
    state: "connected",
    planRequired: "Starter",
  },
  {
    id: 2,
    platform: "TikTok",
    handle: "@mybrand",
    avatar: "MB",
    followers: "1.8K",
    postsPublished: 14,
    lastPost: "May 22, 2026",
    state: "connected",
    planRequired: "Pro",
  },
  {
    id: 3,
    platform: "Facebook",
    handle: "",
    avatar: "",
    followers: "",
    postsPublished: 0,
    lastPost: "—",
    state: "disconnected",
    planRequired: "Pro",
  },
  {
    id: 4,
    platform: "Twitter / X",
    handle: "",
    avatar: "",
    followers: "",
    postsPublished: 0,
    lastPost: "—",
    state: "disconnected",
    planRequired: "Elite",
  },
];

const PLATFORM_CONFIG: Record<PlatformName, { color: string; bg: string; icon: React.ReactNode; desc: string }> = {
  Instagram: {
    color: "#E1306C",
    bg: "rgba(225,48,108,0.08)",
    desc: "Share photos, reels, and stories",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="#E1306C" stroke="none"/>
      </svg>
    ),
  },
  TikTok: {
    color: "#69C9D0",
    bg: "rgba(105,201,208,0.08)",
    desc: "Short-form video content",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#69C9D0">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.15a8.16 8.16 0 0 0 4.77 1.52V7.22a4.85 4.85 0 0 1-1-.53z"/>
      </svg>
    ),
  },
  Facebook: {
    color: "#1877F2",
    bg: "rgba(24,119,242,0.08)",
    desc: "Reach your Facebook page audience",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  "Twitter / X": {
    color: "#888",
    bg: "rgba(255,255,255,0.05)",
    desc: "Post tweets and threads",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#888">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
};

// ─── Current plan (mock) ──────────────────────────────────────────────────────
const USER_PLAN = "Pro"; // Starter | Pro | Elite
const PLAN_LIMITS: Record<string, number> = { Starter: 1, Pro: 3, Elite: 4 };

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [disconnectModal, setDisconnectModal] = useState<Account | null>(null);
  const [reconnectModal, setReconnectModal]   = useState<Account | null>(null);

  const connectedCount = accounts.filter((a) => a.state === "connected").length;
  const planLimit      = PLAN_LIMITS[USER_PLAN];

  // ── Connect ──────────────────────────────────────────────────────────────────
  function connectAccount(id: number) {
    setAccounts((prev) =>
      prev.map((a) => a.id === id ? { ...a, state: "connecting" } : a)
    );
    // TODO: OAuth flow — redirect to platform auth URL
    // window.location.href = `/api/auth/${platform.toLowerCase()}`
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                state: "connected",
                handle: "@mybrand",
                avatar: "MB",
                followers: a.platform === "Facebook" ? "890" : "320",
                postsPublished: 0,
                lastPost: "Never",
              }
            : a
        )
      );
    }, 2000);
  }

  // ── Disconnect ───────────────────────────────────────────────────────────────
  function disconnectAccount(id: number) {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, state: "disconnected", handle: "", avatar: "", followers: "", postsPublished: 0, lastPost: "—" }
          : a
      )
    );
    setDisconnectModal(null);
  }

  return (
    <>
      <Topbar
        title="Connected Accounts"
        subtitle={`${connectedCount} of ${planLimit} platforms connected on ${USER_PLAN} plan`}
      />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Plan usage bar ────────────────────────────────────────────────── */}
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "20px 24px",
            display: "flex", alignItems: "center", gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>
                Platform slots used
              </p>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>
                {connectedCount} / {planLimit}
              </span>
            </div>
            <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${(connectedCount / planLimit) * 100}%`,
                  background: connectedCount >= planLimit ? "#e24b4a" : "var(--green)",
                  borderRadius: 3,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>
              {connectedCount >= planLimit
                ? "You've reached your plan limit. Upgrade to connect more platforms."
                : `${planLimit - connectedCount} slot${planLimit - connectedCount > 1 ? "s" : ""} remaining on your ${USER_PLAN} plan`}
            </p>
          </div>

          {/* Current plan badge */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 18px",
              background: "var(--green-muted)",
              border: "1px solid rgba(0,201,141,0.2)",
              borderRadius: 12,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>{USER_PLAN} Plan</span>
            </div>
            <div style={{ width: 1, height: 20, background: "rgba(0,201,141,0.2)" }} />
            <a
              href="/dashboard/settings?tab=billing"
              style={{ fontSize: 12, color: "var(--green)", textDecoration: "none", fontWeight: 500 }}
            >
              Upgrade →
            </a>
          </div>
        </div>

        {/* ── Accounts grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
          {accounts.map((account) => {
            const cfg         = PLATFORM_CONFIG[account.platform];
            const isConnected = account.state === "connected";
            const isConnecting = account.state === "connecting";
            const isError     = account.state === "error";
            const needsUpgrade = !isConnected && !isConnecting &&
              (account.planRequired === "Elite" && USER_PLAN !== "Elite") ||
              (account.planRequired === "Pro" && USER_PLAN === "Starter");
            const atLimit     = !isConnected && connectedCount >= planLimit;

            return (
              <div
                key={account.id}
                style={{
                  background: "var(--surface-2)",
                  border: `1px solid ${isConnected ? "rgba(0,201,141,0.15)" : "var(--border)"}`,
                  borderRadius: 18,
                  padding: 24,
                  display: "flex", flexDirection: "column", gap: 20,
                  transition: "border-color 0.2s",
                }}
              >
                {/* ── Header ─────────────────────────────────────────────── */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Platform icon */}
                    <div
                      style={{
                        width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                        background: cfg.bg,
                        border: `1px solid ${cfg.color}25`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {cfg.icon}
                    </div>

                    <div>
                      <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 3 }}>
                        {account.platform}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--text-3)" }}>{cfg.desc}</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <StatusBadge state={account.state} />
                </div>

                {/* ── Account info (if connected) ─────────────────────────── */}
                {isConnected && (
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px",
                      background: "var(--surface-3)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                        background: `linear-gradient(135deg, ${cfg.color}88, ${cfg.color}44)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: "#fff",
                      }}
                    >
                      {account.avatar}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{account.handle}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{account.followers} followers</p>
                    </div>

                    <div style={{ height: 32, width: 1, background: "var(--border)" }} />

                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-1)" }}>{account.postsPublished}</p>
                      <p style={{ fontSize: 10, color: "var(--text-3)" }}>posts</p>
                    </div>
                  </div>
                )}

                {/* ── Last post (if connected) ────────────────────────────── */}
                {isConnected && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <p style={{ fontSize: 12, color: "var(--text-3)" }}>
                      Last posted: <span style={{ color: "var(--text-2)", fontWeight: 500 }}>{account.lastPost}</span>
                    </p>
                  </div>
                )}

                {/* ── Upgrade notice ──────────────────────────────────────── */}
                {needsUpgrade && (
                  <div
                    style={{
                      padding: "11px 14px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border-hover)",
                      borderRadius: 10,
                      display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    <LockIcon />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)" }}>
                        Requires <span style={{ color: "var(--green)" }}>{account.planRequired} plan</span>
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
                        Upgrade to connect {account.platform}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── At limit notice ─────────────────────────────────────── */}
                {atLimit && !needsUpgrade && !isConnected && (
                  <div
                    style={{
                      padding: "11px 14px",
                      background: "rgba(226,75,74,0.07)",
                      border: "1px solid rgba(226,75,74,0.15)",
                      borderRadius: 10,
                      fontSize: 12, color: "#e24b4a",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    <InfoIcon color="#e24b4a" />
                    You've reached your {USER_PLAN} plan limit ({planLimit} platforms).
                    <a href="/dashboard/settings?tab=billing" style={{ color: "#e24b4a", fontWeight: 600, textDecoration: "underline" }}>Upgrade</a>
                  </div>
                )}

                {/* ── Action button ───────────────────────────────────────── */}
                <div style={{ display: "flex", gap: 10 }}>
                  {isConnected ? (
                    <>
                      <button
                        onClick={() => setReconnectModal(account)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "var(--surface-3)",
                          border: "1px solid var(--border-hover)",
                          borderRadius: 10,
                          fontSize: 13, fontWeight: 500, color: "var(--text-2)",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          transition: "border-color 0.15s",
                        }}
                      >
                        <RefreshIcon /> Reconnect
                      </button>
                      <button
                        onClick={() => setDisconnectModal(account)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "rgba(226,75,74,0.08)",
                          border: "1px solid rgba(226,75,74,0.15)",
                          borderRadius: 10,
                          fontSize: 13, fontWeight: 500, color: "#e24b4a",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}
                      >
                        <UnlinkIcon /> Disconnect
                      </button>
                    </>
                  ) : isConnecting ? (
                    <button
                      disabled
                      style={{
                        flex: 1, padding: "11px",
                        background: "var(--green-muted)",
                        border: "1px solid rgba(0,201,141,0.2)",
                        borderRadius: 10,
                        fontSize: 13, fontWeight: 600, color: "var(--green)",
                        cursor: "not-allowed",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}
                    >
                      <Spinner /> Connecting…
                    </button>
                  ) : (
                    <button
                      onClick={() => !needsUpgrade && !atLimit && connectAccount(account.id)}
                      disabled={!!needsUpgrade || atLimit}
                      style={{
                        flex: 1, padding: "11px",
                        background: needsUpgrade || atLimit ? "var(--surface-3)" : "var(--green)",
                        border: "none", borderRadius: 10,
                        fontSize: 13, fontWeight: 600,
                        color: needsUpgrade || atLimit ? "var(--text-3)" : "#0a0e14",
                        cursor: needsUpgrade || atLimit ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        transition: "opacity 0.2s",
                      }}
                    >
                      {needsUpgrade ? <LockIcon small /> : <LinkIcon />}
                      {needsUpgrade ? `Upgrade to connect` : atLimit ? "Plan limit reached" : `Connect ${account.platform}`}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* ── Info footer ──────────────────────────────────────────────────── */}
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "16px 20px",
            display: "flex", alignItems: "flex-start", gap: 12,
          }}
        >
          <InfoIcon color="var(--text-3)" />
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", marginBottom: 4 }}>How platform connections work</p>
            <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.65 }}>
              Connecting a platform uses OAuth — Postora never stores your password. We only request permission to publish posts on your behalf.
              You can disconnect at any time. Your posts won't be deleted when you disconnect.
            </p>
          </div>
        </div>

      </main>

      {/* ── Disconnect modal ─────────────────────────────────────────────── */}
      {disconnectModal && (
        <ConfirmModal
          title={`Disconnect ${disconnectModal.platform}?`}
          message={`${disconnectModal.handle} will be removed. Any scheduled posts to ${disconnectModal.platform} will be paused.`}
          confirmLabel="Yes, disconnect"
          confirmDanger
          onConfirm={() => disconnectAccount(disconnectModal.id)}
          onCancel={() => setDisconnectModal(null)}
        />
      )}

      {/* ── Reconnect modal ──────────────────────────────────────────────── */}
      {reconnectModal && (
        <ConfirmModal
          title={`Reconnect ${reconnectModal.platform}?`}
          message={`This will refresh the connection for ${reconnectModal.handle}. You'll be redirected to ${reconnectModal.platform} to re-authorise.`}
          confirmLabel="Reconnect"
          onConfirm={() => {
            setReconnectModal(null);
            connectAccount(reconnectModal.id);
          }}
          onCancel={() => setReconnectModal(null)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ state }: { state: ConnectState }) {
  const map: Record<ConnectState, { bg: string; color: string; dot: string; label: string }> = {
    connected:    { bg: "rgba(0,201,141,0.1)",   color: "#00C98D", dot: "#00C98D", label: "Connected" },
    disconnected: { bg: "rgba(255,255,255,0.05)", color: "#4e5768", dot: "#4e5768", label: "Not connected" },
    connecting:   { bg: "rgba(55,138,221,0.1)",  color: "#378ADD", dot: "#378ADD", label: "Connecting…" },
    error:        { bg: "rgba(226,75,74,0.1)",   color: "#e24b4a", dot: "#e24b4a", label: "Error" },
  };
  const s = map[state];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 11, fontWeight: 600,
        padding: "4px 10px", borderRadius: 999,
        background: s.bg, color: s.color,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 6, height: 6, borderRadius: "50%",
          background: s.dot,
          boxShadow: state === "connected" ? `0 0 5px ${s.dot}` : "none",
        }}
      />
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────
function ConfirmModal({
  title, message, confirmLabel, confirmDanger = false, onConfirm, onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24, backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border-hover)",
          borderRadius: 20, padding: 28,
          width: "100%", maxWidth: 400,
          display: "flex", flexDirection: "column", gap: 20,
        }}
      >
        <div>
          <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>
            {title}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{message}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "11px",
              background: "var(--surface-3)", border: "1px solid var(--border-hover)",
              borderRadius: 10, fontSize: 13, fontWeight: 500,
              color: "var(--text-2)", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "11px", border: "none",
              background: confirmDanger ? "#e24b4a" : "var(--green)",
              borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: confirmDanger ? "#fff" : "#0a0e14",
              cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
function LinkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
}
function UnlinkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="2" y1="2" x2="22" y2="22"/></svg>;
}
function RefreshIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
}
function LockIcon({ small }: { small?: boolean }) {
  const s = small ? 12 : 14;
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function InfoIcon({ color = "currentColor" }: { color?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function Spinner() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
}