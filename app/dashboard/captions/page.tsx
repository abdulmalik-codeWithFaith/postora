"use client";

import { useState } from "react";
import Topbar from "@/components/dashboard/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type Platform  = "Instagram" | "TikTok" | "Facebook";
type Tone      = "professional" | "fun" | "inspirational" | "promotional";
type GenState  = "idle" | "loading" | "done";

interface Caption {
  id: number;
  platform: Platform;
  text: string;
  hashtags: string[];
  saved: boolean;
}

// ─── Mock media for picker ────────────────────────────────────────────────────
const MEDIA_ITEMS = [
  { id: 1, name: "shoe_collection.jpg",  emoji: "👟" },
  { id: 2, name: "handbag_promo.mp4",    emoji: "👜" },
  { id: 3, name: "dress_summer.jpg",     emoji: "👗" },
  { id: 4, name: "skincare_flat.jpg",    emoji: "🧴" },
  { id: 5, name: "earrings_gold.jpg",    emoji: "💛" },
  { id: 6, name: "perfume_bottle.jpg",   emoji: "🧪" },
];

// ─── Saved captions history ───────────────────────────────────────────────────
const SAVED_HISTORY: Caption[] = [
  {
    id: 101, platform: "Instagram", saved: true,
    text: "Step into the season. Made for those who move with purpose. Shop link in bio 🔗",
    hashtags: ["#NewArrivals", "#ShoeLovers", "#OOTD", "#Fashion"],
  },
  {
    id: 102, platform: "TikTok", saved: true,
    text: "Your wardrobe called — it wants an upgrade. New collection just dropped 🔥",
    hashtags: ["#FashionTok", "#GRWM", "#NewIn", "#StyleTips"],
  },
  {
    id: 103, platform: "Facebook", saved: true,
    text: "Carry less, do more. Our new mini bag collection is designed for the modern woman on the go.",
    hashtags: ["#NewCollection", "#HandbagsOfInstagram", "#StyleInspo"],
  },
];

// ─── Platform config ──────────────────────────────────────────────────────────
const PLATFORMS: { name: Platform; color: string; limit: string }[] = [
  { name: "Instagram", color: "#E1306C", limit: "2,200 chars" },
  { name: "TikTok",    color: "#69C9D0", limit: "2,200 chars" },
  { name: "Facebook",  color: "#1877F2", limit: "63,206 chars" },
];

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: "professional",  label: "Professional",  desc: "Clean, trustworthy" },
  { value: "fun",           label: "Fun & Playful",  desc: "Casual, energetic" },
  { value: "inspirational", label: "Inspirational", desc: "Motivating, warm" },
  { value: "promotional",   label: "Promotional",   desc: "Sales-focused, CTA" },
];

// ─── Fake AI-generated captions per tone ──────────────────────────────────────
const GENERATED: Record<Tone, Caption[]> = {
  professional: [
    { id: 1, platform: "Instagram", saved: false, text: "Elevate your everyday look with our latest collection. Precision craftsmanship meets contemporary design. Shop now via link in bio.", hashtags: ["#NewCollection", "#Fashion", "#Style", "#QualityCraft"] },
    { id: 2, platform: "TikTok",    saved: false, text: "Introducing a collection built for those who lead. Every detail intentional. Every piece, timeless.", hashtags: ["#FashionTok", "#StyleGuide", "#NewArrivals"] },
    { id: 3, platform: "Facebook",  saved: false, text: "We're proud to introduce our latest collection — designed with care, crafted for confidence. Explore the full range on our website.", hashtags: ["#NewIn", "#FashionForward", "#ShopNow"] },
  ],
  fun: [
    { id: 1, platform: "Instagram", saved: false, text: "Okay but have you SEEN these? 😍 New drops just hit the store and we're absolutely obsessed. Go go go — link in bio!", hashtags: ["#ObsessedWithThis", "#NewDrop", "#ShopNow", "#Slay"] },
    { id: 2, platform: "TikTok",    saved: false, text: "POV: you just found your new fave outfit 👀✨ we dropped something good and you NEED to see it", hashtags: ["#FashionTok", "#OOTD", "#TikTokFashion", "#Fyp"] },
    { id: 3, platform: "Facebook",  saved: false, text: "New week, new drops, new excuse to treat yourself 🛍️ Come see what just landed in store — you're going to love it!", hashtags: ["#NewArrival", "#TreatYourself", "#ShopLocal"] },
  ],
  inspirational: [
    { id: 1, platform: "Instagram", saved: false, text: "Style is a way to say who you are without having to speak. Let your look do the talking this season. 🌿", hashtags: ["#StyleIsEverything", "#WearYourStory", "#Confidence", "#Fashion"] },
    { id: 2, platform: "TikTok",    saved: false, text: "Dress like the version of yourself you're becoming 💫 New collection, new chapter.", hashtags: ["#GrowthMindset", "#FashionTok", "#NewChapter", "#Glow"] },
    { id: 3, platform: "Facebook",  saved: false, text: "Every great day starts with feeling good in what you wear. Our new collection is here to make that easy for you.", hashtags: ["#FeelGoodFashion", "#DressForSuccess", "#NewCollection"] },
  ],
  promotional: [
    { id: 1, platform: "Instagram", saved: false, text: "🔥 NEW DROP ALERT! Our best-selling styles just got restocked + new pieces added. Limited stock — don't sleep on this. Shop link in bio 👆", hashtags: ["#LimitedStock", "#ShopNow", "#NewArrival", "#SaleAlert"] },
    { id: 2, platform: "TikTok",    saved: false, text: "SHOP THIS NOW before it sells out 🚨 New collection just dropped and it's going FAST. Link in bio!", hashtags: ["#ShopNow", "#TikTokMadeMeBuyIt", "#LimitedEdition", "#Fyp"] },
    { id: 3, platform: "Facebook",  saved: false, text: "🛍️ JUST DROPPED: Our newest collection is live! Free delivery on orders over ₦10,000. Shop before stock runs out — link below 👇", hashtags: ["#ShopNow", "#FreeDelivery", "#NewIn", "#LimitedStock"] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CaptionsPage() {
  const [selectedMedia, setSelectedMedia] = useState<number | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["Instagram"]);
  const [tone, setTone]         = useState<Tone>("fun");
  const [context, setContext]   = useState("");
  const [genState, setGenState] = useState<GenState>("idle");
  const [results, setResults]   = useState<Caption[]>([]);
  const [saved, setSaved]       = useState<Caption[]>(SAVED_HISTORY);
  const [activeTab, setActiveTab] = useState<"generate" | "saved">("generate");
  const [copied, setCopied]     = useState<number | null>(null);

  // ── Toggle platform ─────────────────────────────────────────────────────────
  function togglePlatform(p: Platform) {
    setSelectedPlatforms((prev) =>
      prev.includes(p)
        ? prev.length > 1 ? prev.filter((x) => x !== p) : prev
        : [...prev, p]
    );
  }

  // ── Generate ────────────────────────────────────────────────────────────────
  function generate() {
    if (!selectedMedia) return;
    setGenState("loading");
    setResults([]);
    // TODO: replace timeout with real Gemini AI API call
    // const prompt = `Generate a ${tone} social media caption for this product...`
    // const response = await fetch("/api/generate-caption", { method: "POST", body: JSON.stringify({ tone, context, platforms: selectedPlatforms }) })
    setTimeout(() => {
      const allCaptions = GENERATED[tone];
      const filtered = allCaptions.filter((c) => selectedPlatforms.includes(c.platform));
      setResults(filtered.length > 0 ? filtered : allCaptions);
      setGenState("done");
    }, 2200);
  }

  // ── Save caption ────────────────────────────────────────────────────────────
  function saveCaption(caption: Caption) {
    const updated = { ...caption, saved: true, id: Date.now() };
    setSaved((prev) => [updated, ...prev]);
    setResults((prev) => prev.map((c) => c.id === caption.id ? { ...c, saved: true } : c));
  }

  // ── Copy caption ────────────────────────────────────────────────────────────
  function copyCaption(caption: Caption) {
    const full = `${caption.text}\n\n${caption.hashtags.join(" ")}`;
    navigator.clipboard.writeText(full).catch(() => {});
    setCopied(caption.id);
    setTimeout(() => setCopied(null), 2000);
  }

  const canGenerate = selectedMedia !== null && selectedPlatforms.length > 0;

  return (
    <>
      <Topbar
        title="AI Captions"
        subtitle="Generate platform-ready captions with Gemini AI"
      />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 4,
            gap: 4,
            width: "fit-content",
          }}
        >
          {(["generate", "saved"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 20px",
                borderRadius: 9,
                border: "none",
                fontSize: 13, fontWeight: 500,
                cursor: "pointer",
                background: activeTab === tab ? "var(--surface-4)" : "transparent",
                color: activeTab === tab ? "var(--text-1)" : "var(--text-3)",
                transition: "background 0.15s, color 0.15s",
                textTransform: "capitalize",
              }}
            >
              {tab === "generate" ? "✨ Generate" : `📋 Saved (${saved.length})`}
            </button>
          ))}
        </div>

        {activeTab === "generate" ? (
          <div className="grid grid-cols-1 lg:grid-cols-5" style={{ gap: 24, alignItems: "start" }}>

            {/* ── LEFT: Config panel (2/5) ─────────────────────────────────── */}
            <div
              style={{
                gridColumn: "span 2",
                display: "flex", flexDirection: "column", gap: 20,
              }}
            >

              {/* 1. Pick media */}
              <ConfigCard
                step="01"
                title="Pick a product"
                subtitle="Choose the media you want to post"
              >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {MEDIA_ITEMS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMedia(m.id)}
                      style={{
                        padding: "10px 6px",
                        background: selectedMedia === m.id ? "var(--green-muted)" : "var(--surface-3)",
                        border: `1px solid ${selectedMedia === m.id ? "rgba(0,201,141,0.35)" : "var(--border)"}`,
                        borderRadius: 10,
                        cursor: "pointer",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{m.emoji}</span>
                      <span
                        style={{
                          fontSize: 9, color: selectedMedia === m.id ? "var(--green)" : "var(--text-3)",
                          fontWeight: 500,
                          overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap", width: "100%", textAlign: "center",
                        }}
                      >
                        {m.name.split(".")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </ConfigCard>

              {/* 2. Platforms */}
              <ConfigCard
                step="02"
                title="Choose platforms"
                subtitle="Select where this will be posted"
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PLATFORMS.map((p) => {
                    const active = selectedPlatforms.includes(p.name);
                    return (
                      <button
                        key={p.name}
                        onClick={() => togglePlatform(p.name)}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "10px 14px",
                          background: active ? "var(--green-muted)" : "var(--surface-3)",
                          border: `1px solid ${active ? "rgba(0,201,141,0.3)" : "var(--border)"}`,
                          borderRadius: 10,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 8, height: 8, borderRadius: "50%",
                              background: p.color,
                            }}
                          />
                          <span style={{ fontSize: 13, fontWeight: 500, color: active ? "var(--text-1)" : "var(--text-2)" }}>
                            {p.name}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, color: "var(--text-3)" }}>{p.limit}</span>
                          <div
                            style={{
                              width: 16, height: 16, borderRadius: 5,
                              background: active ? "var(--green)" : "var(--surface-4)",
                              border: `1px solid ${active ? "var(--green)" : "var(--border-hover)"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {active && (
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0a0e14" strokeWidth="4" strokeLinecap="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ConfigCard>

              {/* 3. Tone */}
              <ConfigCard
                step="03"
                title="Brand tone"
                subtitle="How should the caption sound?"
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      style={{
                        padding: "10px 12px",
                        background: tone === t.value ? "var(--green-muted)" : "var(--surface-3)",
                        border: `1px solid ${tone === t.value ? "rgba(0,201,141,0.3)" : "var(--border)"}`,
                        borderRadius: 10,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                      }}
                    >
                      <p style={{ fontSize: 12, fontWeight: 600, color: tone === t.value ? "var(--green)" : "var(--text-1)" }}>
                        {t.label}
                      </p>
                      <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>{t.desc}</p>
                    </button>
                  ))}
                </div>
              </ConfigCard>

              {/* 4. Extra context */}
              <ConfigCard
                step="04"
                title="Extra context"
                subtitle="Optional — add product details, promo info, etc."
              >
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. 'This is a limited edition drop, launching Friday. Price: ₦15,000.'"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    background: "var(--surface-3)",
                    border: "1px solid var(--border-hover)",
                    borderRadius: 10,
                    fontSize: 13, color: "var(--text-1)",
                    resize: "none",
                    outline: "none",
                    lineHeight: 1.6,
                    fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
                />
              </ConfigCard>

              {/* Generate button */}
              <button
                onClick={generate}
                disabled={!canGenerate || genState === "loading"}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: canGenerate ? "var(--green)" : "var(--surface-3)",
                  border: "none", borderRadius: 12,
                  fontSize: 14, fontWeight: 700,
                  color: canGenerate ? "#0a0e14" : "var(--text-3)",
                  cursor: canGenerate ? "pointer" : "not-allowed",
                  opacity: genState === "loading" ? 0.75 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.2s, opacity 0.2s",
                }}
              >
                {genState === "loading" ? (
                  <>
                    <Spinner /> Gemini is writing…
                  </>
                ) : (
                  <>
                    <SparkleIcon /> Generate captions
                  </>
                )}
              </button>

              {!selectedMedia && (
                <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", marginTop: -12 }}>
                  Select a product first
                </p>
              )}
            </div>

            {/* ── RIGHT: Results (3/5) ──────────────────────────────────────── */}
            <div style={{ gridColumn: "span 3", display: "flex", flexDirection: "column", gap: 16 }}>

              {genState === "idle" && (
                <EmptyState />
              )}

              {genState === "loading" && (
                <LoadingCards count={selectedPlatforms.length} />
              )}

              {genState === "done" && results.length > 0 && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 13, color: "var(--text-2)" }}>
                      {results.length} caption{results.length > 1 ? "s" : ""} generated
                    </p>
                    <button
                      onClick={generate}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 14px",
                        background: "var(--surface-2)",
                        border: "1px solid var(--border-hover)",
                        borderRadius: 9,
                        fontSize: 12, fontWeight: 500, color: "var(--text-2)",
                        cursor: "pointer",
                      }}
                    >
                      <RefreshIcon /> Regenerate
                    </button>
                  </div>

                  {results.map((caption) => (
                    <CaptionCard
                      key={caption.id}
                      caption={caption}
                      copied={copied === caption.id}
                      onCopy={() => copyCaption(caption)}
                      onSave={() => saveCaption(caption)}
                    />
                  ))}
                </>
              )}
            </div>

          </div>
        ) : (
          /* ── SAVED tab ───────────────────────────────────────────────────── */
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {saved.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-3)" }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>📋</p>
                <p style={{ fontSize: 15 }}>No saved captions yet</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>Generate and save captions to see them here</p>
              </div>
            ) : (
              saved.map((caption) => (
                <CaptionCard
                  key={caption.id}
                  caption={caption}
                  copied={copied === caption.id}
                  onCopy={() => copyCaption(caption)}
                  onSave={() => {}}
                  isSaved
                />
              ))
            )}
          </div>
        )}
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG CARD WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function ConfigCard({
  step, title, subtitle, children,
}: {
  step: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
            background: "var(--green-muted)",
            border: "1px solid rgba(0,201,141,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "var(--green)",
            fontFamily: "var(--font-sora), sans-serif",
          }}
        >
          {step}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{title}</p>
          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAPTION CARD
// ─────────────────────────────────────────────────────────────────────────────
function CaptionCard({
  caption, copied, onCopy, onSave, isSaved = false,
}: {
  caption: Caption;
  copied: boolean;
  onCopy: () => void;
  onSave: () => void;
  isSaved?: boolean;
}) {
  const platformColors: Record<Platform, string> = {
    Instagram: "#E1306C",
    TikTok:    "#69C9D0",
    Facebook:  "#1877F2",
  };

  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "border-color 0.2s",
      }}
    >
      {/* Platform badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: 11, fontWeight: 700,
            padding: "3px 10px", borderRadius: 999,
            background: `${platformColors[caption.platform]}18`,
            color: platformColors[caption.platform],
            letterSpacing: "0.04em",
          }}
        >
          {caption.platform}
        </span>
        {(isSaved || caption.saved) && (
          <span
            style={{
              fontSize: 10, fontWeight: 600,
              padding: "3px 9px", borderRadius: 999,
              background: "var(--green-muted)",
              color: "var(--green)",
              border: "1px solid rgba(0,201,141,0.2)",
            }}
          >
            Saved
          </span>
        )}
      </div>

      {/* Caption text */}
      <p style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.7 }}>
        {caption.text}
      </p>

      {/* Hashtags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {caption.hashtags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: 12, fontWeight: 500,
              color: "var(--green)",
              background: "var(--green-muted)",
              padding: "3px 10px", borderRadius: 999,
              border: "1px solid rgba(0,201,141,0.15)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <button
          onClick={onCopy}
          style={{
            flex: 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "9px",
            background: copied ? "var(--green-muted)" : "var(--surface-3)",
            border: `1px solid ${copied ? "rgba(0,201,141,0.3)" : "var(--border)"}`,
            borderRadius: 9,
            fontSize: 12, fontWeight: 500,
            color: copied ? "var(--green)" : "var(--text-2)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied!" : "Copy"}
        </button>

        {!isSaved && !caption.saved && (
          <button
            onClick={onSave}
            style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px",
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              borderRadius: 9,
              fontSize: 12, fontWeight: 500, color: "var(--text-2)",
              cursor: "pointer",
            }}
          >
            <SaveIcon /> Save
          </button>
        )}

        <button
          style={{
            flex: 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "9px",
            background: "var(--green)",
            border: "none", borderRadius: 9,
            fontSize: 12, fontWeight: 600, color: "#0a0e14",
            cursor: "pointer",
          }}
        >
          <SendIcon /> Use in post
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px dashed var(--border-hover)",
        borderRadius: 16,
        padding: "72px 40px",
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", gap: 10,
      }}
    >
      <div
        style={{
          width: 56, height: 56, borderRadius: 16,
          background: "var(--green-muted)",
          border: "1px solid rgba(0,201,141,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, marginBottom: 4,
        }}
      >
        ✨
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>
        Ready to generate
      </p>
      <p style={{ fontSize: 13, color: "var(--text-3)", maxWidth: 280, lineHeight: 1.6 }}>
        Pick a product, choose your platforms and tone, then hit Generate.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SKELETON CARDS
// ─────────────────────────────────────────────────────────────────────────────
function LoadingCards({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: Math.max(count, 1) }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: 20,
            display: "flex", flexDirection: "column", gap: 14,
          }}
        >
          {/* Platform badge skeleton */}
          <div style={{ width: 80, height: 22, background: "var(--surface-3)", borderRadius: 999, animation: "pulse 1.4s ease-in-out infinite" }} />
          {/* Text skeletons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ height: 14, background: "var(--surface-3)", borderRadius: 6, animation: "pulse 1.4s ease-in-out infinite" }} />
            <div style={{ height: 14, background: "var(--surface-3)", borderRadius: 6, width: "80%", animation: "pulse 1.4s ease-in-out infinite" }} />
            <div style={{ height: 14, background: "var(--surface-3)", borderRadius: 6, width: "60%", animation: "pulse 1.4s ease-in-out infinite" }} />
          </div>
          {/* Hashtag skeletons */}
          <div style={{ display: "flex", gap: 6 }}>
            {[60, 80, 70].map((w, j) => (
              <div key={j} style={{ height: 24, width: w, background: "var(--surface-3)", borderRadius: 999, animation: "pulse 1.4s ease-in-out infinite" }} />
            ))}
          </div>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
      ))}
      <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-3)" }}>
        Gemini AI is crafting your captions…
      </p>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
function SparkleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l1.6 5H19l-4.1 3 1.5 5L12 12l-4.4 3 1.5-5L5 7h5.4z"/>
    </svg>
  );
}
function Spinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function SaveIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  );
}