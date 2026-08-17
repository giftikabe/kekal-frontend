import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/admin/auth/AuthContext";
import { ApiError } from "@/shared/api/client";
import { Logomark } from "@/shared/theme/Logomark";

export function LoginRoute() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? "/admin/dashboard";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("That email and password don't match.");
      } else {
        setError("Couldn't sign in. Check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-6">
      {/* Oversized watermark monogram — the one bold gesture on an otherwise quiet screen. */}
      <div className="pointer-events-none absolute -right-24 -top-24 opacity-[0.04]" aria-hidden="true">
        <Logomark size={480} />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-4">
          <Logomark size={40} animated />
          <div className="text-center">
            <h1 className="font-display text-xl font-semibold tracking-tight text-ink">Kekal Living</h1>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Admin</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-line bg-paper px-3 py-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-ink"
              placeholder="you@kekalliving.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-line bg-paper px-3 py-2.5 font-body text-sm text-ink outline-none transition-colors focus:border-ink"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="border border-ink bg-ink px-3 py-2 font-mono text-xs text-paper">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 bg-ink px-4 py-2.5 font-body text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
