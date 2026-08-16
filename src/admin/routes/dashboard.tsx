/**
 * Kekal Living Admin — Dashboard Route Placeholder
 *
 * F2 (Admin Shell & Auth) replaces this with DashboardShell + ProtectedRoute
 * wrapping all /admin/* routes. This placeholder confirms routing works.
 */

import { useNavigate } from 'react-router-dom'

const ADMIN_SECTIONS = [
  { label: 'DB Management', path: '/admin/db-management', description: 'Custom tables and data' },
  { label: 'Pages',         path: '/admin/pages',         description: 'Page builder' },
  { label: 'Brand',         path: '/admin/brand',         description: 'Identity and nav' },
  { label: 'SEO',           path: '/admin/seo',           description: 'Metadata and structured data' },
  { label: 'Commerce',      path: '/admin/commerce',      description: 'Orders and Chapa settings' },
] as const

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <img
            src="/logo/KEKAL_logomark_black_on_white.jpg"
            alt="Kekal Living"
            style={styles.logo}
          />
          <span style={styles.sidebarTitle}>Admin</span>
        </div>
        <nav style={styles.sidebarNav}>
          {ADMIN_SECTIONS.map((s) => (
            <button key={s.path} style={styles.navItem} onClick={() => navigate(s.path)}>
              {s.label}
            </button>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <button style={styles.logoutBtn} onClick={() => navigate('/admin/login')}>
            Log out
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.topbar}>
          <h1 style={styles.heading}>Dashboard</h1>
          <span style={styles.adminPill}>admin@kekal.com</span>
        </header>

        <section style={styles.grid}>
          {ADMIN_SECTIONS.map((s) => (
            <button
              key={s.path}
              style={styles.tile}
              onClick={() => navigate(s.path)}
            >
              <span style={styles.tileLabel}>{s.label}</span>
              <span style={styles.tileDesc}>{s.description}</span>
            </button>
          ))}
        </section>

        <p style={styles.note}>
          Full shell (sidebar auth, protected routes, DashboardShell) is wired in F2.
        </p>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'var(--kk-font-sans)',
    color: 'var(--kk-black)',
    background: 'var(--kk-gray-50)',
  },
  sidebar: {
    width: '15rem',
    background: 'var(--kk-black)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.5rem',
    borderBottom: '1px solid var(--kk-gray-800)',
  },
  logo: { height: '2rem', width: 'auto', borderRadius: '2px' },
  sidebarTitle: {
    fontFamily: 'var(--kk-font-sans)',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--kk-gray-400)',
  },
  sidebarNav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem 0',
  },
  navItem: {
    background: 'none',
    border: 'none',
    color: 'var(--kk-gray-300)',
    textAlign: 'left',
    padding: '0.625rem 1.5rem',
    fontFamily: 'var(--kk-font-sans)',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'color 150ms ease, background 150ms ease',
  },
  sidebarFooter: { padding: '1.5rem' },
  logoutBtn: {
    background: 'none',
    border: '1px solid var(--kk-gray-700)',
    color: 'var(--kk-gray-400)',
    width: '100%',
    padding: '0.5rem',
    borderRadius: '2px',
    fontFamily: 'var(--kk-font-sans)',
    fontSize: '0.8125rem',
    cursor: 'pointer',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column' },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem 2rem',
    background: 'var(--kk-white)',
    borderBottom: '1px solid var(--kk-gray-200)',
  },
  heading: {
    fontFamily: 'var(--kk-font-display)',
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: 0,
  },
  adminPill: {
    fontSize: '0.8125rem',
    color: 'var(--kk-gray-500)',
    background: 'var(--kk-gray-100)',
    padding: '0.375rem 0.75rem',
    borderRadius: '9999px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))',
    gap: '1rem',
    padding: '2rem',
  },
  tile: {
    background: 'var(--kk-white)',
    border: '1px solid var(--kk-gray-200)',
    borderRadius: '4px',
    padding: '1.5rem',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  tileLabel: { fontWeight: 600, fontSize: '0.9375rem', color: 'var(--kk-black)' },
  tileDesc:  { fontSize: '0.8125rem', color: 'var(--kk-gray-500)' },
  note: {
    margin: '0 2rem 2rem',
    fontSize: '0.8125rem',
    color: 'var(--kk-gray-400)',
    fontStyle: 'italic',
  },
}
