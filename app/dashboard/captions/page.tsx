"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/dashboard/Topbar";
import { useAuth } from "@/context/AuthContext";
import { getUserMedia } from "@/lib/firestore";
import { saveCaption, getSavedCaptions, deleteCaption } from "@/lib/firestore";
import { MediaItem } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
type Platform  = "Instagram" | "TikTok" | "Facebook";
type Tone      = "professional" | "fun" | "inspirational" | "promotional";
type GenState  = "idle" | "loading" | "done";

interface Caption {
  id: string | number;
  platform: Platform;
  text: string;
  hashtags: string[];
  saved: boolean;
  mediaId?: string;
}

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

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CaptionsPage() {
  const { user, profile } = useAuth();

  // ── Media from Firestore ──────────────────────────────────────────────────
  const [mediaItems,        setMediaItems]        = useState<MediaItem[]>([]);
  const [mediaLoading,      setMediaLoading]       = useState(true);

  // ── Generate state ────────────────────────────────────────────────────────
  const [selectedMedia,     setSelectedMedia]     = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["Instagram"]);
  const [tone,              setTone]              = useState<Tone>("fun");
  const [context,           setContext]           = useState("");
  const [genState,          setGenState]          = useState<GenState>("idle");
  const [results,           setResults]           = useState<Caption[]>([]);
  const [copied,            setCopied]            = useState<string | number | null>(null);

  // ── Saved captions from Firestore ─────────────────────────────────────────
  const [savedCaptions,     setSavedCaptions]     = useState<Caption[]>([]);
  const [savedLoading,      setSavedLoading]       = useState(true);
  const [activeTab,         setActiveTab]         = useState<"generate" | "saved">("generate");

  // ── Load user media ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    async function loadMedia() {
      try {
        const items = await getUserMedia(user!.uid);
        setMediaItems(items);
      } catch (err) {
        console.error("Failed to load media:", err);
      } finally {
        setMediaLoading(false);
      }
    }
    loadMedia();
  }, [user]);

  // ── Load saved captions ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    async function loadSaved() {
      try {
        const items = await getSavedCaptions(user!.uid);
        setSavedCaptions(items.map((c) => ({
          id:       c.id,
          platform: c.platform as Platform,
          text:     c.text,
          hashtags: c.hashtags,
          saved:    true,
          mediaId:  c.mediaId,
        })));
      } catch (err) {
        console.error("Failed to load saved captions:", err);
      } finally {
        setSavedLoading(false);
      }
    }
    loadSaved();
  }, [user]);

  // ── Toggle platform ───────────────────────────────────────────────────────
  function togglePlatform(p: Platform) {
    setSelectedPlatforms((prev) =>
      prev.includes(p)
        ? prev.length > 1 ? prev.filter((x) => x !== p) : prev
        : [...prev, p]
    );
  }

  // ── Generate with Gemini AI ───────────────────────────────────────────────
  async function generate() {
    if (!selectedMedia || !user) return;
    setGenState("loading");
    setResults([]);

    try {
      const selectedItem = mediaItems.find((m) => m.id === selectedMedia);
      const mediaName    = selectedItem?.name ?? "product";
      const mediaUrl     = selectedItem?.cloudinaryUrl ?? "";

      // Call Gemini API route
      const response = await fetch("/api/generate-caption", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone,
          context,
          platforms: selectedPlatforms,
          mediaName,
          mediaUrl,
          businessName: profile?.business ?? profile?.name ?? "our brand",
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();

      // data.captions: [{ platform, text, hashtags }]
      const generated: Caption[] = data.captions.map((c: { platform: string; text: string; hashtags: string[] }, i: number) => ({
        id:       Date.now() + i,
        platform: c.platform as Platform,
        text:     c.text,
        hashtags: c.hashtags,
        saved:    false,
        mediaId:  selectedMedia,
      }));

      setResults(generated);
      setGenState("done");
    } catch (err) {
      console.error("Generation error:", err);
      setGenState("idle");
    }
  }

  // ── Save caption to Firestore ─────────────────────────────────────────────
  async function handleSaveCaption(caption: Caption) {
    if (!user) return;
    try {
      const docId = await saveCaption(user.uid, {
        mediaId:  selectedMedia ?? undefined,
        platform: caption.platform,
        tone,
        text:     caption.text,
        hashtags: caption.hashtags,
      });

      const saved: Caption = { ...caption, id: docId, saved: true };

      // Update results list
      setResults((prev) => prev.map((c) => c.id === caption.id ? { ...c, saved: true } : c));

      // Add to saved tab
      setSavedCaptions((prev) => [saved, ...prev]);
    } catch (err) {
      console.error("Save caption error:", err);
    }
  }

  // ── Delete saved caption ──────────────────────────────────────────────────
  async function handleDeleteCaption(captionId: string) {
    try {
      await deleteCaption(captionId);
      setSavedCaptions((prev) => prev.filter((c) => c.id !== captionId));
    } catch (err) {
      console.error("Delete caption error:", err);
    }
  }

  // ── Copy ─────────────────────────────────────────────────────────────────
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
        <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: 4, gap: 4, width: "fit-content" }}>
          {(["generate", "saved"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ padding: "8px 20px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", background: activeTab === tab ? "var(--surface-4)" : "transparent", color: activeTab === tab ? "var(--text-1)" : "var(--text-3)", transition: "background 0.15s, color 0.15s" }}
            >
              {tab === "generate" ? "✨ Generate" : `📋 Saved (${savedCaptions.length})`}
            </button>
          ))}
        </div>

        {activeTab === "generate" ? (
          <div className="grid grid-cols-1 lg:grid-cols-5" style={{ gap: 24, alignItems: "start" }}>

            {/* ── LEFT: Config (2/5) ───────────────────────────────────────── */}
            <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* 01 Pick media */}
              <ConfigCard step="01" title="Pick a product" subtitle="Choose from your media library">
                {mediaLoading ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {[1,2,3,4,5,6].map((i) => (
                      <div key={i} style={{ height: 72, background: "var(--surface-3)", borderRadius: 10, animation: "pulse 1.4s ease-in-out infinite" }} />
                    ))}
                    <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
                  </div>
                ) : mediaItems.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <p style={{ fontSize: 12, color: "var(--text-3)" }}>No media yet</p>
                    <a href="/dashboard/media" style={{ fontSize: 12, color: "var(--green)", textDecoration: "none" }}>Upload media →</a>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {mediaItems.slice(0, 6).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMedia(m.id)}
                        style={{ padding: "8px 6px", background: selectedMedia === m.id ? "var(--green-muted)" : "var(--surface-3)", border: `1px solid ${selectedMedia === m.id ? "rgba(0,201,141,0.35)" : "var(--border)"}`, borderRadius: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "all 0.15s", overflow: "hidden" }}
                      >
                        {/* Real thumbnail */}
                        {m.type === "image" ? (
                          <img src={m.cloudinaryUrl} alt={m.name} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6 }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 6, background: "var(--surface-4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎬</div>
                        )}
                        <span style={{ fontSize: 9, color: selectedMedia === m.id ? "var(--green)" : "var(--text-3)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", textAlign: "center" }}>
                          {m.name.split(".")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {mediaItems.length > 6 && (
                  <a href="/dashboard/media" style={{ fontSize: 11, color: "var(--green)", textDecoration: "none", textAlign: "center" }}>
                    View all {mediaItems.length} files →
                  </a>
                )}
              </ConfigCard>

              {/* 02 Platforms */}
              <ConfigCard step="02" title="Choose platforms" subtitle="Select where this will be posted">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PLATFORMS.map((p) => {
                    const active = selectedPlatforms.includes(p.name);
                    return (
                      <button
                        key={p.name}
                        onClick={() => togglePlatform(p.name)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: active ? "var(--green-muted)" : "var(--surface-3)", border: `1px solid ${active ? "rgba(0,201,141,0.3)" : "var(--border)"}`, borderRadius: 10, cursor: "pointer", transition: "all 0.15s" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: active ? "var(--text-1)" : "var(--text-2)" }}>{p.name}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, color: "var(--text-3)" }}>{p.limit}</span>
                          <div style={{ width: 16, height: 16, borderRadius: 5, background: active ? "var(--green)" : "var(--surface-4)", border: `1px solid ${active ? "var(--green)" : "var(--border-hover)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {active && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0a0e14" strokeWidth="4" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ConfigCard>

              {/* 03 Tone */}
              <ConfigCard step="03" title="Brand tone" subtitle="How should the caption sound?">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      style={{ padding: "10px 12px", background: tone === t.value ? "var(--green-muted)" : "var(--surface-3)", border: `1px solid ${tone === t.value ? "rgba(0,201,141,0.3)" : "var(--border)"}`, borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                    >
                      <p style={{ fontSize: 12, fontWeight: 600, color: tone === t.value ? "var(--green)" : "var(--text-1)" }}>{t.label}</p>
                      <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>{t.desc}</p>
                    </button>
                  ))}
                </div>
              </ConfigCard>

              {/* 04 Context */}
              <ConfigCard step="04" title="Extra context" subtitle="Optional — product details, price, promo info">
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. 'Limited edition drop, launching Friday. Price: ₦15,000.'"
                  rows={3}
                  style={{ width: "100%", padding: "11px 14px", background: "var(--surface-3)", border: "1px solid var(--border-hover)", borderRadius: 10, fontSize: 13, color: "var(--text-1)", resize: "none", outline: "none", lineHeight: 1.6, fontFamily: "inherit", transition: "border-color 0.2s" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-hover)")}
                />
              </ConfigCard>

              {/* AI usage indicator */}
              {profile && (
                <div style={{ padding: "10px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>AI captions used</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>
                    {profile.aiUsed ?? 0} / {profile.plan === "Elite" ? "∞" : profile.plan === "Pro" ? "100" : "20"}
                  </span>
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={generate}
                disabled={!canGenerate || genState === "loading"}
                style={{ width: "100%", padding: "14px", background: canGenerate ? "var(--green)" : "var(--surface-3)", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, color: canGenerate ? "#0a0e14" : "var(--text-3)", cursor: canGenerate ? "pointer" : "not-allowed", opacity: genState === "loading" ? 0.75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s, opacity 0.2s" }}
              >
                {genState === "loading" ? <><Spinner /> Gemini is writing…</> : <><SparkleIcon /> Generate captions</>}
              </button>
              {!selectedMedia && <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", marginTop: -12 }}>Select a product first</p>}
            </div>

            {/* ── RIGHT: Results (3/5) ──────────────────────────────────────── */}
            <div style={{ gridColumn: "span 3", display: "flex", flexDirection: "column", gap: 16 }}>
              {genState === "idle"    && <EmptyState />}
              {genState === "loading" && <LoadingCards count={selectedPlatforms.length} />}
              {genState === "done" && results.length > 0 && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 13, color: "var(--text-2)" }}>{results.length} caption{results.length > 1 ? "s" : ""} generated</p>
                    <button onClick={generate} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "var(--surface-2)", border: "1px solid var(--border-hover)", borderRadius: 9, fontSize: 12, fontWeight: 500, color: "var(--text-2)", cursor: "pointer" }}>
                      <RefreshIcon /> Regenerate
                    </button>
                  </div>
                  {results.map((caption) => (
                    <CaptionCard
                      key={caption.id}
                      caption={caption}
                      copied={copied === caption.id}
                      onCopy={() => copyCaption(caption)}
                      onSave={() => handleSaveCaption(caption)}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        ) : (
          /* ── SAVED tab ───────────────────────────────────────────────────── */
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {savedLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[1,2].map((i) => (
                  <div key={i} style={{ height: 160, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, animation: "pulse 1.4s ease-in-out infinite" }} />
                ))}
              </div>
            ) : savedCaptions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-3)" }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>📋</p>
                <p style={{ fontSize: 15 }}>No saved captions yet</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>Generate and save captions to see them here</p>
              </div>
            ) : (
              savedCaptions.map((caption) => (
                <CaptionCard
                  key={caption.id}
                  caption={caption}
                  copied={copied === caption.id}
                  onCopy={() => copyCaption(caption)}
                  onSave={() => {}}
                  onDelete={() => handleDeleteCaption(caption.id as string)}
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
// CONFIG CARD
// ─────────────────────────────────────────────────────────────────────────────
function ConfigCard({ step, title, subtitle, children }: { step: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: "var(--green-muted)", border: "1px solid rgba(0,201,141,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-sora), sans-serif" }}>
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
function CaptionCard({ caption, copied, onCopy, onSave, onDelete, isSaved = false }: {
  caption: Caption; copied: boolean; onCopy: () => void; onSave: () => void; onDelete?: () => void; isSaved?: boolean;
}) {
  const platformColors: Record<Platform, string> = { Instagram: "#E1306C", TikTok: "#69C9D0", Facebook: "#1877F2" };
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14, transition: "border-color 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: `${platformColors[caption.platform]}18`, color: platformColors[caption.platform], letterSpacing: "0.04em" }}>{caption.platform}</span>
        {(isSaved || caption.saved) && (
          <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: "var(--green-muted)", color: "var(--green)", border: "1px solid rgba(0,201,141,0.2)" }}>Saved</span>
        )}
      </div>
      <p style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.7 }}>{caption.text}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {caption.hashtags.map((tag) => (
          <span key={tag} style={{ fontSize: 12, fontWeight: 500, color: "var(--green)", background: "var(--green-muted)", padding: "3px 10px", borderRadius: 999, border: "1px solid rgba(0,201,141,0.15)" }}>{tag}</span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <button onClick={onCopy} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", background: copied ? "var(--green-muted)" : "var(--surface-3)", border: `1px solid ${copied ? "rgba(0,201,141,0.3)" : "var(--border)"}`, borderRadius: 9, fontSize: 12, fontWeight: 500, color: copied ? "var(--green)" : "var(--text-2)", cursor: "pointer", transition: "all 0.15s" }}>
          {copied ? <CheckIcon /> : <CopyIcon />} {copied ? "Copied!" : "Copy"}
        </button>
        {!isSaved && !caption.saved && (
          <button onClick={onSave} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 9, fontSize: 12, fontWeight: 500, color: "var(--text-2)", cursor: "pointer" }}>
            <SaveIcon /> Save
          </button>
        )}
        {isSaved && onDelete && (
          <button onClick={onDelete} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.15)", borderRadius: 9, fontSize: 12, fontWeight: 500, color: "#e24b4a", cursor: "pointer" }}>
            <TrashIcon /> Delete
          </button>
        )}
        <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px", background: "var(--green)", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 600, color: "#0a0e14", cursor: "pointer" }}>
          <SendIcon /> Use in post
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ background: "var(--surface-2)", border: "1px dashed var(--border-hover)", borderRadius: 16, padding: "72px 40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--green-muted)", border: "1px solid rgba(0,201,141,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 4 }}>✨</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>Ready to generate</p>
      <p style={{ fontSize: 13, color: "var(--text-3)", maxWidth: 280, lineHeight: 1.6 }}>Pick a product, choose your platforms and tone, then hit Generate.</p>
    </div>
  );
}

function LoadingCards({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: Math.max(count, 1) }).map((_, i) => (
        <div key={i} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ width: 80, height: 22, background: "var(--surface-3)", borderRadius: 999, animation: "pulse 1.4s ease-in-out infinite" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[100, 80, 60].map((w, j) => (
              <div key={j} style={{ height: 14, background: "var(--surface-3)", borderRadius: 6, width: `${w}%`, animation: "pulse 1.4s ease-in-out infinite" }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[60, 80, 70].map((w, j) => (
              <div key={j} style={{ height: 24, width: w, background: "var(--surface-3)", borderRadius: 999, animation: "pulse 1.4s ease-in-out infinite" }} />
            ))}
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        </div>
      ))}
      <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-3)" }}>Gemini AI is crafting your captions…</p>
    </>
  );
}

// Icons
function SparkleIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l1.6 5H19l-4.1 3 1.5 5L12 12l-4.4 3 1.5-5L5 7h5.4z"/></svg>; }
function Spinner()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>; }
function CopyIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>; }
function CheckIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function SaveIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>; }
function SendIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>; }
function RefreshIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>; }
function TrashIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>; }