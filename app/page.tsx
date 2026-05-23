import Image from "next/image";
import Link from "next/link";

// ─── Design system tokens (from globals.css) ──────────────────────────────
// --green: #00C98D | --surface: #0f1117 | --surface-2: #161b25
// Dark-first, AI product aesthetic — Sora display + Jakarta body

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--surface)" }}>
      <Navbar />
      <main>
        <Hero />
        <LogoStrip />
        <HowItWorks />
        <Features />
        <Stats />
        <Pricing />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(15,17,23,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        margin: "auto",
        width: "90%"
      }}
    >
      <div className="h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Image src="/logo.png" alt="logo" width={200} height={200} />
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8" style={{ fontSize: 14, color: "var(--text-2)" }}>
          {["How it works", "Features", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="hover:text-white transition-colors"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden md:block"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--text-2)", textDecoration: "none" }}
          >
            Log in
          </Link>
          <Link href="/signup" className="btn-primary" style={{ padding: "9px 22px", fontSize: 13 }}>
            Get started free
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="noise-bg"
      style={{
        paddingTop: "100px", paddingBottom: "100px",
        borderBottom: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background radial glow */}
      <div className="hero-glow" />

      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center gap-8">

        {/* Badge */}
        <div className="badge-green">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <circle cx="5" cy="5" r="5" fill="var(--green)" opacity="0.7"/>
            <circle cx="5" cy="5" r="2.5" fill="var(--green)"/>
          </svg>
          AI-Powered Social Automation
        </div>

        {/* Headline */}
        <h1
          className="font-display font-extrabold"
          style={{
            fontSize: "clamp(40px, 7vw, 72px)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: "var(--text-1)",
            maxWidth: 780,
          }}
        >
          Upload once.{" "}
          <span
            style={{
              color: "var(--green)",
              textShadow: "0 0 40px rgba(0,201,141,0.35)",
            }}
          >
            Post everywhere.
          </span>
          <br />Always.
        </h1>

        {/* Subtext */}
        <p style={{ fontSize: 18, color: "var(--text-2)", maxWidth: 520, lineHeight: 1.7 }}>
          Postora turns your product photos &amp; videos into a fully automated
          content engine — captions written, schedule set, posts published.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center" style={{ marginTop: 4 }}>
          <Link href="/signup" className="btn-primary">
            Start for free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <a href="#how-it-works" className="btn-ghost">
            See how it works
          </a>
        </div>

        {/* Hero preview card */}
        <div
          style={{
            marginTop: 40,
            width: "100%", maxWidth: 420,
            background: "var(--surface-2)",
            border: "1px solid var(--border-hover)",
            borderRadius: 20,
            padding: 20,
            textAlign: "left",
          }}
        >
          {/* Card header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div className="icon-box" style={{ width: 38, height: 38, borderRadius: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>shoe_collection.jpg</p>
              <p style={{ fontSize: 11, color: "var(--text-3)" }}>Just now</p>
            </div>
            <div className="badge-green" style={{ fontSize: 10, padding: "4px 10px" }}>
              AI writing…
            </div>
          </div>

          {/* Caption output */}
          <div
            style={{
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 13,
              color: "var(--text-2)",
              lineHeight: 1.6,
            }}
          >
            ✨ "Step into the season. Made for those who move with purpose.
            Shop link in bio 🔗{" "}
            <span style={{ color: "var(--green)" }}>#NewArrivals #ShoeLovers</span>"
          </div>

          {/* Platform pills */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { label: "Instagram", color: "#E1306C" },
              { label: "TikTok",    color: "var(--text-2)" },
              { label: "Sat 10:00 am", color: "var(--text-3)" },
            ].map((p) => (
              <span
                key={p.label}
                style={{
                  fontSize: 11, fontWeight: 500,
                  color: p.color,
                  background: "var(--surface-3)",
                  border: "1px solid var(--border)",
                  borderRadius: 999,
                  padding: "4px 12px",
                }}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGO STRIP — "Posts directly to"
// ─────────────────────────────────────────────────────────────────────────────
function LogoStrip() {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" }}>
        Posts directly to
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { name: "Instagram", hex: "#E1306C" },
          { name: "TikTok",    hex: "var(--text-1)" },
          { name: "Facebook",  hex: "#1877F2" },
        ].map((p) => (
          <div
            key={p.name}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 18px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontSize: 13, fontWeight: 500,
              color: "var(--text-1)",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.hex, display: "inline-block" }}/>
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOW IT WORKS
// ─────────────────────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", title: "Upload your media",       body: "Drop in product photos and videos. Postora stores everything in your media library." },
    { n: "02", title: "AI writes captions",       body: "Gemini AI crafts on-brand captions for each platform — tone matched, hashtags included." },
    { n: "03", title: "Set schedule. Done.",      body: "Pick your posting times once. Postora publishes automatically, every day." },
  ];

  return (
    <section
      id="how-it-works"
      style={{ padding: "96px 24px", borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center" style={{ marginBottom: 60 }}>
          <p className="section-eyebrow">How it works</p>
          <h2
            className="font-display font-bold"
            style={{ fontSize: "clamp(28px, 4vw, 42px)", color: "var(--text-1)", letterSpacing: "-0.02em" }}
          >
            3 steps. Zero stress.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24 }}>
          {steps.map((s, i) => (
            <div
              key={s.n}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: 32,
                display: "flex",
                flexDirection: "column",
                gap: 20,
                position: "relative",
              }}
            >
              {/* Connector line for desktop */}
              {i < 2 && (
                <div
                  className="hidden md:block"
                  style={{
                    position: "absolute",
                    top: 46,
                    right: -13,
                    width: 26,
                    height: 1,
                    background: "var(--border-hover)",
                    zIndex: 1,
                  }}
                />
              )}
              <div className="step-dot">{s.n}</div>
              <div>
                <h3
                  className="font-display font-bold"
                  style={{ fontSize: 17, color: "var(--text-1)", marginBottom: 8 }}
                >
                  {s.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURES
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    title: "AI Captions",
    body: "Gemini AI generates captions per post, per platform — always on-brand.",
    path: "M12 2l1.6 5H19l-4.1 3 1.5 5L12 12l-4.4 3 1.5-5L5 7h5.4z",
  },
  {
    title: "Auto Schedule",
    body: "Plan a full month of content in minutes. Set it once, never touch it again.",
    path: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  },
  {
    title: "Media Library",
    body: "One organised home for all your product photos and videos.",
    path: "M3 3h18v18H3zM3 9h18M9 21V9",
  },
  {
    title: "Auto Publish",
    body: "Posts go live on time, every time — no manual action needed.",
    path: "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",
  },
  {
    title: "Analytics",
    body: "See what's working across all platforms at a glance.",
    path: "M18 20V10M12 20V4M6 20v-6",
  },
  {
    title: "Brand Tone",
    body: "Define your voice once. Every caption respects it, forever.",
    path: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
  },
];

function Features() {
  return (
    <section
      id="features"
      style={{
        padding: "96px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-2)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center" style={{ marginBottom: 60 }}>
          <p className="section-eyebrow">Features</p>
          <h2
            className="font-display font-bold"
            style={{ fontSize: "clamp(28px, 4vw, 42px)", color: "var(--text-1)", letterSpacing: "-0.02em" }}
          >
            Everything you need
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 20 }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="icon-box" style={{ marginBottom: 20 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.path}/>
                </svg>
              </div>
              <h3
                className="font-display font-bold"
                style={{ fontSize: 16, color: "var(--text-1)", marginBottom: 10 }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { value: "10×",  label: "Faster content" },
    { value: "3",    label: "Platforms at once" },
    { value: "0",    label: "Daily effort" },
    { value: "100%", label: "Automated posting" },
  ];

  return (
    <section style={{ padding: "72px 24px", borderBottom: "1px solid var(--border)" }}>
      <div
        className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4"
        style={{ gap: 2 }}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            style={{
              textAlign: "center",
              padding: "36px 24px",
              borderRight: i < 3 ? "1px solid var(--border)" : "none",
            }}
          >
            <p
              className="font-display font-extrabold"
              style={{ fontSize: 44, color: "var(--green)", letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              {s.value}
            </p>
            <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 8 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRICING
// ─────────────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Starter",
    price: "₦2000",
    period: null,
    desc: "For small businesses",
    features: ["5 posts / month", "1 platform", "AI caption generation", "Media library"],
    cta: "Get started free",
    featured: false,
  },
  {
    name: "Pro",
    price: "₦20,000",
    period: "/mo",
    desc: "For businesses growing online.",
    features: ["Unlimited posts", "3 platforms", "AI captions + brand tone", "Auto schedule & publish"],
    cta: "Start Pro",
    featured: true,
  },
  {
    name: "Elite",
    price: "₦30,000",
    period: "/mo",
    desc: "For teams managing multiple brands.",
    features: ["Everything in Pro", "4 platforms", "Graphics Generator", "Advanced analytics"],
    cta: "Start ",
    featured: false,
  },
];

function Pricing() {
  return (
    <section
      id="pricing"
      style={{
        padding: "96px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-2)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center" style={{ marginBottom: 60 }}>
          <p className="section-eyebrow">Pricing</p>
          <h2
            className="font-display font-bold"
            style={{ fontSize: "clamp(28px, 4vw, 42px)", color: "var(--text-1)", letterSpacing: "-0.02em" }}
          >
            Simple, transparent plans
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 20, alignItems: "start" }}>
          {PLANS.map((plan) => (
            <div key={plan.name} className={`plan-card ${plan.featured ? "featured" : ""}`}>
              {/* Name + badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 className="font-display font-bold" style={{ fontSize: 16, color: "var(--text-1)" }}>
                  {plan.name}
                </h3>
                {plan.featured && (
                  <span className="badge-green" style={{ fontSize: 10, padding: "4px 10px" }}>Popular</span>
                )}
              </div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span
                  className="font-display font-extrabold"
                  style={{ fontSize: 40, color: "var(--text-1)", letterSpacing: "-0.03em" }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span style={{ fontSize: 14, color: "var(--text-3)" }}>{plan.period}</span>
                )}
              </div>

              <p style={{ fontSize: 13, color: "var(--text-2)" }}>{plan.desc}</p>

              {/* Features */}
              <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--text-2)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/signup"
                className={plan.featured ? "btn-primary" : "btn-ghost"}
                style={{ justifyContent: "center", marginTop: "auto" }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA
// ─────────────────────────────────────────────────────────────────────────────
function Cta() {
  return (
    <section
      className="noise-bg"
      style={{ padding: "120px 24px", textAlign: "center", position: "relative", overflow: "hidden", display: "flex", justifyContent: "center" }}
    >
      <div
        style={{
          position: "absolute", right: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse at center, rgba(0,201,141,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-6" style={{ position: "relative" }}>
        <h2
          className="font-display font-extrabold"
          style={{ fontSize: "clamp(28px, 5vw, 52px)", color: "var(--text-1)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
        >
          Stop worrying about{" "}
          <span style={{ color: "var(--green)", textShadow: "0 0 30px rgba(0,201,141,0.3)" }}>
            what to post.
          </span>
        </h2>
        <p style={{ fontSize: 17, color: "var(--text-2)", maxWidth: 440 }}>
          Join businesses using Postora to stay active online — automatically.
        </p>
        <Link href="/signup" className="btn-primary" style={{ fontSize: 15, padding: "15px 36px" }}>
          Get started for free
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
        <p style={{ fontSize: 12, color: "var(--text-3)" }}>No credit card required.</p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px" }}>
      <div
        className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between"
        style={{ gap: 20 }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0a0e14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <span className="font-display font-bold" style={{ fontSize: 14, color: "var(--text-1)" }}>Postora</span>
        </div>

        {/* Links */}
        <nav style={{ display: "flex", gap: 24, fontSize: 13, color: "var(--text-3)" }}>
          {["Privacy", "Terms", "Contact"].map((l) => (
            <Link
              key={l}
              href={`/${l.toLowerCase()}`}
              style={{ color: "inherit", textDecoration: "none" }}
              className="hover:text-white transition-colors"
            >
              {l}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p style={{ fontSize: 12, color: "var(--text-3)" }}>
          © {new Date().getFullYear()} Postora. All rights reserved.
        </p>
      </div>
    </footer>
  );
}