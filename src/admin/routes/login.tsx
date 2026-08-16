/**
 * Kekal Living Admin — Login Route Placeholder
 *
 * F2 (Admin Shell & Auth) replaces this with the real login form wired to
 * AuthContext and the /api/auth/login endpoint.
 */

import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const navigate = useNavigate()

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img
          src="/logo/KEKAL_logomark_black_on_white.jpg"
          alt="Kekal Living"
          style={styles.logo}
        />
        <h1 style={styles.title}>Admin Access</h1>
        <p style={styles.subtitle}>
          Authentication is wired in F2. This is the routing placeholder.
        </p>
        <button style={styles.btn} onClick={() => navigate('/admin/dashboard')}>
          Continue to Dashboard →
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--kk-gray-50)',
    fontFamily: 'var(--kk-font-sans)',
  },
  card: {
    background: 'var(--kk-white)',
    border: '1px solid var(--kk-gray-200)',
    borderRadius: '4px',
    padding: '3rem',
    maxWidth: '24rem',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  logo: { height: '3rem', width: 'auto', marginBottom: '0.5rem' },
  title: {
    fontFamily: 'var(--kk-font-display)',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--kk-black)',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--kk-gray-500)',
    lineHeight: 1.6,
    margin: 0,
  },
  btn: {
    marginTop: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'var(--kk-black)',
    color: 'var(--kk-white)',
    border: 'none',
    borderRadius: '2px',
    fontFamily: 'var(--kk-font-sans)',
    fontSize: '0.875rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    width: '100%',
  },
}
