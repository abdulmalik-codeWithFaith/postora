"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User }           from "firebase/auth";
import { onAuthChange }   from "@/lib/auth";
import { getUser }        from "@/lib/firestore";
import { UserProfile }    from "@/types";

// ─── Context type ─────────────────────────────────────────────────────────────
interface AuthContextType {
  user:        User | null;
  profile:     UserProfile | null;
  loading:     boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user:    null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(firebaseUser: User) {
    try {
      const p = await getUser(firebaseUser.uid);
      setProfile(p);
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }

  async function refreshProfile() {
    if (user) await loadProfile(user);
  }

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadProfile(firebaseUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  return useContext(AuthContext);
}