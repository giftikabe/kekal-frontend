import type { ReactNode } from "react";
import { useAuth } from "@/admin/auth/AuthContext";
import { Sidebar } from "@/admin/components/layout/Sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { admin, logout } = useAuth();

  return (
    <div className="flex h-screen bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-end border-b border-line px-6">
          <div className="flex items-center gap-4">
            {admin && (
              <span className="font-mono text-xs text-muted" title={admin.role.replace("_", " ")}>
                {admin.email}
              </span>
            )}
            <button
              type="button"
              onClick={logout}
              className="border border-line px-3 py-1.5 font-body text-xs text-ink transition-colors hover:border-ink"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
