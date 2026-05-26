"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = "/login" }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Postora logo */}
        <div
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: "var(--green)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0e14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>

        {/* Spinner */}
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"
          style={{ animation: "spin 0.8s linear infinite" }}
        >
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>

        <p style={{ fontSize: 13, color: "var(--text-3)" }}>Loading…</p>
      </div>
    );
  }

  // Not authenticated — render nothing (redirect is in progress)
  if (!user) return null;

  return <>{children}</>;
}