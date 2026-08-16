import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/admin/auth/AuthContext";
import type { AdminRole } from "@/shared/types/admin";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AdminRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { admin, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xs uppercase tracking-widest text-gray-400">Checking session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && admin && !allowedRoles.includes(admin.role)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-lg font-semibold">Not permitted</p>
        <p className="max-w-sm text-sm text-gray-500">
          Your role ({admin.role.replace("_", " ")}) doesn't have access to this section.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;