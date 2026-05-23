"use client";

import { useState, useRef } from "react";
import Topbar from "@/components/dashboard/Topbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type MediaType = "all" | "image" | "video";
type SortBy   = "newest" | "oldest" | "name";

interface MediaItem {
  id: number;
  name: string;
  type: "image" | "video";
  size: string;
  date: string;
  emoji: string; // placeholder for real thumbnails
  used: boolean;
  platform?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_MEDIA: MediaItem[] = [
  { id: 1,  name: "shoe_collection.jpg",   type: "image", size: "2.4 MB", date: "May 23, 2026", emoji: "👟", used: true,  platform: "Instagram" },
  { id: 2,  name: "handbag_promo.mp4",     type: "video", size: "14.1 MB", date: "May 22, 2026", emoji: "👜", used: true,  platform: "TikTok" },
  { id: 3,  name: "dress_summer.jpg",      type: "image", size: "1.8 MB", date: "May 21, 2026", emoji: "👗", used: false },
  { id: 4,  name: "skincare_flat.jpg",     type: "image", size: "3.1 MB", date: "May 20, 2026", emoji: "🧴", used: false },
  { id: 5,  name: "product_reel.mp4",      type: "video", size: "22.7 MB", date: "May 19, 2026", emoji: "🎬", used: true,  platform: "TikTok" },
  { id: 6,  name: "earrings_gold.jpg",     type: "image", size: "1.2 MB", date: "May 18, 2026", emoji: "💛", used: false },
  { id: 7,  name: "perfume_bottle.jpg",    type: "image", size: "2.9 MB", date: "May 17, 2026", emoji: "🧪", used: true,  platform: "Instagram" },
  { id: 8,  name: "lookbook_spring.jpg",   type: "image", size: "4.4 MB", date: "May 16, 2026", emoji: "📸", used: false },
  { id: 9,  name: "unboxing_video.mp4",    type: "video", size: "31.2 MB", date: "May 15, 2026", emoji: "📦", used: false },
  { id: 10, name: "watch_closeup.jpg",     type: "image", size: "2.1 MB", date: "May 14, 2026", emoji: "⌚", used: true,  platform: "Facebook" },
  { id: 11, name: "sandals_beach.jpg",     type: "image", size: "1.6 MB", date: "May 13, 2026", emoji: "👡", used: false },
  { id: 12, name: "brand_intro.mp4",       type: "video", size: "18.5 MB", date: "May 12, 2026", emoji: "✨", used: true,  platform: "Instagram" },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function MediaPage() {
  const [media, setMedia]           = useState<MediaItem[]>(MOCK_MEDIA);
  const [filter, setFilter]         = useState<MediaType>("all");
  const [sortBy, setSortBy]         = useState<SortBy>("newest");
  const [selected, setSelected]     = useState<number[]>([]);
  const [dragging, setDragging]     = useState(false);
  const [preview, setPreview]       = useState<MediaItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Filter + sort ───────────────────────────────────────────────────────────
  const filtered = media
    .filter((m) => filter === "all" || m.type === filter)
    .sort((a, b) => {
      if (sortBy === "newest") return b.id - a.id;
      if (sortBy === "oldest") return a.id - b.id;
      return a.name.localeCompare(b.name);
    });

  // ── Select toggle ───────────────────────────────────────────────────────────
  function toggleSelect(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // ── Fake upload ─────────────────────────────────────────────────────────────
  function simulateUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p === null || p >= 100) {
          clearInterval(interval);
          // Add mock new items
          const newItems: MediaItem[] = Array.from(files).map((file, i) => ({
            id: Date.now() + i,
            name: file.name,
            type: file.type.startsWith("video") ? "video" : "image",
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            date: "Today",
            emoji: file.type.startsWith("video") ? "🎬" : "📷",
            used: false,
          }));
          setMedia((prev) => [...newItems, ...prev]);
          setTimeout(() => setUploadProgress(null), 600);
          return 100;
        }
        return p + 12;
      });
    }, 120);
  }

  // ── Delete selected ─────────────────────────────────────────────────────────
  function deleteSelected() {
    setMedia((prev) => prev.filter((m) => !selected.includes(m.id)));
    setSelected([]);
  }

  const stats = {
    total:  media.length,
    images: media.filter((m) => m.type === "image").length,
    videos: media.filter((m) => m.type === "video").length,
    used:   media.filter((m) => m.used).length,
  };

  return (
    <>
      <Topbar title="Media Library" subtitle={`${stats.total} files · ${stats.images} images · ${stats.videos} videos`} />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Upload zone ──────────────────────────────────────────────────── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            simulateUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "var(--green)" : "var(--border-hover)"}`,
            borderRadius: 16,
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            background: dragging ? "var(--green-muted)" : "var(--surface-2)",
            cursor: "pointer",
            transition: "border-color 0.2s, background 0.2s",
            textAlign: "center",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={(e) => simulateUpload(e.target.files)}
          />

          {uploadProgress !== null ? (
            <UploadProgress progress={uploadProgress} />
          ) : (
            <>
              <div
                style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "var(--green-muted)",
                  border: "1px solid rgba(0,201,141,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--green)",
                }}
              >
                <UploadIcon />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>
                  Drop files here or <span style={{ color: "var(--green)" }}>browse</span>
                </p>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
                  Supports JPG, PNG, MP4, MOV · Max 100MB per file
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
          {[
            { label: "Total files",  value: stats.total,  color: "var(--text-1)" },
            { label: "Images",       value: stats.images, color: "var(--text-1)" },
            { label: "Videos",       value: stats.videos, color: "var(--text-1)" },
            { label: "Used in posts", value: stats.used,  color: "var(--green)" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "14px 18px",
              }}
            >
              <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500, marginBottom: 4 }}>{s.label}</p>
              <p
                style={{
                  fontFamily: "var(--font-sora), sans-serif",
                  fontSize: 26, fontWeight: 700,
                  color: s.color, letterSpacing: "-0.02em",
                }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

          {/* Filter tabs */}
          <div
            style={{
              display: "flex",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 3,
              gap: 2,
            }}
          >
            {(["all", "image", "video"] as MediaType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "none",
                  fontSize: 13, fontWeight: 500,
                  cursor: "pointer",
                  background: filter === f ? "var(--surface-4)" : "transparent",
                  color: filter === f ? "var(--text-1)" : "var(--text-3)",
                  transition: "background 0.15s, color 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {f === "all" ? `All (${stats.total})` : f === "image" ? `Images (${stats.images})` : `Videos (${stats.videos})`}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            style={{
              padding: "7px 12px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontSize: 13, color: "var(--text-2)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
          </select>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Bulk actions — only when items selected */}
          {selected.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-2)" }}>
                {selected.length} selected
              </span>
              <button
                onClick={deleteSelected}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px",
                  background: "rgba(226,75,74,0.1)",
                  border: "1px solid rgba(226,75,74,0.2)",
                  borderRadius: 9,
                  fontSize: 13, fontWeight: 500,
                  color: "#e24b4a",
                  cursor: "pointer",
                }}
              >
                <TrashIcon /> Delete
              </button>
              <button
                onClick={() => setSelected([])}
                style={{
                  padding: "7px 14px",
                  background: "var(--surface-3)",
                  border: "1px solid var(--border)",
                  borderRadius: 9,
                  fontSize: 13, color: "var(--text-2)",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Grid ─────────────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)" }}>
            <p style={{ fontSize: 15 }}>No {filter !== "all" ? filter + "s" : "files"} yet</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Upload some files to get started</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
              gap: 14,
            }}
          >
            {filtered.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                selected={selected.includes(item.id)}
                onSelect={() => toggleSelect(item.id)}
                onPreview={() => setPreview(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Preview modal ─────────────────────────────────────────────────── */}
      {preview && (
        <PreviewModal item={preview} onClose={() => setPreview(null)} />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA CARD
// ─────────────────────────────────────────────────────────────────────────────
function MediaCard({
  item, selected, onSelect, onPreview,
}: {
  item: MediaItem;
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "var(--surface-2)",
        border: `1px solid ${selected ? "var(--green)" : hover ? "var(--border-hover)" : "var(--border)"}`,
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color 0.15s, transform 0.15s",
        transform: hover ? "translateY(-2px)" : "none",
        position: "relative",
      }}
    >
      {/* Thumbnail */}
      <div
        onClick={onPreview}
        style={{
          height: 140,
          background: "var(--surface-3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 48,
          position: "relative",
        }}
      >
        {item.emoji}

        {/* Video badge */}
        {item.type === "video" && (
          <div
            style={{
              position: "absolute", bottom: 8, left: 8,
              background: "rgba(0,0,0,0.65)",
              borderRadius: 6,
              padding: "2px 7px",
              fontSize: 10, fontWeight: 600,
              color: "#fff",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <PlayIcon /> VIDEO
          </div>
        )}

        {/* Hover overlay */}
        {hover && (
          <div
            style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8,
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(); }}
              style={{
                padding: "7px 14px",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 8,
                color: "#fff", fontSize: 12, fontWeight: 600,
                cursor: "pointer",
                backdropFilter: "blur(6px)",
              }}
            >
              Preview
            </button>
          </div>
        )}
      </div>

      {/* Info row */}
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        {/* Checkbox */}
        <div
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          style={{
            width: 16, height: 16, borderRadius: 5, flexShrink: 0,
            background: selected ? "var(--green)" : "var(--surface-4)",
            border: `1px solid ${selected ? "var(--green)" : "var(--border-hover)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
            cursor: "pointer",
          }}
        >
          {selected && (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0a0e14" strokeWidth="4" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 12, fontWeight: 500, color: "var(--text-1)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            {item.name}
          </p>
          <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>{item.size}</p>
        </div>
      </div>

      {/* Used badge */}
      {item.used && (
        <div
          style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(0,201,141,0.15)",
            border: "1px solid rgba(0,201,141,0.25)",
            borderRadius: 6,
            padding: "2px 7px",
            fontSize: 9, fontWeight: 700,
            color: "var(--green)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Used
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW MODAL
// ─────────────────────────────────────────────────────────────────────────────
function PreviewModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border-hover)",
          borderRadius: 20,
          width: "100%", maxWidth: 480,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{item.name}</p>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-3)", padding: 4, display: "flex",
              borderRadius: 6,
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Thumbnail */}
        <div
          style={{
            height: 240,
            background: "var(--surface-3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 80,
          }}
        >
          {item.emoji}
        </div>

        {/* Meta */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="grid grid-cols-2" style={{ gap: 10 }}>
            {[
              { label: "Type",     value: item.type.charAt(0).toUpperCase() + item.type.slice(1) },
              { label: "Size",     value: item.size },
              { label: "Uploaded", value: item.date },
              { label: "Status",   value: item.used ? `Used · ${item.platform}` : "Not used yet" },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  background: "var(--surface-3)",
                  borderRadius: 10,
                  padding: "10px 14px",
                }}
              >
                <p style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 500, marginBottom: 3 }}>{m.label}</p>
                <p style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500 }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              style={{
                flex: 1, padding: "11px",
                background: "var(--green)",
                border: "none", borderRadius: 10,
                fontSize: 13, fontWeight: 600, color: "#0a0e14",
                cursor: "pointer",
              }}
            >
              Use in post
            </button>
            <button
              style={{
                padding: "11px 16px",
                background: "rgba(226,75,74,0.1)",
                border: "1px solid rgba(226,75,74,0.2)",
                borderRadius: 10,
                fontSize: 13, fontWeight: 500, color: "#e24b4a",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
              onClick={onClose}
            >
              <TrashIcon /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD PROGRESS
// ─────────────────────────────────────────────────────────────────────────────
function UploadProgress({ progress }: { progress: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%", maxWidth: 320 }}>
      <div
        style={{
          width: 44, height: 44, borderRadius: 12,
          background: "var(--green-muted)",
          border: "1px solid rgba(0,201,141,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--green)",
        }}
      >
        <UploadIcon />
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>
        {progress < 100 ? "Uploading…" : "Upload complete ✓"}
      </p>
      <div style={{ width: "100%", height: 4, background: "var(--surface-4)", borderRadius: 2, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "var(--green)",
            borderRadius: 2,
            transition: "width 0.1s",
          }}
        />
      </div>
      <p style={{ fontSize: 12, color: "var(--text-3)" }}>{progress}%</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}