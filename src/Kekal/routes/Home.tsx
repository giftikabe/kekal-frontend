/**
 * Kekal Living — Storefront Home Placeholder
 *
 * F4 (Storefront Renderer) replaces this with the dynamic slug-based renderer.
 * This placeholder confirms routing works and provides a visual reference for
 * the brand's monochrome aesthetic.
 */

export default function StorefrontHome() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logoWrap}>
          <img
            src="/logo/KEKAL_logomark_black_on_white.jpg"
            alt="Kekal Living"
            style={styles.logo}
          />
        </div>
        <nav style={styles.nav}>
          <span style={styles.navItem}>Home</span>
          <span style={styles.navItem}>Shop</span>
          <span style={styles.navItem}>About</span>
        </nav>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <p style={styles.eyebrow}>Kekal Living</p>
          <h1 style={styles.headline}>Built for the&nbsp;Enduring.</h1>
          <p style={styles.subline}>
            The storefront will render here once the backend is live and pages
            are published via the admin dashboard.
          </p>
        </section>
      </main>

      <footer style={styles.footer}>
        <span style={styles.footerText}>© {new Date().getFullYear()} Kekal Living</span>
      </footer>
    </div>
  )
}

// Inline styles mirror design tokens — avoids any Tailwind dependency at this
// placeholder stage so the file is self-contained.
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--kk-font-sans)',
    color: 'var(--kk-black)',
    background: 'var(--kk-white)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem 3rem',
    borderBottom: '1px solid var(--kk-gray-200)',
  },
  logoWrap: { display: 'flex', alignItems: 'center' },
  logo: { height: '2.5rem', width: 'auto', objectFit: 'contain' },
  nav: { display: 'flex', gap: '2rem' },
  navItem: {
    fontFamily: 'var(--kk-font-sans)',
    fontSize: '0.875rem',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    color: 'var(--kk-gray-700)',
  },
  main: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  hero: {
    maxWidth: '40rem',
    textAlign: 'center',
    padding: '6rem 2rem',
  },
  eyebrow: {
    fontFamily: 'var(--kk-font-sans)',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    color: 'var(--kk-gray-500)',
    marginBottom: '1rem',
  },
  headline: {
    fontFamily: 'var(--kk-font-display)',
    fontSize: '3.75rem',
    fontWeight: 900,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    marginBottom: '1.5rem',
    color: 'var(--kk-black)',
  },
  subline: {
    fontFamily: 'var(--kk-font-sans)',
    fontSize: '1.125rem',
    lineHeight: 1.7,
    color: 'var(--kk-gray-500)',
  },
  footer: {
    padding: '2rem 3rem',
    borderTop: '1px solid var(--kk-gray-200)',
    display: 'flex',
    justifyContent: 'center',
  },
  footerText: {
    fontFamily: 'var(--kk-font-sans)',
    fontSize: '0.75rem',
    color: 'var(--kk-gray-400)',
    letterSpacing: '0.08em',
  },
}
