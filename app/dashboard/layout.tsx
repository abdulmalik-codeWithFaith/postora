import Sidebar from "@/components/dashboard/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard redirectTo="/login">
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--surface)" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "auto" }}>
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}