// ─── User ─────────────────────────────────────────────────────────────────────
export type Plan   = "Starter" | "Pro" | "Elite";
export type Status = "active" | "suspended" | "pending";

export interface UserProfile {
  uid:           string;
  name:          string;
  email:         string;
  plan:          Plan;
  status:        Status;
  business?:     string;
  website?:      string;
  bio?:          string;
  photoURL?:     string;
  postsUsed:     number;
  aiUsed:        number;
  platforms:     string[];
  createdAt:     string; // ISO string
  isAdmin?:      boolean;
}

// ─── Post ─────────────────────────────────────────────────────────────────────
export type PostStatus   = "published" | "scheduled" | "failed" | "draft";
export type PlatformName = "Instagram" | "TikTok" | "Facebook";

export interface Post {
  id:           string;
  userId:       string;
  caption:      string;
  platforms:    PlatformName[];
  status:       PostStatus;
  scheduledAt:  string | null; // ISO string
  publishedAt?: string | null;
  mediaId?:     string | null;
  mediaUrl?:    string | null;
  mediaEmoji?:  string;
  failReason?:  string | null;
  reach?:       number;
  likes?:       number;
  createdAt:    string;
}

// ─── Media ────────────────────────────────────────────────────────────────────
export type MediaType = "image" | "video";

export interface MediaItem {
  id:                 string;
  userId:             string;
  name:               string;
  type:               MediaType;
  size:               string;
  cloudinaryUrl:      string;
  cloudinaryPublicId: string;
  usedInPost:         boolean;
  createdAt:          string;
}

// ─── Caption ──────────────────────────────────────────────────────────────────
export type Tone = "professional" | "fun" | "inspirational" | "promotional";

export interface Caption {
  id:         string;
  userId:     string;
  mediaId?:   string;
  platform:   PlatformName;
  tone:       Tone;
  text:       string;
  hashtags:   string[];
  saved:      boolean;
  createdAt:  string;
}

// ─── Connected Account ────────────────────────────────────────────────────────
export type ConnectState = "connected" | "disconnected" | "error";

export interface ConnectedAccount {
  id:          string;
  userId:      string;
  platform:    PlatformName;
  handle:      string;
  followers:   string;
  accessToken: string;
  state:       ConnectState;
  connectedAt: string;
}

// ─── Plan ─────────────────────────────────────────────────────────────────────
export interface PlanConfig {
  id:            string;
  name:          Plan;
  price:         number;
  period:        string;
  description:   string;
  platforms:     number;
  postsPerMonth: number | "Unlimited";
  aiCaptions:    number | "Unlimited";
  features:      string[];
  active:        boolean;
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  postsPublished:  number;
  postsScheduled:  number;
  mediaCount:      number;
  aiCaptionsUsed:  number;
  aiCaptionsLimit: number | "Unlimited";
  postsLimit:      number | "Unlimited";
}