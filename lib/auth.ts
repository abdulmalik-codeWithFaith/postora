import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { UserProfile } from "@/types";

// ─── Sign up with email + password ────────────────────────────────────────────
export async function signUp(name: string, email: string, password: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user       = credential.user;

  // Update display name
  await updateProfile(user, { displayName: name });

  // Create user document in Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid:        user.uid,
    name,
    email,
    plan:       "Starter",
    status:     "active",
    postsUsed:  0,
    aiUsed:     0,
    platforms:  [],
    isAdmin:    false,
    createdAt:  serverTimestamp(),
  });

  return user;
}

// ─── Sign in with email + password ────────────────────────────────────────────
export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// ─── Sign in with Google ──────────────────────────────────────────────────────
export async function signInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  const user       = credential.user;

  // Check if user doc already exists
  const userRef  = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  // Create doc only on first Google sign-in
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid:       user.uid,
      name:      user.displayName ?? "",
      email:     user.email ?? "",
      plan:      "Starter",
      status:    "active",
      postsUsed: 0,
      aiUsed:    0,
      platforms: [],
      photoURL:  user.photoURL ?? "",
      isAdmin:   false,
      createdAt: serverTimestamp(),
    });
  }

  return user;
}

// ─── Sign out ─────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ─── Forgot password ──────────────────────────────────────────────────────────
export async function forgotPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// ─── Get user profile from Firestore ─────────────────────────────────────────
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    uid,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  } as UserProfile;
}

// ─── Auth state listener ──────────────────────────────────────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}