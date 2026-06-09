"use client";

const LAST_UPDATED = "June 4, 2025";
const CONTACT_EMAIL = "legal@postora.com";
const COMPANY_NAME = "Postora";

const sections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    content: [
      {
        subtitle: "Agreement to Terms",
        text: "By creating an account or using Postora, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use Postora.",
      },
      {
        subtitle: "Eligibility",
        text: "You must be at least 13 years old to use Postora. If you are under 18, you represent that you have your parent or guardian's permission to use the service.",
      },
      {
        subtitle: "Updates to Terms",
        text: "We may update these Terms from time to time. We will notify you of significant changes via email or a notice in the dashboard. Continued use of Postora after changes take effect constitutes your acceptance of the revised Terms.",
      },
    ],
  },
  {
    id: "description",
    title: "Description of Service",
    content: [
      {
        subtitle: "What Postora Does",
        text: "Postora is a social media management platform that allows users to connect their social media accounts, schedule and publish content, generate AI-powered captions, and manage their media library from a single dashboard.",
      },
      {
        subtitle: "Platform Integrations",
        text: "Postora integrates with third-party platforms including TikTok, Twitter/X, Instagram, and Facebook via their official APIs and OAuth protocols. Your use of those platforms remains subject to their own terms of service.",
      },
      {
        subtitle: "Service Availability",
        text: "We strive to maintain high availability but do not guarantee uninterrupted access. We may perform maintenance, updates, or experience outages. We are not liable for any losses resulting from service interruptions.",
      },
    ],
  },
  {
    id: "accounts",
    title: "Your Account",
    content: [
      {
        subtitle: "Account Responsibility",
        text: "You are responsible for maintaining the confidentiality of your Postora login credentials. You are responsible for all activity that occurs under your account.",
      },
      {
        subtitle: "Accurate Information",
        text: "You agree to provide accurate, current, and complete information when creating your account and to keep it updated.",
      },
      {
        subtitle: "One Account Per User",
        text: "Each user may maintain one account. Creating multiple accounts to circumvent plan limits or restrictions is prohibited and may result in termination of all associated accounts.",
      },
      {
        subtitle: "Account Security",
        text: "You must notify us immediately at " + CONTACT_EMAIL + " if you suspect unauthorised access to your account. We are not liable for losses resulting from unauthorised use of your account.",
      },
    ],
  },
  {
    id: "connected-accounts",
    title: "Connected Social Accounts",
    content: [
      {
        subtitle: "OAuth Authorization",
        text: "When you connect a social media account, you authorise Postora to access and act on your behalf within the permissions you grant via OAuth. We will only use these permissions to provide the service features you request.",
      },
      {
        subtitle: "Your Responsibility",
        text: "You are solely responsible for all content published through Postora on your connected accounts. Postora publishes content only when you explicitly schedule or request it.",
      },
      {
        subtitle: "Platform Compliance",
        text: "You must ensure your use of Postora complies with the terms of service of each connected platform. Postora is not responsible for actions taken by third-party platforms including account suspension or content removal.",
      },
      {
        subtitle: "Revoking Access",
        text: "You may disconnect any connected account at any time from your Postora dashboard. This immediately revokes our access to that account.",
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    content: [
      {
        subtitle: "Permitted Use",
        text: "Postora is provided for lawful social media management purposes for individuals and businesses. You may use Postora to schedule, publish, and manage content on your own social media accounts.",
      },
      {
        subtitle: "Prohibited Activities",
        text: "You may not use Postora to publish spam, harassing, defamatory, illegal, or harmful content. You may not use Postora to violate any applicable laws or the terms of service of connected platforms. You may not attempt to reverse-engineer, scrape, or interfere with Postora's systems.",
      },
      {
        subtitle: "Content Standards",
        text: "You agree not to publish content that infringes intellectual property rights, contains malware, promotes violence or illegal activity, or violates any third-party rights through Postora.",
      },
      {
        subtitle: "Enforcement",
        text: "We reserve the right to suspend or terminate accounts that violate these terms, with or without notice, at our sole discretion.",
      },
    ],
  },
  {
    id: "content",
    title: "Your Content",
    content: [
      {
        subtitle: "Ownership",
        text: "You retain full ownership of all content you create, upload, or publish through Postora. We do not claim any intellectual property rights over your content.",
      },
      {
        subtitle: "License to Postora",
        text: "By uploading content to Postora, you grant us a limited, non-exclusive license to store, display, and process your content solely for the purpose of providing the service to you.",
      },
      {
        subtitle: "Your Responsibility",
        text: "You are solely responsible for your content and the consequences of publishing it. Postora is a tool — the editorial decisions are yours.",
      },
    ],
  },
  {
    id: "subscription",
    title: "Subscription & Billing",
    content: [
      {
        subtitle: "Paid Plans",
        text: "Postora offers paid subscription plans (Starter, Pro, Elite). By subscribing, you agree to pay the applicable fees. All fees are stated in USD and are exclusive of applicable taxes.",
      },
      {
        subtitle: "Billing Cycle",
        text: "Subscriptions are billed on a recurring monthly or annual basis depending on the plan you select. Your subscription renews automatically unless cancelled.",
      },
      {
        subtitle: "Cancellation",
        text: "You may cancel your subscription at any time from your billing settings. Cancellation takes effect at the end of your current billing period. We do not provide refunds for partial billing periods.",
      },
      {
        subtitle: "Refund Policy",
        text: "We offer a refund within 7 days of your initial purchase if you are not satisfied. After that period, all sales are final. Contact us at " + CONTACT_EMAIL + " for refund requests.",
      },
      {
        subtitle: "Plan Limits",
        text: "Each plan has specific limits on connected platforms, posts, and AI caption usage. Exceeding plan limits may require an upgrade. Unused allowances do not roll over to the next billing period.",
      },
    ],
  },
  {
    id: "ai-features",
    title: "AI Features",
    content: [
      {
        subtitle: "AI-Generated Content",
        text: "Postora uses AI to generate caption suggestions and hashtags. AI-generated content is provided as a starting point and may require editing. You are solely responsible for reviewing and approving any AI-generated content before publishing.",
      },
      {
        subtitle: "No Guarantee of Quality",
        text: "We do not guarantee that AI-generated content will be accurate, appropriate, or suitable for your specific audience or platform. Always review content before publishing.",
      },
      {
        subtitle: "Usage Limits",
        text: "AI caption generation is subject to the limits of your subscription plan. Usage resets at the start of each billing period.",
      },
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    content: [
      {
        subtitle: "Postora's IP",
        text: "Postora and all associated software, designs, logos, and content are owned by us and protected by intellectual property laws. You may not copy, reproduce, or distribute any part of Postora without our written permission.",
      },
      {
        subtitle: "Feedback",
        text: "If you submit feedback, suggestions, or ideas about Postora, you grant us the right to use them without compensation or attribution to you.",
      },
    ],
  },
  {
    id: "disclaimers",
    title: "Disclaimers & Limitation of Liability",
    content: [
      {
        subtitle: "As-Is Service",
        text: 'Postora is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the service will be error-free, secure, or continuously available.',
      },
      {
        subtitle: "Limitation of Liability",
        text: "To the maximum extent permitted by law, Postora shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service, including loss of data, revenue, or business opportunities.",
      },
      {
        subtitle: "Third-Party Platforms",
        text: "Postora is not responsible for the actions, policies, or availability of third-party platforms (TikTok, Twitter/X, Instagram, Facebook). Changes to their APIs or policies may affect Postora features without notice.",
      },
    ],
  },
  {
    id: "termination",
    title: "Termination",
    content: [
      {
        subtitle: "By You",
        text: "You may terminate your account at any time by going to Settings and deleting your account. Upon termination, your data will be deleted within 30 days.",
      },
      {
        subtitle: "By Postora",
        text: "We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any other reason at our discretion. We will provide notice where reasonably possible.",
      },
      {
        subtitle: "Effect of Termination",
        text: "Upon termination, your right to use Postora ceases immediately. Provisions of these Terms that by their nature should survive termination will remain in effect.",
      },
    ],
  },
  {
    id: "governing-law",
    title: "Governing Law",
    content: [
      {
        subtitle: "Jurisdiction",
        text: "These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of Postora shall be resolved through good-faith negotiation first, and if necessary, through appropriate legal channels.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    content: [
      {
        subtitle: "Get in Touch",
        text: `If you have any questions about these Terms of Service, please contact us at ${CONTACT_EMAIL}. We aim to respond to all inquiries within 5 business days.`,
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:           #0a0e14;
          --surface-1:    #0f1420;
          --surface-2:    #141926;
          --surface-3:    #1a2030;
          --border:       rgba(255,255,255,0.07);
          --border-hover: rgba(255,255,255,0.12);
          --text-1:       #f0f2f5;
          --text-2:       #8b95a8;
          --text-3:       #4e5768;
          --green:        #00C98D;
          --green-muted:  rgba(0,201,141,0.08);
          --blue:         #378ADD;
          --blue-muted:   rgba(55,138,221,0.08);
          --font-sora:    'Sora', sans-serif;
          --font-body:    'DM Sans', sans-serif;
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
          background: var(--blue-muted);
          border: 1px solid rgba(55,138,221,0.2);
          color: var(--blue);
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
        .hero-title span { color: var(--blue); }
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

        .highlight-box {
          background: var(--blue-muted);
          border: 1px solid rgba(55,138,221,0.15);
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
          background: rgba(55,138,221,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .highlight-box-title {
          font-family: var(--font-sora);
          font-size: 14px;
          font-weight: 700;
          color: var(--blue);
          margin-bottom: 6px;
        }
        .highlight-box-text {
          font-size: 13px;
          color: var(--text-2);
          line-height: 1.65;
        }

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
        .toc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
        }
        .toc-grid a {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text-2);
          text-decoration: none;
          padding: 7px 8px;
          border-radius: 8px;
          transition: all 0.15s;
        }
        .toc-grid a:hover {
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
          background: var(--blue-muted);
          border: 1px solid rgba(55,138,221,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sora);
          font-size: 12px;
          font-weight: 700;
          color: var(--blue);
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
          color: var(--blue);
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
          background: var(--blue);
          flex-shrink: 0;
        }
        .item-text {
          font-size: 14px;
          color: var(--text-2);
          line-height: 1.75;
        }

        .related-links {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 48px;
        }
        .related-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 13px;
          color: var(--text-2);
          text-decoration: none;
          transition: all 0.15s;
        }
        .related-link:hover {
          border-color: var(--border-hover);
          color: var(--text-1);
        }

        .footer {
          border-top: 1px solid var(--border);
          padding-top: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-text { font-size: 12px; color: var(--text-3); }
        .footer-email {
          font-size: 13px;
          color: var(--blue);
          text-decoration: none;
          font-weight: 500;
        }
        .footer-email:hover { text-decoration: underline; }

        @media (max-width: 600px) {
          .page-wrap { padding: 40px 16px 80px; }
          .hero { padding: 40px 0 36px; }
          .toc-grid { grid-template-columns: 1fr; }
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
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Legal
          </div>
          <h1 className="hero-title">Terms of <span>Service</span></h1>
          <p className="hero-sub">
            Please read these terms carefully before using Postora. They explain your rights, our responsibilities, and what we expect from each other.
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

        {/* HIGHLIGHT */}
        <div className="highlight-box">
          <div className="highlight-box-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <p className="highlight-box-title">Plain English summary</p>
            <p className="highlight-box-text">
              Use Postora legally and honestly. You own your content. We provide the tools but you're responsible for what you publish. You can cancel anytime. We can terminate accounts that abuse the service. The full details are below.
            </p>
          </div>
        </div>

        {/* RELATED LINKS */}
        <div className="related-links">
          <a href="/privacy" className="related-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Privacy Policy
          </a>
          <a href="mailto:legal@postora.com" className="related-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Contact Legal
          </a>
        </div>

        {/* TABLE OF CONTENTS */}
        <div className="toc">
          <p className="toc-title">Table of Contents</p>
          <div className="toc-grid">
            {sections.map((s, i) => (
              <a key={s.id} href={`#${s.id}`}>
                <span className="toc-num">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </a>
            ))}
          </div>
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
          <p className="footer-text">© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="footer-email">{CONTACT_EMAIL}</a>
        </div>

      </div>
    </>
  );
}