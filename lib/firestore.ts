import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  UserProfile,
  Post,
  MediaItem,
  Caption,
  DashboardStats,
  PostStatus,
  PlatformName,
  Tone,
} from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toDate(val: Timestamp | string | null | undefined): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Timestamp) return val.toDate().toISOString();
  return val;
}

// ═════════════════════════════════════════════════════════════════════════════
// USER
// ═════════════════════════════════════════════════════════════════════════════

export async function getUser(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { ...d, uid, createdAt: toDate(d.createdAt) } as UserProfile;
}

export async function updateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id, createdAt: toDate(d.data().createdAt) } as UserProfile));
}

// ═════════════════════════════════════════════════════════════════════════════
// POSTS
// ═════════════════════════════════════════════════════════════════════════════

export async function getUserPosts(uid: string): Promise<Post[]> {
  const q    = query(collection(db, "posts"), where("userId", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id:          d.id,
      scheduledAt: toDate(data.scheduledAt),
      publishedAt: toDate(data.publishedAt),
      createdAt:   toDate(data.createdAt),
    } as Post;
  });
}

export async function getRecentUserPosts(uid: string, count = 4): Promise<Post[]> {
  const q    = query(collection(db, "posts"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, scheduledAt: toDate(data.scheduledAt), publishedAt: toDate(data.publishedAt), createdAt: toDate(data.createdAt) } as Post;
  });
}

export async function getScheduledPosts(uid: string): Promise<Post[]> {
  const q    = query(collection(db, "posts"), where("userId", "==", uid), where("status", "==", "scheduled"), orderBy("scheduledAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, scheduledAt: toDate(data.scheduledAt), createdAt: toDate(data.createdAt) } as Post;
  });
}

export async function createPost(uid: string, data: Omit<Post, "id" | "userId" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "posts"), {
    ...data,
    userId:     uid,
    createdAt:  serverTimestamp(),
    scheduledAt: data.scheduledAt ? Timestamp.fromDate(new Date(data.scheduledAt)) : null,
  });
  // Increment user postsUsed if publishing
  if (data.status === "published") {
    await updateDoc(doc(db, "users", uid), { postsUsed: increment(1) });
  }
  return ref.id;
}

export async function updatePost(postId: string, data: Partial<Post>): Promise<void> {
  await updateDoc(doc(db, "posts", postId), { ...data, updatedAt: serverTimestamp() });
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(db, "posts", postId));
}

export async function getAllPosts(): Promise<Post[]> {
  const snap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, scheduledAt: toDate(data.scheduledAt), createdAt: toDate(data.createdAt) } as Post;
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// MEDIA
// ═════════════════════════════════════════════════════════════════════════════

export async function getUserMedia(uid: string): Promise<MediaItem[]> {
  const q    = query(collection(db, "media"), where("userId", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, createdAt: toDate(data.createdAt) } as MediaItem;
  });
}

export async function addMediaRecord(uid: string, data: Omit<MediaItem, "id" | "userId" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, "media"), {
    ...data,
    userId:    uid,
    usedInPost: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteMediaRecord(mediaId: string): Promise<void> {
  await deleteDoc(doc(db, "media", mediaId));
}

export async function markMediaUsed(mediaId: string, used: boolean): Promise<void> {
  await updateDoc(doc(db, "media", mediaId), { usedInPost: used });
}

// ═════════════════════════════════════════════════════════════════════════════
// CAPTIONS
// ═════════════════════════════════════════════════════════════════════════════

export async function getSavedCaptions(uid: string): Promise<Caption[]> {
  const q    = query(collection(db, "captions"), where("userId", "==", uid), where("saved", "==", true), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return { ...data, id: d.id, createdAt: toDate(data.createdAt) } as Caption;
  });
}

export async function saveCaption(uid: string, data: {
  mediaId?: string;
  platform: PlatformName;
  tone: Tone;
  text: string;
  hashtags: string[];
}): Promise<string> {
  const ref = await addDoc(collection(db, "captions"), {
    ...data,
    userId:    uid,
    saved:     true,
    createdAt: serverTimestamp(),
  });
  // Increment aiUsed on user
  await updateDoc(doc(db, "users", uid), { aiUsed: increment(1) });
  return ref.id;
}

export async function deleteCaption(captionId: string): Promise<void> {
  await deleteDoc(doc(db, "captions", captionId));
}

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═════════════════════════════════════════════════════════════════════════════

export async function getDashboardStats(uid: string, plan: string): Promise<DashboardStats> {
  const PLAN_LIMITS: Record<string, { posts: number | "Unlimited"; ai: number | "Unlimited" }> = {
    Starter: { posts: 10,           ai: 20           },
    Pro:     { posts: 30,           ai: 100          },
    Elite:   { posts: "Unlimited",  ai: "Unlimited"  },
  };

  const [posts, media, user] = await Promise.all([
    getUserPosts(uid),
    getUserMedia(uid),
    getUser(uid),
  ]);

  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.Starter;

  return {
    postsPublished:  posts.filter((p) => p.status === "published").length,
    postsScheduled:  posts.filter((p) => p.status === "scheduled").length,
    mediaCount:      media.length,
    aiCaptionsUsed:  user?.aiUsed    ?? 0,
    aiCaptionsLimit: limits.ai,
    postsLimit:      limits.posts,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// SUPPORT TICKETS
// ═════════════════════════════════════════════════════════════════════════════

export async function createTicket(uid: string, data: {
  subject:  string;
  category: string;
  message:  string;
  email:    string;
}): Promise<string> {
  const ref = await addDoc(collection(db, "tickets"), {
    ...data,
    userId:    uid,
    status:    "open",
    priority:  "medium",
    messages:  [{ author: data.email, role: "user", text: data.message, time: new Date().toISOString() }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// ═════════════════════════════════════════════════════════════════════════════
// CONNECTED ACCOUNTS
// ═════════════════════════════════════════════════════════════════════════════

export async function getConnectedAccounts(uid: string) {
  const q    = query(collection(db, "connectedAccounts"), where("userId", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

export async function saveConnectedAccount(uid: string, data: {
  platform:       string;
  handle:         string;
  avatar:         string;
  followers:      string;
  postsPublished: number;
  lastPost:       string;
  state:          string;
  accessToken?:   string;
}): Promise<string> {
  // Check if account for this platform already exists
  const q    = query(collection(db, "connectedAccounts"), where("userId", "==", uid), where("platform", "==", data.platform));
  const snap = await getDocs(q);

  if (!snap.empty) {
    // Update existing
    const docId = snap.docs[0].id;
    await updateDoc(doc(db, "connectedAccounts", docId), { ...data, updatedAt: serverTimestamp() });
    // Also update platforms array on user doc
    await updateDoc(doc(db, "users", uid), { platforms: data.state === "connected"
      ? [...new Set([...(await getUser(uid))?.platforms ?? [], data.platform])]
      : ((await getUser(uid))?.platforms ?? []).filter((p: string) => p !== data.platform)
    });
    return docId;
  }

  // Create new
  const ref = await addDoc(collection(db, "connectedAccounts"), {
    ...data,
    userId:    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // Add to user platforms array
  const user = await getUser(uid);
  if (user && data.state === "connected") {
    await updateDoc(doc(db, "users", uid), {
      platforms: [...new Set([...(user.platforms ?? []), data.platform])],
    });
  }
  return ref.id;
}

export async function disconnectAccount(uid: string, platform: string): Promise<void> {
  const q    = query(collection(db, "connectedAccounts"), where("userId", "==", uid), where("platform", "==", platform));
  const snap = await getDocs(q);
  if (!snap.empty) {
    await updateDoc(doc(db, "connectedAccounts", snap.docs[0].id), {
      state:       "disconnected",
      handle:      "",
      avatar:      "",
      followers:   "",
      accessToken: "",
      updatedAt:   serverTimestamp(),
    });
  }
  // Remove from user platforms array
  const user = await getUser(uid);
  if (user) {
    await updateDoc(doc(db, "users", uid), {
      platforms: (user.platforms ?? []).filter((p: string) => p !== platform),
    });
  }
}

export async function getUserTickets(uid: string) {
  const q    = query(collection(db, "tickets"), where("userId", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

export async function getAllTickets() {
  const snap = await getDocs(query(collection(db, "tickets"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

export async function updateTicket(ticketId: string, data: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(db, "tickets", ticketId), { ...data, updatedAt: serverTimestamp() });
}