"use client";

import { useState, useRef, useEffect } from "react";
import Topbar from "@/components/dashboard/Topbar";
import { useAuth } from "@/context/AuthContext";
import { getUserMedia, addMediaRecord, deleteMediaRecord } from "@/lib/firestore";
import { uploadToCloudinary, deleteFromCloudinary, formatBytes } from "@/lib/coudinary";
import { MediaItem as FirestoreMediaItem } from "@/types";
import CampaignWizardModal from "@/components/dashboard/Campaignwizardmodal";

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterType = "all" | "image" | "video";
type SortBy     = "newest" | "oldest" | "name";

type UploadError = { fileName: string; message: string };

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function MediaPage() {
  const { user } = useAuth();

  const [media,           setMedia]           = useState<FirestoreMediaItem[]>([]);
  const [filter,          setFilter]          = useState<FilterType>("all");
  const [sortBy,          setSortBy]          = useState<SortBy>("newest");
  const [selected,        setSelected]        = useState<string[]>([]);
  const [dragging,        setDragging]        = useState(false);
  const [preview,         setPreview]         = useState<FirestoreMediaItem | null>(null);
  const [uploadProgress,  setUploadProgress]  = useState<number | null>(null);
  const [uploadingName,   setUploadingName]   = useState("");
  const [uploadErrors,    setUploadErrors]    = useState<UploadError[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [deleting,        setDeleting]        = useState<string | null>(null);
  const [deleteError,     setDeleteError]     = useState<string | null>(null);
  const [showWizard,      setShowWizard]      = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load media from Firestore ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    loadMedia();
  }, [user]);

  async function loadMedia() {
    try {
      setLoading(true);
      const items = await getUserMedia(user!.uid);
      setMedia(items);
    } catch (err) {
      console.error("Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  }

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const filtered = media
    .filter((m) => filter === "all" || m.type === filter)
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });

  // ── Select toggle ─────────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // ── Upload to Cloudinary + save to Firestore ──────────────────────────────
  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0 || !user) return;

    setUploadErrors([]);

    for (const file of Array.from(files)) {
      setUploadingName(file.name);
      setUploadProgress(0);

      try {
        // 1. Upload to Cloudinary with progress
        const result = await uploadToCloudinary(file, "postora/media", (pct) => {
          setUploadProgress(pct);
        });

        // 2. Save record to Firestore
        const docId = await addMediaRecord(user.uid, {
          name:               file.name,
          type:               file.type.startsWith("video") ? "video" : "image",
          size:               formatBytes(result.bytes),
          cloudinaryUrl:      result.secureUrl,
          cloudinaryPublicId: result.publicId,
          usedInPost:         false,
        });

        // 3. Add to local state immediately
        const newItem: FirestoreMediaItem = {
          id:                 docId,
          userId:             user.uid,
          name:               file.name,
          type:               file.type.startsWith("video") ? "video" : "image",
          size:               formatBytes(result.bytes),
          cloudinaryUrl:      result.secureUrl,
          cloudinaryPublicId: result.publicId,
          usedInPost:         false,
          createdAt:          new Date().toISOString(),
        };
        setMedia((prev) => [newItem, ...prev]);

      } catch (err) {
        console.error("Upload failed:", err);
        // Surface the failure instead of letting the progress bar just vanish —
        // the user needs to know this specific file didn't make it in.
        setUploadErrors((prev) => [
          ...prev,
          { fileName: file.name, message: "Upload failed. Check the file and try again." },
        ]);
      }
    }

    setUploadProgress(null);
    setUploadingName("");
  }

  // ── Delete single ─────────────────────────────────────────────────────────
  async function deleteItem(item: FirestoreMediaItem) {
    setDeleteError(null);
    setDeleting(item.id);

    // Delete from Cloudinary and Firestore as two separate steps so a failure
    // partway through leaves a clear, recoverable state instead of an orphaned
    // Firestore record silently pointing at media that no longer exists.
    try {
      await deleteFromCloudinary(item.cloudinaryPublicId);
    } catch (err) {
      console.error("Cloudinary delete failed:", err);
      setDeleteError(`Couldn't delete "${item.name}" from storage. Nothing was removed — try again.`);
      setDeleting(null);
      return;
    }

    try {
      await deleteMediaRecord(item.id);
      setMedia((prev) => prev.filter((m) => m.id !== item.id));
      setPreview(null);
    } catch (err) {
      console.error("Firestore delete failed:", err);
      // The file is already gone from Cloudinary at this point — flag it
      // clearly rather than pretending the delete fully succeeded.
      setDeleteError(`"${item.name}" was removed from storage, but its library entry couldn't be deleted. It may still show up here — try deleting it again.`);
    } finally {
      setDeleting(null);
    }
  }

  // ── Delete selected ───────────────────────────────────────────────────────
  async function deleteSelected() {
    const toDelete = media.filter((m) => selected.includes(m.id));
    for (const item of toDelete) {
      await deleteItem(item);
    }
    setSelected([]);
  }

  const stats = {
    total:  media.length,
    images: media.filter((m) => m.type === "image").length,
    videos: media.filter((m) => m.type === "video").length,
    used:   media.filter((m) => m.usedInPost).length,
  };

  return (
    <>
      <Topbar
        title="Media Library"
        subtitle={loading ? "Loading…" : `${stats.total} files · ${stats.images} images · ${stats.videos} videos`}
      />

      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Create Monthly Campaign CTA ──────────────────────────────────── */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            padding: "18px 22px",
            background: "linear-gradient(135deg, rgba(0,201,141,0.10) 0%, rgba(0,201,141,0.03) 100%)",
            border: "1px solid rgba(0,201,141,0.25)", borderRadius: 16,
          }}
        >
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", fontFamily: "var(--font-sora), sans-serif", marginBottom: 3 }}>
              Ready to plan this month?
            </p>
            <p style={{ fontSize: 12, color: "var(--text-3)" }}>
              {media.length === 0
                ? "Upload some media first, then let AI build your full month of posts."
                : "AI will pick the right image for each day and write captions + hashtags for the whole month."}
            </p>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            disabled={media.length === 0}
            title={media.length === 0 ? "Upload media first" : undefined}
            style={{
              flexShrink: 0, padding: "11px 20px",
              background: media.length === 0 ? "var(--surface-4)" : "var(--green)",
              border: "none", borderRadius: 11, fontSize: 13, fontWeight: 700,
              color: media.length === 0 ? "var(--text-3)" : "#0a0e14",
              cursor: media.length === 0 ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Create Monthly Campaign ✨
          </button>
        </div>

        {/* ── Upload zone ──────────────────────────────────────────────────── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "var(--green)" : "var(--border-hover)"}`,
            borderRadius: 16, padding: "32px 24px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
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
            onChange={(e) => handleUpload(e.target.files)}
          />

          {uploadProgress !== null ? (
            <UploadProgress progress={uploadProgress} fileName={uploadingName} />
          ) : (
            <>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--green-muted)", border: "1px solid rgba(0,201,141,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}>
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

        {/* ── Upload errors ────────────────────────────────────────────────── */}
        {uploadErrors.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {uploadErrors.map((e, i) => (
              <div key={`${e.fileName}-${i}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 10 }}>
                <span style={{ fontSize: 13, color: "#e24b4a" }}>
                  <strong>{e.fileName}</strong> — {e.message}
                </span>
                <button
                  onClick={() => setUploadErrors((prev) => prev.filter((_, idx) => idx !== i))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#e24b4a", padding: 2, display: "flex", flexShrink: 0 }}
                >
                  <CloseIcon />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Delete error banner ──────────────────────────────────────────── */}
        {deleteError && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 10 }}>
            <span style={{ fontSize: 13, color: "#e24b4a" }}>{deleteError}</span>
            <button
              onClick={() => setDeleteError(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#e24b4a", padding: 2, display: "flex", flexShrink: 0 }}
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
          {[
            { label: "Total files",  value: stats.total,  color: "var(--text-1)" },
            { label: "Images",       value: stats.images, color: "var(--text-1)" },
            { label: "Videos",       value: stats.videos, color: "var(--text-1)" },
            { label: "Used in posts",value: stats.used,   color: "var(--green)"  },
          ].map((s) => (
            <div key={s.label} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px" }}>
              <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500, marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>
                {loading ? "—" : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Filter tabs */}
          <div style={{ display: "flex", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 3, gap: 2 }}>
            {(["all", "image", "video"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ padding: "6px 14px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", background: filter === f ? "var(--surface-4)" : "transparent", color: filter === f ? "var(--text-1)" : "var(--text-3)", transition: "background 0.15s, color 0.15s", textTransform: "capitalize" }}
              >
                {f === "all" ? `All (${stats.total})` : f === "image" ? `Images (${stats.images})` : `Videos (${stats.videos})`}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            style={{ padding: "7px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, color: "var(--text-2)", cursor: "pointer", outline: "none", colorScheme: "dark" }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
          </select>

          <div style={{ flex: 1 }} />

          {/* Bulk delete */}
          {selected.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-2)" }}>{selected.length} selected</span>
              <button
                onClick={deleteSelected}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 9, fontSize: 13, fontWeight: 500, color: "#e24b4a", cursor: "pointer" }}
              >
                <TrashIcon /> Delete
              </button>
              <button
                onClick={() => setSelected([])}
                style={{ padding: "7px 14px", background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 9, fontSize: 13, color: "var(--text-2)", cursor: "pointer" }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Loading skeleton ──────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} style={{ height: 180, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, animation: "pulse 1.4s ease-in-out infinite" }} />
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)" }}>
            <p style={{ fontSize: 32, marginBottom: 10 }}>📭</p>
            <p style={{ fontSize: 15 }}>No {filter !== "all" ? filter + "s" : "files"} yet</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Upload some files to get started</p>
          </div>
        ) : (
          /* ── Grid ─────────────────────────────────────────────────────────── */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
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

      {/* ── Preview modal ──────────────────────────────────────────────────── */}
      {preview && (
        <PreviewModal
          item={preview}
          deleting={deleting === preview.id}
          onClose={() => setPreview(null)}
          onDelete={() => deleteItem(preview)}
        />
      )}

      {/* ── Campaign wizard: goal → frequency → accounts → seasonal → generate ── */}
      <CampaignWizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        media={media}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA CARD
// ─────────────────────────────────────────────────────────────────────────────
function MediaCard({
  item, selected, onSelect, onPreview,
}: {
  item: FirestoreMediaItem;
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "var(--surface-2)",
        border: `1px solid ${selected ? "var(--green)" : hover ? "var(--border-hover)" : "var(--border)"}`,
        borderRadius: 14, overflow: "hidden", cursor: "pointer",
        transition: "border-color 0.15s, transform 0.15s",
        transform: hover ? "translateY(-2px)" : "none",
        position: "relative",
      }}
    >
      {/* Thumbnail */}
      <div
        onClick={onPreview}
        style={{ height: 140, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}
      >
        {/* Real image/video thumbnail */}
        {item.type === "image" && !imgError ? (
          <img
            src={item.cloudinaryUrl}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={() => setImgError(true)}
          />
        ) : item.type === "video" ? (
          <video
            src={item.cloudinaryUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            muted
            preload="metadata"
          />
        ) : (
          <span style={{ fontSize: 40 }}>📷</span>
        )}

        {/* Video badge */}
        {item.type === "video" && (
          <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.65)", borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: 4 }}>
            <PlayIcon /> VIDEO
          </div>
        )}

        {/* Hover overlay */}
        {hover && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(); }}
              style={{ padding: "7px 14px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(6px)" }}
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
          style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, background: selected ? "var(--green)" : "var(--surface-4)", border: `1px solid ${selected ? "var(--green)" : "var(--border-hover)"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s", cursor: "pointer" }}
        >
          {selected && (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0a0e14" strokeWidth="4" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.name}
          </p>
          <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>{item.size}</p>
        </div>
      </div>

      {/* Used badge */}
      {item.usedInPost && (
        <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,201,141,0.15)", border: "1px solid rgba(0,201,141,0.25)", borderRadius: 6, padding: "2px 7px", fontSize: 9, fontWeight: 700, color: "var(--green)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Used
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW MODAL
// ─────────────────────────────────────────────────────────────────────────────
function PreviewModal({
  item, deleting, onClose, onDelete,
}: {
  item: FirestoreMediaItem;
  deleting: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(4px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--surface-2)", border: "1px solid var(--border-hover)", borderRadius: 20, width: "100%", maxWidth: 480, overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 340 }}>{item.name}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4, display: "flex", borderRadius: 6 }}>
            <CloseIcon />
          </button>
        </div>

        {/* Media preview */}
        <div style={{ height: 260, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {item.type === "image" ? (
            <img src={item.cloudinaryUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <video src={item.cloudinaryUrl} controls style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          )}
        </div>

        {/* Meta */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="grid grid-cols-2" style={{ gap: 10 }}>
            {[
              { label: "Type",     value: item.type.charAt(0).toUpperCase() + item.type.slice(1) },
              { label: "Size",     value: item.size },
              { label: "Uploaded", value: new Date(item.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }) },
              { label: "Status",   value: item.usedInPost ? "Used in campaign" : "Not used yet" },
            ].map((m) => (
              <div key={m.label} style={{ background: "var(--surface-3)", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 500, marginBottom: 3 }}>{m.label}</p>
                <p style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500 }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {/* "Use in post" is disabled rather than a dead button — the
                Calendar/campaign flow that would actually consume this media
                doesn't exist yet. This clearly communicates "not yet" instead
                of silently doing nothing when clicked. */}
            <button
              disabled
              title="Coming soon — available once the Calendar campaign flow ships"
              style={{ flex: 1, padding: "11px", background: "var(--surface-4)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "var(--text-3)", cursor: "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              Use in campaign <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: "var(--surface-3)", color: "var(--text-3)" }}>Soon</span>
            </button>
            <button
              onClick={onDelete}
              disabled={deleting}
              style={{ padding: "11px 16px", background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "#e24b4a", cursor: deleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? <Spinner /> : <TrashIcon />}
              {deleting ? "Deleting…" : "Delete"}
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
function UploadProgress({ progress, fileName }: { progress: number; fileName: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: "100%", maxWidth: 320 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--green-muted)", border: "1px solid rgba(0,201,141,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)" }}>
        <UploadIcon />
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>
        {progress < 100 ? `Uploading ${fileName}…` : "Upload complete ✓"}
      </p>
      <div style={{ width: "100%", height: 4, background: "var(--surface-4)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "var(--green)", borderRadius: 2, transition: "width 0.1s" }} />
      </div>
      <p style={{ fontSize: 12, color: "var(--text-3)" }}>{progress}%</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
function UploadIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function PlayIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
}
function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function Spinner() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
}