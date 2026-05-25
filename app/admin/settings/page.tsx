"use client";

import { useState } from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "general" | "ai" | "email" | "security" | "admins";

// ─── Mock admins ──────────────────────────────────────────────────────────────
const ADMINS = [
  { id: 1, name: "Super Admin",    email: "admin@postora.co",   role: "super_admin", lastLogin: "2 min ago",   avatar: "SA" },
  { id: 2, name: "Tobi Fashola",   email: "tobi@postora.co",    role: "admin",        lastLogin: "1 hour ago",  avatar: "TF" },
  { id: 3, name: "Blessing Adaeze",email: "blessing@postora.co",role: "support",      lastLogin: "3 hours ago", avatar: "BA" },
];

const ROLE_MAP: Record<string, { label: string; bg: string; color: string }> = {
  super_admin: { label: "Super Admin", bg: "rgba(226,75,74,0.12)",  color: "#e24b4a" },
  admin:       { label: "Admin",       bg: "rgba(0,201,141,0.12)",  color: "#00C98D" },
  support:     { label: "Support",     bg: "rgba(55,138,221,0.12)", color: "#378ADD" },
};

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "general",  label: "General",        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  { key: "ai",       label: "AI & Gemini",    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l1.6 5H19l-4.1 3 1.5 5L12 12l-4.4 3 1.5-5L5 7h5.4z"/></svg> },
  { key: "email",    label: "Email & Alerts", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { key: "security", label: "Security",       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { key: "admins",   label: "Admin Users",    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>("general");
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <>
      <AdminTopbar title="Settings" subtitle="Platform configuration and admin management" />

      {/* Toast */}
      {saved && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 200, background: "#00C98D", borderRadius: 12, padding: "11px 20px", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#0a0e14", boxShadow: "0 8px 24px rgba(0,201,141,0.3)", animation: "slideIn 0.3s ease" }}>
          <style>{`@keyframes slideIn{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}`}</style>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          Settings saved
        </div>
      )}

      <main style={{ padding: 28, display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* ── Sidebar tabs ─────────────────────────────────────────────────── */}
        <div style={{ width: 200, flexShrink: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 8, position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 2 }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left", background: active ? "rgba(255,255,255,0.07)" : "transparent", color: active ? "#f0f4ff" : "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: active ? 600 : 400, transition: "all 0.15s", position: "relative" }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                {active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 16, borderRadius: "0 2px 2px 0", background: "#e24b4a" }} />}
                <span style={{ color: active ? "#e24b4a" : "inherit" }}>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          {tab === "general"  && <GeneralTab  onSave={save} />}
          {tab === "ai"       && <AITab        onSave={save} />}
          {tab === "email"    && <EmailTab     onSave={save} />}
          {tab === "security" && <SecurityTab  onSave={save} />}
          {tab === "admins"   && <AdminsTab />}
        </div>
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: GENERAL
// ─────────────────────────────────────────────────────────────────────────────
function GeneralTab({ onSave }: { onSave: () => void }) {
  const [platformName, setPlatformName] = useState("Postora");
  const [supportEmail, setSupportEmail] = useState("support@postora.co");
  const [maintenance, setMaintenance]   = useState(false);
  const [newSignups, setNewSignups]      = useState(true);
  const [trialDays, setTrialDays]        = useState("14");

  return (
    <>
      <Card title="Platform Settings" subtitle="Core configuration for the Postora platform">
        <Row label="Platform name">
          <Input value={platformName} onChange={setPlatformName} placeholder="Postora" />
        </Row>
        <Row label="Support email">
          <Input value={supportEmail} onChange={setSupportEmail} placeholder="support@postora.co" type="email" />
        </Row>
        <Row label="Free trial duration">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Input value={trialDays} onChange={setTrialDays} placeholder="14" style={{ width: 80 }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>days</span>
          </div>
        </Row>
        <SaveBtn onSave={onSave} />
      </Card>

      <Card title="Feature Flags" subtitle="Enable or disable platform-wide features">
        <Toggle label="Allow new signups" description="New users can register. Disable during maintenance." value={newSignups} onChange={setNewSignups} />
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        <Toggle
          label="Maintenance mode"
          description="Takes the platform offline for all users. Shows maintenance page."
          value={maintenance}
          onChange={setMaintenance}
          danger
        />
        {maintenance && (
          <div style={{ padding: "11px 14px", background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 10, fontSize: 12, color: "#e24b4a", display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Maintenance mode is ON — all users will see a maintenance page.
          </div>
        )}
        <SaveBtn onSave={onSave} />
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: AI & GEMINI
// ─────────────────────────────────────────────────────────────────────────────
function AITab({ onSave }: { onSave: () => void }) {
  const [apiKey, setApiKey]           = useState("AIza••••••••••••••••••••••••");
  const [showKey, setShowKey]         = useState(false);
  const [model, setModel]             = useState("gemini-1.5-pro");
  const [maxTokens, setMaxTokens]     = useState("1024");
  const [temperature, setTemperature] = useState("0.8");
  const [rateLimitStarter, setRLS]    = useState("20");
  const [rateLimitPro, setRLP]        = useState("100");
  const [rateLimitElite, setRLE]      = useState("Unlimited");
  const [aiEnabled, setAiEnabled]     = useState(true);

  return (
    <>
      <Card title="Gemini AI Configuration" subtitle="Google Gemini API settings for caption generation">
        <Row label="API key">
          <div style={{ position: "relative" }}>
            <Input
              value={showKey ? "AIzaSyD_example_key_here_12345" : apiKey}
              onChange={setApiKey}
              placeholder="AIza..."
              type={showKey ? "text" : "password"}
              style={{ paddingRight: 44 }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", padding: 4 }}
            >
              {showKey
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
        </Row>
        <Row label="Model">
          <select value={model} onChange={(e) => setModel(e.target.value)} style={selectStyle}>
            <option value="gemini-1.5-pro">gemini-1.5-pro</option>
            <option value="gemini-1.5-flash">gemini-1.5-flash</option>
            <option value="gemini-pro">gemini-pro</option>
          </select>
        </Row>
        <div className="grid grid-cols-2" style={{ gap: 14 }}>
          <Row label="Max tokens">
            <Input value={maxTokens} onChange={setMaxTokens} placeholder="1024" type="number" />
          </Row>
          <Row label="Temperature">
            <Input value={temperature} onChange={setTemperature} placeholder="0.8" type="number" />
          </Row>
        </div>
        <SaveBtn onSave={onSave} />
      </Card>

      <Card title="AI Rate Limits" subtitle="Max AI caption generations per month per plan">
        <div className="grid grid-cols-3" style={{ gap: 12 }}>
          {[
            { label: "Starter",  value: rateLimitStarter, onChange: setRLS, color: "#4e5768" },
            { label: "Pro",      value: rateLimitPro,     onChange: setRLP, color: "#00C98D" },
            { label: "Elite",    value: rateLimitElite,   onChange: setRLE, color: "#e24b4a" },
          ].map((p) => (
            <div key={p.label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${p.color}22`, borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.label}</span>
              </div>
              <input
                value={p.value}
                onChange={(e) => p.onChange(e.target.value)}
                style={{ ...inputStyle, textAlign: "center", fontFamily: "var(--font-sora), sans-serif", fontSize: 18, fontWeight: 700, color: "#f0f4ff" }}
              />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>captions / month</span>
            </div>
          ))}
        </div>
        <SaveBtn onSave={onSave} />
      </Card>

      <Card title="AI Toggle" subtitle="Enable or disable AI caption generation platform-wide">
        <Toggle label="AI caption generation" description="Allow users to generate captions using Gemini AI." value={aiEnabled} onChange={setAiEnabled} />
        <SaveBtn onSave={onSave} />
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: EMAIL & ALERTS
// ─────────────────────────────────────────────────────────────────────────────
function EmailTab({ onSave }: { onSave: () => void }) {
  const [smtpHost, setSmtpHost]       = useState("smtp.resend.com");
  const [smtpPort, setSmtpPort]       = useState("465");
  const [smtpUser, setSmtpUser]       = useState("admin@postora.co");
  const [fromName, setFromName]       = useState("Postora");
  const [welcomeEmail, setWelcome]    = useState(true);
  const [failAlert, setFailAlert]     = useState(true);
  const [billingEmail, setBilling]    = useState(true);
  const [weeklyDigest, setWeekly]     = useState(false);

  return (
    <>
      <Card title="SMTP Configuration" subtitle="Email delivery settings">
        <div className="grid grid-cols-2" style={{ gap: 14 }}>
          <Row label="SMTP host"><Input value={smtpHost} onChange={setSmtpHost} placeholder="smtp.resend.com" /></Row>
          <Row label="SMTP port"><Input value={smtpPort} onChange={setSmtpPort} placeholder="465" type="number" /></Row>
          <Row label="SMTP username"><Input value={smtpUser} onChange={setSmtpUser} placeholder="user@domain.com" /></Row>
          <Row label="From name"><Input value={fromName} onChange={setFromName} placeholder="Postora" /></Row>
        </div>
        <button style={{ padding: "8px 18px", background: "rgba(55,138,221,0.1)", border: "1px solid rgba(55,138,221,0.2)", borderRadius: 9, fontSize: 12, fontWeight: 500, color: "#378ADD", cursor: "pointer" }}>
          Send test email
        </button>
        <SaveBtn onSave={onSave} />
      </Card>

      <Card title="Automated Emails" subtitle="Control which emails Postora sends to users automatically">
        <Toggle label="Welcome email"         description="Send a welcome email when a user signs up."              value={welcomeEmail} onChange={setWelcome}  />
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        <Toggle label="Post failure alert"    description="Notify users when a scheduled post fails to publish."   value={failAlert}    onChange={setFailAlert} />
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        <Toggle label="Billing reminders"     description="Send payment receipts and upcoming renewal reminders."   value={billingEmail} onChange={setBilling}   />
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        <Toggle label="Weekly digest"         description="Send users a weekly performance summary every Monday."   value={weeklyDigest} onChange={setWeekly}    />
        <SaveBtn onSave={onSave} />
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: SECURITY
// ─────────────────────────────────────────────────────────────────────────────
function SecurityTab({ onSave }: { onSave: () => void }) {
  const [force2FA, setForce2FA]         = useState(true);
  const [sessionTimeout, setSession]    = useState("60");
  const [maxLoginAttempts, setAttempts] = useState("5");
  const [ipWhitelist, setIPWhitelist]   = useState("");
  const [auditLog, setAuditLog]         = useState(true);

  return (
    <>
      <Card title="Authentication" subtitle="Admin login and session security">
        <Toggle label="Require 2FA for all admins" description="All admin accounts must enable two-factor authentication." value={force2FA} onChange={setForce2FA} />
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        <Row label="Session timeout (minutes)">
          <Input value={sessionTimeout} onChange={setSession} placeholder="60" type="number" style={{ width: 100 }} />
        </Row>
        <Row label="Max login attempts before lockout">
          <Input value={maxLoginAttempts} onChange={setAttempts} placeholder="5" type="number" style={{ width: 80 }} />
        </Row>
        <SaveBtn onSave={onSave} />
      </Card>

      <Card title="IP Allowlist" subtitle="Restrict admin panel access to specific IP addresses (leave blank to allow all)">
        <textarea
          value={ipWhitelist}
          onChange={(e) => setIPWhitelist(e.target.value)}
          rows={4}
          placeholder={"192.168.1.1\n10.0.0.0/24\n(one IP or CIDR per line)"}
          style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 13, color: "#f0f4ff", resize: "none", outline: "none", fontFamily: "monospace", lineHeight: 1.6, transition: "border-color 0.2s" }}
          onFocus={(e) => (e.target.style.borderColor = "#e24b4a")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        <SaveBtn onSave={onSave} />
      </Card>

      <Card title="Audit Logging" subtitle="Track all admin actions for compliance and monitoring">
        <Toggle label="Enable audit log" description="Record all admin actions including logins, edits, and user changes." value={auditLog} onChange={setAuditLog} />
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { action: "Plan updated",         admin: "Super Admin",     time: "2 min ago" },
            { action: "User suspended",        admin: "Tobi Fashola",    time: "1 hour ago" },
            { action: "Admin login",           admin: "Super Admin",     time: "2 hours ago" },
            { action: "Ticket resolved",       admin: "Blessing Adaeze", time: "5 hours ago" },
          ].map((log, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e24b4a", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 12, color: "#f0f4ff", fontWeight: 500 }}>{log.action}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{log.admin}</p>
                </div>
              </div>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{log.time}</span>
            </div>
          ))}
        </div>
        <button style={{ padding: "8px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, fontSize: 12, color: "rgba(255,255,255,0.4)", cursor: "pointer", width: "fit-content" }}>
          View full audit log →
        </button>
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: ADMIN USERS
// ─────────────────────────────────────────────────────────────────────────────
function AdminsTab() {
  const [admins, setAdmins]           = useState(ADMINS);
  const [showInvite, setShowInvite]   = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState("support");

  function removeAdmin(id: number) {
    setAdmins((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <>
      <Card title="Admin Team" subtitle="Manage who has access to the admin panel">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {admins.map((admin, i) => {
            const r = ROLE_MAP[admin.role];
            const isSelf = admin.id === 1;
            return (
              <div
                key={admin.id}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 0",
                  borderBottom: i < admins.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                {/* Avatar */}
                <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, rgba(226,75,74,0.4), rgba(226,75,74,0.2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#e24b4a" }}>
                  {admin.avatar}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>{admin.name}</p>
                    {isSelf && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 999, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>YOU</span>}
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{admin.email}</p>
                </div>

                {/* Role */}
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: r.bg, color: r.color, flexShrink: 0 }}>
                  {r.label}
                </span>

                {/* Last login */}
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", flexShrink: 0, minWidth: 90, textAlign: "right" }}>
                  {admin.lastLogin}
                </p>

                {/* Remove */}
                {!isSelf && (
                  <button
                    onClick={() => removeAdmin(admin.id)}
                    style={{ padding: "5px 12px", background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.15)", borderRadius: 8, fontSize: 11, color: "#e24b4a", cursor: "pointer", flexShrink: 0 }}
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Invite */}
        {!showInvite ? (
          <button
            onClick={() => setShowInvite(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#e24b4a", cursor: "pointer", width: "fit-content" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Invite admin
          </button>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#f0f4ff" }}>Invite new admin</p>
            <div className="grid grid-cols-2" style={{ gap: 12 }}>
              <input
                type="email"
                placeholder="email@postora.co"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                style={inputStyle}
              />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={selectStyle}>
                <option value="admin">Admin</option>
                <option value="support">Support</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setShowInvite(false); setInviteEmail(""); }}
                style={{ flex: 1, padding: "10px", background: "#e24b4a", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}
              >
                Send invite
              </button>
              <button
                onClick={() => setShowInvite(false)}
                style={{ padding: "10px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, fontSize: 13, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 13px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, fontSize: 13, color: "#f0f4ff",
  outline: "none", fontFamily: "inherit",
  transition: "border-color 0.2s",
};

const selectStyle: React.CSSProperties = {
  width: "100%", padding: "10px 13px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, fontSize: 13, color: "#f0f4ff",
  outline: "none", cursor: "pointer", colorScheme: "dark",
};

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 14, fontWeight: 700, color: "#f0f4ff" }}>{title}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{subtitle}</p>
      </div>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", style }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; style?: React.CSSProperties }) {
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ ...inputStyle, ...style }}
      onFocus={(e) => (e.target.style.borderColor = "#e24b4a")}
      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
    />
  );
}

function Toggle({ label, description, value, onChange, danger = false }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void; danger?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: danger && value ? "#e24b4a" : "#f0f4ff" }}>{label}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{ width: 44, height: 24, borderRadius: 12, flexShrink: 0, background: value ? (danger ? "#e24b4a" : "#00C98D") : "rgba(255,255,255,0.08)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}
      >
        <div style={{ position: "absolute", top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
      </button>
    </div>
  );
}

function SaveBtn({ onSave }: { onSave: () => void }) {
  return (
    <button
      onClick={onSave}
      style={{ padding: "10px 24px", background: "#e24b4a", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", width: "fit-content", transition: "opacity 0.2s" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
    >
      Save changes
    </button>
  );
}