/**
 * Kekal Living — Root Application
 *
 * Two top-level routing areas:
 *   /admin/* — CMS dashboard (src/admin/)
 *   /*       — Public storefront (src/Kekal/)
 *
 * Auth, page rendering, and feature-specific routes are wired by later parts
 * (F2–F9). This file only establishes the routing shell.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// ── Kekal (storefront) placeholders ──────────────────────────────────────────
import StorefrontHome from '@/Kekal/routes/Home'

// ── Admin placeholders ────────────────────────────────────────────────────────
import AdminLogin     from '@/admin/routes/login'
import AdminDashboard from '@/admin/routes/dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Admin area ── */}
        <Route path="/admin/login"     element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        {/* Redirect bare /admin to login — F2 will replace with ProtectedRoute */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

        {/* ── Public storefront ── */}
        <Route path="/" element={<StorefrontHome />} />

        {/*
          Dynamic slug route added by F4:
          <Route path="/:slug" element={<SlugPage />} />
        */}
      </Routes>
    </BrowserRouter>
  )
}
