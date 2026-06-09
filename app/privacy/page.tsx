"use client";

const LAST_UPDATED = "June 4, 2025";
const CONTACT_EMAIL = "privacy@postora.com";

const sections = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        text: "When you create a Postora account, we collect your name, email address, and password. If you sign up via a third-party provider, we receive basic profile information from that provider.",
      },
      {
        subtitle: "Connected Social Accounts",
        text: "When you connect a social media account (TikTok, Twitter/X, Instagram, Facebook), we receive an OAuth access token and basic profile data such as your username, follower count, and post count. We never receive or store your social media password.",
      },
      {
        subtitle: "Content You Create",
        text: "We store posts, captions, scheduled content, and media files you upload or generate within Postora so we can deliver our service.",
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect information about how you interact with Postora, including pages visited, features used, and actions taken, to improve the product.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    content: [
      {
        subtitle: "To Provide the Service",
        text: "We use your data to operate Postora — authenticating your account, publishing posts to connected platforms on your behalf, generating AI captions, and displaying your dashboard statistics.",
      },
      {
        subtitle: "To Improve Postora",
        text: "Aggregated, anonymised usage data helps us understand which features are most valuable and where to focus development.",
      },
      {
        subtitle: "To Communicate With You",
        text: "We may send transactional emails (password resets, billing receipts) and occasional product updates. You can opt out of marketing emails at any time.",
      },
      {
        subtitle: "To Process Payments",
        text: "Billing is handled by our payment processor. We do not store your full card details on our servers.",
      },
    ],
  },
  {
    id: "social-media-data",
    title: "Social Media Data",
    content: [
      {
        subtitle: "What We Access",
        text: "We request only the permissions necessary to publish content on your behalf and display basic account statistics. We do not read your private messages, access your contacts, or request permissions beyond what is needed.",
      },
      {
        subtitle: "Token Storage",
        text: "OAuth access tokens are stored securely in our database. They are never exposed to other users and are only used to perform actions you explicitly request.",
      },
      {
        subtitle: "Revoking Access",
        text: "You can disconnect any platform at any time from your Postora dashboard. This removes our access token and stops all publishing activity to that platform immediately. You can also revoke access directly from each platform's app settings.",
      },
    ],
  },
  {
    id: "data-sharing",
    title: "Data Sharing & Third Parties",
    content: [
      {
        subtitle: "We Do Not Sell Your Data",
        text: "Postora does not sell, rent, or trade your personal information or social media data to any third party for advertising or commercial purposes.",
      },
      {
        subtitle: "Service Providers",
        text: "We work with trusted third-party providers (hosting, payment processing, analytics) who process data on our behalf under strict confidentiality agreements.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your information if required by law, court order, or to protect the rights and safety of Postora and its users.",
      },
    ],
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: [
      {
        subtitle: "Active Accounts",
        text: "We retain your data for as long as your account is active and as needed to provide the service.",
      },
      {
        subtitle: "Account Deletion",
        text: "When you delete your Postora account, we delete your personal data within 30 days. Anonymised, aggregated data may be retained for analytics purposes.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your Rights",
    content: [
      {
        subtitle: "Access & Portability",
        text: "You can request a copy of all personal data we hold about you at any time by contacting us.",
      },
      {
        subtitle: "Correction",
        text: "You can update your account information directly in your Postora settings at any time.",
      },
      {
        subtitle: "Deletion",
        text: "You can request deletion of your account and all associated data by contacting our support team or deleting your account from settings.",
      },
      {
        subtitle: "Objection",
        text: "You may object to certain processing of your data, including marketing communications, at any time.",
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    content: [
      {
        subtitle: "How We Protect Your Data",
        text: "We use industry-standard encryption (TLS) for data in transit and encrypt sensitive data at rest. Access to user data is restricted to authorised personnel only.",
      },
      {
        subtitle: "Breach Notification",
        text: "In the unlikely event of a data breach affecting your information, we will notify you and relevant authorities as required by applicable law.",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    content: [
      {
        subtitle: "Essential Cookies",
        text: "We use cookies to keep you logged in and maintain your session securely. These are strictly necessary and cannot be disabled.",
      },
      {
        subtitle: "Analytics Cookies",
        text: "We may use analytics cookies to understand how users navigate Postora. You can opt out via your browser settings.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: [
      {
        subtitle: "Updates",
        text: "We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice in the dashboard. Continued use of Postora after changes take effect constitutes acceptance of the updated policy.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact Us",
    content: [
      {
        subtitle: "Questions or Requests",
        text: `If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at ${CONTACT_EMAIL}. We aim to respond to all requests within 5 business days.`,
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:         #0a0e14;
          --surface-1:  #0f1420;
          --surface-2:  #141926;
          --surface-3:  #1a2030;
          --border:     rgba(255,255,255,0.07);
          --border-hover: rgba(255,255,255,0.12);
          --text-1:     #f0f2f5;
          --text-2:     #8b95a8;
          --text-3:     #4e5768;
          --green:      #00C98D;
          --green-muted: rgba(0,201,141,0.08);
          --font-sora:  'Sora', sans-serif;
          --font-body:  'DM Sans', sans-serif;
        }

        body {
          background: var(--bg);
          color: var(--text-1);
          font-family: var(--font-body);
          line-height: 1.7;
          min-height: 100vh;
        }

        .page-wrap {
          max-width: 860px;
          margin: 0 auto;
          padding: 60px 24px 100px;
        }

        /* NAV */
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          background: rgba(10,14,20,0.9);
          backdrop-filter: blur(12px);
          z-index: 50;
        }
        .nav-logo {
          font-family: var(--font-sora);
          font-size: 18px;
          font-weight: 800;
          color: var(--text-1);
          text-decoration: none;
          letter-spacing: -0.5px;
        }
        .nav-logo span { color: var(--green); }
        .nav-back {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-2);
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-back:hover { color: var(--text-1); }

        /* HERO */
        .hero {
          padding: 56px 0 48px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 48px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 999px;
          background: var(--green-muted);
          border: 1px solid rgba(0,201,141,0.2);
          color: var(--green);
          margin-bottom: 20px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .hero-title {
          font-family: var(--font-sora);
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 800;
          color: var(--text-1);
          letter-spacing: -1.5px;
          line-height: 1.1;
          margin-bottom: 16px;
        }
        .hero-title span { color: var(--green); }
        .hero-sub {
          font-size: 15px;
          color: var(--text-2);
          max-width: 560px;
          line-height: 1.7;
        }
        .hero-meta {
          margin-top: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .hero-meta-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: var(--text-3);
        }
        .hero-meta-item svg { flex-shrink: 0; }

        /* TOC */
        .toc {
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px 28px;
          margin-bottom: 48px;
        }
        .toc-title {
          font-family: var(--font-sora);
          font-size: 12px;
          font-weight: 700;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 16px;
        }
        .toc-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .toc-list a {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text-2);
          text-decoration: none;
          padding: 6px 8px;
          border-radius: 8px;
          transition: all 0.15s;
        }
        .toc-list a:hover {
          color: var(--text-1);
          background: var(--surface-3);
        }
        .toc-num {
          font-size: 10px;
          font-weight: 700;
          color: var(--text-3);
          width: 18px;
          flex-shrink: 0;
        }

        /* SECTIONS */
        .section {
          margin-bottom: 48px;
          scroll-margin-top: 80px;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .section-num {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: var(--green-muted);
          border: 1px solid rgba(0,201,141,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sora);
          font-size: 12px;
          font-weight: 700;
          color: var(--green);
          flex-shrink: 0;
        }
        .section-title {
          font-family: var(--font-sora);
          font-size: 20px;
          font-weight: 700;
          color: var(--text-1);
          letter-spacing: -0.4px;
        }
        .section-divider {
          height: 1px;
          background: var(--border);
          margin-bottom: 24px;
        }
        .item {
          padding: 20px 0;
          border-bottom: 1px solid var(--border);
        }
        .item:last-child { border-bottom: none; }
        .item-subtitle {
          font-family: var(--font-sora);
          font-size: 13px;
          font-weight: 600;
          color: var(--green);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .item-subtitle::before {
          content: '';
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--green);
          flex-shrink: 0;
        }
        .item-text {
          font-size: 14px;
          color: var(--text-2);
          line-height: 1.75;
        }

        /* HIGHLIGHT BOX */
        .highlight-box {
          background: var(--green-muted);
          border: 1px solid rgba(0,201,141,0.15);
          border-radius: 14px;
          padding: 20px 24px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 48px;
        }
        .highlight-box-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(0,201,141,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .highlight-box-title {
          font-family: var(--font-sora);
          font-size: 14px;
          font-weight: 700;
          color: var(--green);
          margin-bottom: 6px;
        }
        .highlight-box-text {
          font-size: 13px;
          color: var(--text-2);
          line-height: 1.65;
        }

        /* FOOTER */
        .footer {
          border-top: 1px solid var(--border);
          padding-top: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-text {
          font-size: 12px;
          color: var(--text-3);
        }
        .footer-email {
          font-size: 13px;
          color: var(--green);
          text-decoration: none;
          font-weight: 500;
        }
        .footer-email:hover { text-decoration: underline; }

        @media (max-width: 600px) {
          .page-wrap { padding: 40px 16px 80px; }
          .hero { padding: 40px 0 36px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="nav-logo">Post<span>ora</span></a>
        <a href="/dashboard" className="nav-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to dashboard
        </a>
      </nav>

      <div className="page-wrap">

        {/* HERO */}
        <div className="hero">
          <div className="hero-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Legal
          </div>
          <h1 className="hero-title">Privacy <span>Policy</span></h1>
          <p className="hero-sub">
            We believe privacy is a right, not a feature. This policy explains exactly what data Postora collects, why we collect it, and how you stay in control.
          </p>
          <div className="hero-meta">
            <div className="hero-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Last updated: {LAST_UPDATED}
            </div>
            <div className="hero-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {CONTACT_EMAIL}
            </div>
          </div>
        </div>

        {/* KEY PROMISE */}
        <div className="highlight-box">
          <div className="highlight-box-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C98D" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <p className="highlight-box-title">Our core promise</p>
            <p className="highlight-box-text">
              Postora never sells your data. We never store your social media passwords. You can disconnect any platform or delete your account at any time. Everything we collect is used solely to provide you with the service.
            </p>
          </div>
        </div>

        {/* TABLE OF CONTENTS */}
        <div className="toc">
          <p className="toc-title">Table of Contents</p>
          <ul className="toc-list">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  <span className="toc-num">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* SECTIONS */}
        {sections.map((section, i) => (
          <div key={section.id} id={section.id} className="section">
            <div className="section-header">
              <div className="section-num">{String(i + 1).padStart(2, "0")}</div>
              <h2 className="section-title">{section.title}</h2>
            </div>
            <div className="section-divider" />
            {section.content.map((item, j) => (
              <div key={j} className="item">
                <p className="item-subtitle">{item.subtitle}</p>
                <p className="item-text">{item.text}</p>
              </div>
            ))}
          </div>
        ))}

        {/* FOOTER */}
        <div className="footer">
          <p className="footer-text">© {new Date().getFullYear()} Postora. All rights reserved.</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="footer-email">{CONTACT_EMAIL}</a>
        </div>

      </div>
    </>
  );
}