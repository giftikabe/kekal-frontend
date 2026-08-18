import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiClient, ApiError, getAccessToken, setTokens } from "@/shared/api/client";
import type { Admin } from "@/shared/types/admin";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextValue {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      if (!getAccessToken()) { setIsLoading(false); return; }
      try {
        const me = await apiClient.get<Admin>("/api/auth/me");
        if (!cancelled) setAdmin(me);
      } catch {
        if (!cancelled) { setTokens(null, null); setAdmin(null); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    checkSession();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, refreshToken } = await apiClient.post<LoginResponse>(
      "/api/auth/login", { email, password }, { skipAuthRetry: true },
    );
    setTokens(accessToken, refreshToken);
    const me = await apiClient.get<Admin>("/api/auth/me");
    setAdmin(me);
  }, []);

  const logout = useCallback(() => {
    apiClient.post("/api/auth/logout", undefined, { skipAuthRetry: true }).catch(() => {});
    setTokens(null, null);
    setAdmin(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ admin, isLoading, isAuthenticated: admin !== null, login, logout }),
    [admin, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { ApiError };

