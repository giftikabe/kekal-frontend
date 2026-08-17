/**
 * Kekal Living — Root Application
 * Wires all admin and storefront routes from F2–F9.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// ── Auth ──────────────────────────────────────────────────────────────────────
import { AuthProvider }              from '@/admin/auth/AuthContext'
import ProtectedRoute                from '@/admin/auth/ProtectedRoute'

// ── Admin shell ───────────────────────────────────────────────────────────────
import { DashboardShell }            from '@/admin/components/layout/DashboardShell'
import { Outlet }                    from 'react-router-dom'

// ── Admin routes ──────────────────────────────────────────────────────────────
import { LoginRoute }                from '@/admin/routes/login'
import AdminDashboard                from '@/admin/routes/dashboard'
import DbManagement                  from '@/admin/routes/db-management/index'
import PagesIndex                    from '@/admin/routes/pages/index'
import PageBuilder                   from '@/admin/routes/pages/[id]/builder'
import BrandIndex                    from '@/admin/routes/brand/index'
import SeoIndex                      from '@/admin/routes/seo/index'
import CommerceIndex                 from '@/admin/routes/commerce/index'

// ── Storefront routes ─────────────────────────────────────────────────────────
import { CartProvider }              from '@/Kekal/context/CartContext'
import Home                          from '@/Kekal/routes/Home'
import SlugPage                      from '@/Kekal/routes/[slug]'
import Cart                          from '@/Kekal/routes/cart'
import Checkout                      from '@/Kekal/routes/checkout'
import OrderConfirmation             from '@/Kekal/routes/order-confirmation'
import ReturnPolicy                  from '@/Kekal/routes/return-policy'
import ShipmentInfo                  from '@/Kekal/routes/shipment-info'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>

            {/* ── Admin: public ── */}
            <Route path="/admin/login" element={<LoginRoute />} />
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

            {/* ── Admin: protected, rendered inside DashboardShell ── */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <DashboardShell>
                    <Outlet />
                  </DashboardShell>
                </ProtectedRoute>
              }
            >
              <Route path="dashboard"         element={<AdminDashboard />} />
              <Route path="db-management"     element={<DbManagement />} />
              <Route path="pages"             element={<PagesIndex />} />
              <Route path="pages/:id/builder" element={<PageBuilder />} />
              <Route path="brand"             element={<BrandIndex />} />
              <Route path="seo"               element={<SeoIndex />} />
              <Route path="commerce"          element={<CommerceIndex />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* ── Storefront ── */}
            <Route path="/"                   element={<Home />} />
            <Route path="/cart"               element={<Cart />} />
            <Route path="/checkout"           element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/return-policy"      element={<ReturnPolicy />} />
            <Route path="/shipment-info"      element={<ShipmentInfo />} />
            {/* Dynamic slug — must be last */}
            <Route path="/:slug"              element={<SlugPage />} />

          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}